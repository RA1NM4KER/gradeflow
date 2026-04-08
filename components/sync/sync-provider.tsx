"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/supabase-browser";
import {
  clearPasswordRecoverySession,
  getCurrentSyncSession,
  markPasswordRecoverySession,
  requestPasswordResetForEmail,
  signInWithEmailPassword,
  signOutFromSync,
  signUpWithEmailPassword,
} from "@/lib/sync/sync-auth";
import { deleteCurrentAccount } from "@/lib/supabase/delete-account";
import {
  enqueueLocalSyncOperation,
  syncWithServer,
} from "@/lib/sync/sync-engine";
import {
  listPendingSyncOperations,
  loadSyncMeta,
  resetLocalSyncState,
  saveSyncMeta,
} from "@/lib/sync/sync-storage";
import {
  SyncAdapter,
  SyncMetaRecord,
  SyncOperation,
  SyncStatus,
} from "@/lib/sync/types";
import { AppState } from "@/lib/app/types";

interface SyncConnectionContextValue {
  errorMessage: string | null;
  isAuthenticated: boolean;
  isConfigured: boolean;
  isReady: boolean;
  isRestoringSession: boolean;
  isSyncEnabled: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  session: Session | null;
  statusNotice: string | null;
  status: SyncStatus;
  user: User | null;
  enqueueOperation: (
    baseState: AppState,
    operation: SyncOperation,
    nextMeta?: SyncMetaRecord,
  ) => Promise<void>;
  registerSyncAdapter: (adapter: SyncAdapter | null) => void;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; errorMessage: string | null }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ ok: boolean; errorMessage: string | null }>;
  requestPasswordReset: (
    email: string,
  ) => Promise<{ ok: boolean; errorMessage: string | null }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; errorMessage: string | null }>;
  syncNow: () => Promise<void>;
}

type SyncTriggerReason =
  | "manual"
  | "session-ready"
  | "focus"
  | "online"
  | "local-change";

const SyncConnectionContext = createContext<SyncConnectionContextValue | null>(
  null,
);
const AUTH_REQUEST_TIMEOUT_MS = 15000;
const AUTO_SYNC_COOLDOWN_MS = 8000;
const LOCAL_CHANGE_FLUSH_DELAY_MS = 350;

function getOnlineState() {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return await new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(
        new Error(
          "GradeLog could not reach the connected-devices service. Check your connection and try again.",
        ),
      );
    }, timeoutMs);

    void promise.then(
      (value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

function resolveSyncStatus({
  hasError,
  isAuthenticated,
  isBusy,
  isOnline,
}: {
  hasError: boolean;
  isAuthenticated: boolean;
  isBusy: boolean;
  isOnline: boolean;
}): SyncStatus {
  if (hasError) {
    return "error";
  }

  if (isBusy) {
    return "connecting";
  }

  if (!isAuthenticated) {
    return "local-only";
  }

  if (!isOnline) {
    return "offline-pending";
  }

  return "up-to-date";
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const [syncMeta, setSyncMeta] = useState<SyncMetaRecord | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isOnline, setIsOnline] = useState(getOnlineState);
  const [isReady, setIsReady] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const configured = isSupabaseConfigured();
  const [syncAdapter, setSyncAdapter] = useState<SyncAdapter | null>(null);
  const syncInFlightRef = useRef(false);
  const syncQueuedAfterInflightRef = useRef(false);
  const syncMetaRef = useRef<SyncMetaRecord | null>(null);
  const autoSyncedUserIdRef = useRef<string | null>(null);
  const pendingFlushTimerRef = useRef<number | null>(null);

  useEffect(() => {
    syncMetaRef.current = syncMeta;
  }, [syncMeta]);

  const syncMetaState = useCallback((nextMeta: SyncMetaRecord) => {
    syncMetaRef.current = nextMeta;
    setSyncMeta(nextMeta);
  }, []);

  const updateSyncMeta = useCallback(
    async (updater: (current: SyncMetaRecord) => SyncMetaRecord) => {
      const currentMeta = await loadSyncMeta();
      const nextMeta = updater(currentMeta);
      syncMetaState(nextMeta);
      void saveSyncMeta(nextMeta).catch((error) => {
        console.error("Failed to persist sync metadata.", error);
      });
      return nextMeta;
    },
    [syncMetaState],
  );

  const refreshSyncMeta = useCallback(async () => {
    const latestMeta = await loadSyncMeta();
    syncMetaState(latestMeta);
    return latestMeta;
  }, [syncMetaState]);

  const applyAuthState = useCallback(
    async (nextSession: Session | null, nextErrorMessage: string | null) => {
      const authenticated = Boolean(nextSession?.user);
      setSession(nextSession);
      setErrorMessage(nextErrorMessage);

      await updateSyncMeta((currentMeta) => ({
        ...currentMeta,
        connectedUserId: authenticated ? (nextSession?.user.id ?? null) : null,
        lastSyncError: nextErrorMessage,
        status: resolveSyncStatus({
          hasError: Boolean(nextErrorMessage),
          isAuthenticated: authenticated,
          isBusy: false,
          isOnline,
        }),
        syncEnabled: authenticated,
      }));

      if (!authenticated) {
        setStatusNotice(null);
      }
    },
    [isOnline, updateSyncMeta],
  );

  useEffect(() => {
    let cancelled = false;
    let restoreHintTimer: number | null = null;

    async function hydrateSyncState() {
      const storedMeta = await loadSyncMeta();

      if (cancelled) {
        return;
      }

      setSyncMeta(storedMeta);

      if (!configured) {
        setIsReady(true);
        return;
      }

      const expectsExistingSession = storedMeta.syncEnabled;

      if (!expectsExistingSession) {
        // No prior connected state means the signed-out UI can be shown
        // immediately while Supabase checks storage in the background.
        setIsReady(true);
      } else {
        restoreHintTimer = window.setTimeout(() => {
          if (!cancelled) {
            setIsRestoringSession(true);
          }
        }, 250);
      }

      try {
        const nextSession = await getCurrentSyncSession();

        if (cancelled) {
          return;
        }

        await applyAuthState(nextSession, null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "GradeLog could not restore the connected-devices session.";
        await applyAuthState(null, message);
      } finally {
        if (!cancelled) {
          if (restoreHintTimer !== null) {
            window.clearTimeout(restoreHintTimer);
          }

          setIsRestoringSession(false);
          setIsReady(true);
        }
      }
    }

    void hydrateSyncState();

    return () => {
      cancelled = true;

      if (restoreHintTimer !== null) {
        window.clearTimeout(restoreHintTimer);
      }
    };
  }, [applyAuthState, configured]);

  const setStatus = useCallback(
    async (status: SyncStatus) => {
      await updateSyncMeta((currentMeta) => ({
        ...currentMeta,
        status,
      }));
    },
    [updateSyncMeta],
  );

  useEffect(() => {
    function syncOnlineState(nextOnline: boolean) {
      setIsOnline(nextOnline);
      void loadSyncMeta().then((currentMeta) => {
        const nextMeta = {
          ...currentMeta,
          status: resolveSyncStatus({
            hasError: Boolean(errorMessage),
            isAuthenticated: Boolean(session?.user),
            isBusy,
            isOnline: nextOnline,
          }),
        };

        syncMetaState(nextMeta);
        void saveSyncMeta(nextMeta);
      });
    }

    const handleOnline = () => syncOnlineState(true);
    const handleOffline = () => syncOnlineState(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [errorMessage, isBusy, session, syncMetaState]);

  useEffect(() => {
    if (!configured) {
      return;
    }

    const client = getSupabaseBrowserClient();

    if (!client) {
      return;
    }

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") {
        markPasswordRecoverySession();
      }

      if (event === "SIGNED_OUT") {
        clearPasswordRecoverySession();
      }

      void applyAuthState(nextSession, null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [applyAuthState, configured]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsBusy(true);
      await updateSyncMeta((currentMeta) => ({
        ...currentMeta,
        lastSyncError: null,
        status: "connecting",
      }));

      try {
        const { data, error } = await withTimeout(
          signInWithEmailPassword(email, password),
          AUTH_REQUEST_TIMEOUT_MS,
        );

        if (error) {
          const message = error.message;
          await applyAuthState(null, message);
          return { ok: false, errorMessage: message };
        }

        if (!data.session) {
          const message =
            "GradeLog could not finish signing you in on this device. Try again.";
          await applyAuthState(null, message);
          return { ok: false, errorMessage: message };
        }

        await applyAuthState(data.session, null);
        return { ok: true, errorMessage: null };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "GradeLog could not sign you in for connected devices.";
        await applyAuthState(null, message);
        return { ok: false, errorMessage: message };
      } finally {
        setIsBusy(false);
      }
    },
    [applyAuthState, updateSyncMeta],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      setIsBusy(true);
      await updateSyncMeta((currentMeta) => ({
        ...currentMeta,
        lastSyncError: null,
        status: "connecting",
      }));

      try {
        const { data, error } = await withTimeout(
          signUpWithEmailPassword(email, password),
          AUTH_REQUEST_TIMEOUT_MS,
        );

        if (error) {
          const message = error.message;
          await applyAuthState(null, message);
          return { ok: false, errorMessage: message };
        }

        if (!data.session) {
          const message =
            "Your account was created, but this device is not signed in yet. Check your auth settings and try again.";
          await applyAuthState(null, message);
          return {
            ok: false,
            errorMessage: message,
          };
        }

        await applyAuthState(data.session, null);
        return { ok: true, errorMessage: null };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "GradeLog could not create your connected-devices account.";
        await applyAuthState(null, message);
        return { ok: false, errorMessage: message };
      } finally {
        setIsBusy(false);
      }
    },
    [applyAuthState, updateSyncMeta],
  );

  const signOut = useCallback(async () => {
    setIsBusy(true);

    try {
      const { error } = await signOutFromSync();

      if (error) {
        const message = error.message;
        await applyAuthState(session, message);
        return;
      }

      await applyAuthState(null, null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "GradeLog could not disconnect this device.";
      await applyAuthState(session, message);
    } finally {
      setIsBusy(false);
    }
  }, [applyAuthState, session]);

  const deleteAccount = useCallback(async () => {
    setIsBusy(true);

    try {
      await deleteCurrentAccount();

      try {
        await signOutFromSync();
      } catch {
        // Local session cleanup still happens below even if Auth no longer
        // accepts the token because the user was deleted first.
      }

      const nextMeta = await resetLocalSyncState();
      syncMetaState(nextMeta);
      clearPasswordRecoverySession();
      setSession(null);
      setErrorMessage(null);
      setStatusNotice(
        "Your cloud account was deleted. This device is now back to local-only storage.",
      );
      return { ok: true, errorMessage: null };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "GradeLog could not delete your account.";
      return { ok: false, errorMessage: message };
    } finally {
      setIsBusy(false);
    }
  }, [syncMetaState]);

  const requestPasswordReset = useCallback(async (email: string) => {
    setIsBusy(true);

    try {
      const { error } = await withTimeout(
        requestPasswordResetForEmail(email),
        AUTH_REQUEST_TIMEOUT_MS,
      );

      if (error) {
        return { ok: false, errorMessage: error.message };
      }

      return { ok: true, errorMessage: null };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "GradeLog could not send the password reset email.";
      return { ok: false, errorMessage: message };
    } finally {
      setIsBusy(false);
    }
  }, []);

  const runSyncNow = useCallback(
    async (reason: SyncTriggerReason) => {
      if (!syncAdapter) {
        return;
      }

      if (syncInFlightRef.current) {
        if (reason === "local-change" || reason === "manual") {
          syncQueuedAfterInflightRef.current = true;
        }
        return;
      }

      const userId = session?.user.id ?? null;

      if (!userId) {
        return;
      }

      const currentMeta = await loadSyncMeta();

      if (reason !== "manual" && reason !== "local-change") {
        const hasFreshCursor =
          currentMeta.initializedUserId === userId &&
          currentMeta.lastPulledServerOrder !== null;
        const syncedRecently =
          currentMeta.lastSyncedAt !== null &&
          Date.now() - currentMeta.lastSyncedAt < AUTO_SYNC_COOLDOWN_MS;
        const pendingOperations = await listPendingSyncOperations();

        if (
          hasFreshCursor &&
          syncedRecently &&
          pendingOperations.length === 0
        ) {
          return;
        }
      }

      syncInFlightRef.current = true;
      setIsSyncing(true);

      try {
        await syncWithServer({
          adapter: syncAdapter,
          isOnline,
          setErrorMessage,
          setStatusNotice,
          setStatus,
          userId,
        });
        await refreshSyncMeta();
      } finally {
        syncInFlightRef.current = false;
        setIsSyncing(false);

        if (syncQueuedAfterInflightRef.current) {
          syncQueuedAfterInflightRef.current = false;
          void runSyncNow("local-change");
        }
      }
    },
    [isOnline, refreshSyncMeta, session, setStatus, syncAdapter],
  );

  const syncNow = useCallback(async () => {
    await runSyncNow("manual");
  }, [runSyncNow]);

  const schedulePendingFlush = useCallback(() => {
    if (pendingFlushTimerRef.current !== null) {
      window.clearTimeout(pendingFlushTimerRef.current);
    }

    pendingFlushTimerRef.current = window.setTimeout(() => {
      pendingFlushTimerRef.current = null;

      void listPendingSyncOperations().then((pendingOperations) => {
        if (pendingOperations.length === 0) {
          return;
        }

        void runSyncNow("local-change");
      });
    }, LOCAL_CHANGE_FLUSH_DELAY_MS);
  }, [runSyncNow]);

  const enqueueOperation = useCallback(
    async (
      baseState: AppState,
      operation: SyncOperation,
      nextMeta?: SyncMetaRecord,
    ) => {
      const currentMeta = nextMeta ?? (await loadSyncMeta());
      const resolvedNextMeta = {
        ...currentMeta,
        connectedUserId: session?.user.id ?? null,
      };

      await enqueueLocalSyncOperation(baseState, operation, resolvedNextMeta, {
        isAuthenticated: Boolean(session?.user),
        isOnline,
      });

      if (session?.user && isOnline && syncAdapter) {
        void runSyncNow("local-change");
        schedulePendingFlush();
      }
    },
    [isOnline, runSyncNow, schedulePendingFlush, session, syncAdapter],
  );

  const value = useMemo<SyncConnectionContextValue>(
    () => ({
      errorMessage,
      deleteAccount,
      enqueueOperation,
      isAuthenticated: Boolean(session?.user),
      isConfigured: configured,
      isReady,
      isRestoringSession,
      isSyncEnabled: Boolean(syncMeta?.syncEnabled),
      isSyncing,
      lastSyncedAt: syncMeta?.lastSyncedAt ?? null,
      registerSyncAdapter: setSyncAdapter,
      requestPasswordReset,
      session,
      statusNotice,
      status:
        syncMeta?.status ??
        resolveSyncStatus({
          hasError: Boolean(errorMessage),
          isAuthenticated: Boolean(session?.user),
          isBusy,
          isOnline,
        }),
      user: session?.user ?? null,
      signIn,
      signOut,
      signUp,
      syncNow,
    }),
    [
      configured,
      deleteAccount,
      enqueueOperation,
      errorMessage,
      isBusy,
      isOnline,
      isReady,
      isRestoringSession,
      isSyncing,
      statusNotice,
      session,
      requestPasswordReset,
      signIn,
      signOut,
      signUp,
      syncMeta,
      syncNow,
    ],
  );

  useEffect(() => {
    const userId = session?.user?.id ?? null;

    if (!userId) {
      autoSyncedUserIdRef.current = null;
      return;
    }

    if (!syncAdapter || autoSyncedUserIdRef.current === userId) {
      return;
    }

    autoSyncedUserIdRef.current = userId;
    void runSyncNow("session-ready");
  }, [runSyncNow, session?.user?.id, syncAdapter]);

  useEffect(() => {
    if (!syncAdapter) {
      return;
    }

    function handleFocus() {
      void runSyncNow("focus");
    }

    function handleOnline() {
      void runSyncNow("online");
    }

    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleOnline);
    };
  }, [runSyncNow, syncAdapter]);

  useEffect(() => {
    return () => {
      if (pendingFlushTimerRef.current !== null) {
        window.clearTimeout(pendingFlushTimerRef.current);
      }
    };
  }, []);

  return (
    <SyncConnectionContext.Provider value={value}>
      {children}
    </SyncConnectionContext.Provider>
  );
}

export function useSyncConnection() {
  const context = useContext(SyncConnectionContext);

  if (!context) {
    throw new Error("useSyncConnection must be used within a SyncProvider.");
  }

  return context;
}
