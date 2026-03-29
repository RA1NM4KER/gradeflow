"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  AppState,
  normalizeAppState,
  serializePersistedAppState,
} from "@/lib/app-state";
import { loadAppState, saveAppState } from "@/lib/app-state-storage";

const APP_STATE_CHANNEL_NAME = "gradeflow-app-state";

type AppStateUpdater = AppState | ((current: AppState) => AppState);

export function usePersistedAppState() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const lastSavedSnapshotRef = useRef("");
  const channelRef = useRef<BroadcastChannel | null>(null);
  const tabIdRef = useRef(crypto.randomUUID());

  const applyLoadedState = useCallback((nextState: AppState) => {
    const normalizedState = normalizeAppState(nextState);
    lastSavedSnapshotRef.current = serializePersistedAppState(normalizedState);
    setAppState(normalizedState);
  }, []);

  const reloadAppState = useCallback(async () => {
    const loadedState = await loadAppState();
    const serializedState = serializePersistedAppState(loadedState);

    setAppState((currentState) => {
      if (
        currentState &&
        serializePersistedAppState(currentState) === serializedState
      ) {
        return currentState;
      }

      lastSavedSnapshotRef.current = serializedState;
      return loadedState;
    });
  }, []);

  const replaceAppState = useCallback((updater: AppStateUpdater) => {
    setAppState((currentState) => {
      const baseState = currentState ?? normalizeAppState();
      const nextState =
        typeof updater === "function" ? updater(baseState) : updater;

      return normalizeAppState(nextState);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrateState() {
      try {
        const loadedState = await loadAppState();

        if (cancelled) {
          return;
        }

        applyLoadedState(loadedState);
        setBootError(null);
        setIsHydrated(true);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load Gradeflow state from IndexedDB.", error);
        setBootError(
          "Gradeflow could not open your browser's private storage. Check storage permissions or private browsing restrictions, then reload.",
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

    const snapshot = serializePersistedAppState(appState);

    if (snapshot === lastSavedSnapshotRef.current) {
      return;
    }

    void saveAppState(appState)
      .then((savedState) => {
        lastSavedSnapshotRef.current = serializePersistedAppState(savedState);
        channelRef.current?.postMessage({
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
        | { sourceTabId?: string; type?: string }
        | undefined;

      if (
        data?.type !== "app-state-updated" ||
        data.sourceTabId === tabIdRef.current
      ) {
        return;
      }

      void reloadAppState();
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [reloadAppState]);

  useEffect(() => {
    function handleFocus() {
      void reloadAppState();
    }

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [reloadAppState]);

  return {
    appState,
    bootError,
    isHydrated,
    reloadAppState,
    replaceAppState,
  };
}
