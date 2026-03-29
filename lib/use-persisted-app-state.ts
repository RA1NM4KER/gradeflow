"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  AppState,
  getPersistedAppStateSnapshot,
  normalizeAppState,
} from "@/lib/app-state";
import {
  loadAppStateMetadata,
  loadAppStateRecord,
  saveAppState,
} from "@/lib/app-state-storage";

const APP_STATE_CHANNEL_NAME = "gradeflow-app-state";
const EXTERNAL_REFRESH_DELAY_MS = 1200;

let hydratedAppStateCache: AppState | null = null;
let hydratedSnapshotCache = "";

type AppStateUpdater = AppState | ((current: AppState) => AppState);

export function usePersistedAppState() {
  const [appState, setAppState] = useState<AppState | null>(
    hydratedAppStateCache,
  );
  const [isHydrated, setIsHydrated] = useState(hydratedAppStateCache !== null);
  const [bootError, setBootError] = useState<string | null>(null);
  const lastSavedSnapshotRef = useRef(hydratedSnapshotCache);
  const pendingExternalSnapshotRef = useRef<string | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const refreshTimerRef = useRef<number | null>(null);
  const tabIdRef = useRef(crypto.randomUUID());

  const applyLoadedState = useCallback(
    (nextState: AppState, snapshot?: string) => {
      const normalizedState = normalizeAppState(nextState);
      const nextSnapshot =
        snapshot ?? getPersistedAppStateSnapshot(normalizedState);

      pendingExternalSnapshotRef.current = null;
      lastSavedSnapshotRef.current = nextSnapshot;
      hydratedAppStateCache = normalizedState;
      hydratedSnapshotCache = nextSnapshot;
      setAppState(normalizedState);
    },
    [],
  );

  const reloadAppState = useCallback(async () => {
    const { metadata, state } = await loadAppStateRecord();

    setAppState((currentState) => {
      if (
        currentState &&
        getPersistedAppStateSnapshot(currentState) === metadata.snapshot
      ) {
        return currentState;
      }

      pendingExternalSnapshotRef.current = null;
      lastSavedSnapshotRef.current = metadata.snapshot;
      hydratedAppStateCache = state;
      hydratedSnapshotCache = metadata.snapshot;
      return state;
    });
  }, []);

  const maybeRefreshFromStorage = useCallback(async () => {
    const metadata = await loadAppStateMetadata();

    if (!metadata || metadata.snapshot === lastSavedSnapshotRef.current) {
      pendingExternalSnapshotRef.current = null;
      return false;
    }

    await reloadAppState();
    return true;
  }, [reloadAppState]);

  const scheduleExternalRefresh = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      window.clearTimeout(refreshTimerRef.current);
    }

    // External tab updates should settle in gently rather than snapping the UI
    // immediately while the current tab is active.
    refreshTimerRef.current = window.setTimeout(() => {
      refreshTimerRef.current = null;

      if (
        document.visibilityState !== "visible" ||
        !pendingExternalSnapshotRef.current ||
        pendingExternalSnapshotRef.current === lastSavedSnapshotRef.current
      ) {
        return;
      }

      void reloadAppState();
    }, EXTERNAL_REFRESH_DELAY_MS);
  }, [reloadAppState]);

  const replaceAppState = useCallback((updater: AppStateUpdater) => {
    setAppState((currentState) => {
      const baseState = currentState ?? normalizeAppState();
      const nextState =
        typeof updater === "function" ? updater(baseState) : updater;

      const normalizedState = normalizeAppState(nextState);
      hydratedAppStateCache = normalizedState;
      hydratedSnapshotCache = getPersistedAppStateSnapshot(normalizedState);
      return normalizedState;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrateState() {
      try {
        const { metadata, state } = await loadAppStateRecord();

        if (cancelled) {
          return;
        }

        applyLoadedState(state, metadata.snapshot);
        setBootError(null);
        setIsHydrated(true);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load Gradeflow state from IndexedDB.", error);
        setBootError(
          "Gradeflow could not access private browser storage. Check storage permissions or private browsing restrictions, then reload.",
        );
      }
    }

    void hydrateState();

    return () => {
      cancelled = true;
    };
  }, [applyLoadedState]);

  useEffect(() => {
    if (!isHydrated || !appState) {
      return;
    }

    const snapshot = getPersistedAppStateSnapshot(appState);

    if (snapshot === lastSavedSnapshotRef.current) {
      return;
    }

    void saveAppState(appState)
      .then(({ metadata }) => {
        lastSavedSnapshotRef.current = metadata.snapshot;
        channelRef.current?.postMessage({
          snapshot: metadata.snapshot,
          sourceTabId: tabIdRef.current,
          type: "app-state-updated",
        });
      })
      .catch((error) => {
        console.error("Failed to save Gradeflow state to IndexedDB.", error);
      });
  }, [appState, isHydrated]);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") {
      return;
    }

    const channel = new BroadcastChannel(APP_STATE_CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent) => {
      const data = event.data as
        | { snapshot?: string; sourceTabId?: string; type?: string }
        | undefined;

      if (
        data?.type !== "app-state-updated" ||
        data.sourceTabId === tabIdRef.current
      ) {
        return;
      }

      if (!data.snapshot || data.snapshot === lastSavedSnapshotRef.current) {
        return;
      }

      pendingExternalSnapshotRef.current = data.snapshot;

      if (document.visibilityState === "visible") {
        scheduleExternalRefresh();
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [scheduleExternalRefresh]);

  useEffect(() => {
    async function handleWindowFocus() {
      if (pendingExternalSnapshotRef.current) {
        scheduleExternalRefresh();
        return;
      }

      void maybeRefreshFromStorage();
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") {
        return;
      }

      if (pendingExternalSnapshotRef.current) {
        scheduleExternalRefresh();
        return;
      }

      void maybeRefreshFromStorage();
    }

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
      }

      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [maybeRefreshFromStorage, scheduleExternalRefresh]);

  return {
    appState,
    bootError,
    isHydrated,
    reloadAppState,
    replaceAppState,
  };
}
