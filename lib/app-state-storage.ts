import {
  AppState,
  migrateAppState,
  normalizeAppState,
  toPersistedAppState,
} from "@/lib/app-state";

const DATABASE_NAME = "gradeflow";
const DATABASE_VERSION = 1;
const STORE_NAME = "app";
const APP_STATE_KEY = "app-state";

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.reject(
      new Error("IndexedDB is unavailable in this environment."),
    );
  }

  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;

        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(
          request.error ?? new Error("Failed to open the Gradeflow database."),
        );
      };
    });
  }

  return databasePromise;
}

function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDatabase().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = run(store);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(
            request.error ??
              new Error(
                "IndexedDB request failed while accessing Gradeflow state.",
              ),
          );
        };

        transaction.onabort = () => {
          reject(
            transaction.error ??
              new Error(
                "IndexedDB transaction was aborted while accessing Gradeflow state.",
              ),
          );
        };
      }),
  );
}

export async function loadAppState(): Promise<AppState> {
  const storedState = await withStore("readonly", (store) =>
    store.get(APP_STATE_KEY),
  );

  return normalizeAppState(migrateAppState(storedState));
}

export async function saveAppState(state: AppState): Promise<AppState> {
  const normalizedState = normalizeAppState(state);
  await withStore("readwrite", (store) =>
    store.put(toPersistedAppState(normalizedState), APP_STATE_KEY),
  );
  return normalizedState;
}
