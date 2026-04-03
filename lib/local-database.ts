const DATABASE_NAME = "gradeflow";
const DATABASE_VERSION = 3;

export const APP_STORE_NAME = "app";
export const SYNC_META_STORE_NAME = "sync_meta";
export const PENDING_OPS_STORE_NAME = "pending_ops";
export const TOMBSTONES_STORE_NAME = "tombstones";
export const APPLIED_OPS_STORE_NAME = "applied_ops";
export const ENTITY_VERSIONS_STORE_NAME = "entity_versions";

let databasePromise: Promise<IDBDatabase> | null = null;

function createStore(database: IDBDatabase, storeName: string) {
  if (!database.objectStoreNames.contains(storeName)) {
    database.createObjectStore(storeName);
  }
}

export function openLocalDatabase(): Promise<IDBDatabase> {
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

        createStore(database, APP_STORE_NAME);
        createStore(database, SYNC_META_STORE_NAME);
        createStore(database, PENDING_OPS_STORE_NAME);
        createStore(database, TOMBSTONES_STORE_NAME);
        createStore(database, APPLIED_OPS_STORE_NAME);
        createStore(database, ENTITY_VERSIONS_STORE_NAME);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(
          request.error ?? new Error("Failed to open the GradeLog database."),
        );
      };
    });
  }

  return databasePromise;
}

export async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openLocalDatabase();

  return await new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = run(store);
    let requestResult: T | undefined;
    let hasRequestResult = false;

    request.onsuccess = () => {
      requestResult = request.result;
      hasRequestResult = true;
    };

    request.onerror = () => {
      reject(
        request.error ??
          new Error("IndexedDB request failed while accessing GradeLog data."),
      );
    };

    transaction.onabort = () => {
      reject(
        transaction.error ??
          new Error(
            "IndexedDB transaction was aborted while accessing GradeLog data.",
          ),
      );
    };

    transaction.oncomplete = () => {
      if (!hasRequestResult) {
        reject(
          new Error(
            "IndexedDB transaction completed without returning a request result.",
          ),
        );
        return;
      }

      resolve(requestResult as T);
    };
  });
}
