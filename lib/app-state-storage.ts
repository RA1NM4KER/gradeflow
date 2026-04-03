import {
  AppState,
  getPersistedAppStateMetadata,
  migrateAppState,
  normalizeAppState,
  PersistedAppStateMetadata,
  toPersistedAppState,
} from "@/lib/app-state";
import {
  APP_STORE_NAME,
  openLocalDatabase,
  withStore,
} from "@/lib/local-database";
const APP_STATE_KEY = "app-state";
const APP_STATE_METADATA_KEY = "app-state-metadata";

export interface StoredAppStateRecord {
  metadata: PersistedAppStateMetadata;
  state: AppState;
}

export async function loadAppStateMetadata(): Promise<PersistedAppStateMetadata | null> {
  const metadata = await withStore(APP_STORE_NAME, "readonly", (store) =>
    store.get(APP_STATE_METADATA_KEY),
  );

  return metadata ? (metadata as PersistedAppStateMetadata) : null;
}

export async function loadAppStateRecord(): Promise<StoredAppStateRecord> {
  const storedState = await withStore(APP_STORE_NAME, "readonly", (store) =>
    store.get(APP_STATE_KEY),
  );
  const state = normalizeAppState(migrateAppState(storedState));
  const metadata =
    (await loadAppStateMetadata()) ?? getPersistedAppStateMetadata(state);

  return {
    metadata,
    state,
  };
}

export async function saveAppState(
  state: AppState,
): Promise<StoredAppStateRecord> {
  const normalizedState = normalizeAppState(state);
  const persistedState = toPersistedAppState(normalizedState);
  const metadata = getPersistedAppStateMetadata(normalizedState);
  const database = await openLocalDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(APP_STORE_NAME, "readwrite");
    const store = transaction.objectStore(APP_STORE_NAME);

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onabort = () => {
      reject(
        transaction.error ??
          new Error(
            "IndexedDB transaction was aborted while saving GradeLog state.",
          ),
      );
    };

    transaction.onerror = () => {
      reject(
        transaction.error ??
          new Error(
            "IndexedDB transaction failed while saving GradeLog state.",
          ),
      );
    };

    store.put(persistedState, APP_STATE_KEY);
    store.put(metadata, APP_STATE_METADATA_KEY);
  });

  return {
    metadata,
    state: normalizedState,
  };
}
