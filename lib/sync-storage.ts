import {
  APPLIED_OPS_STORE_NAME,
  ENTITY_VERSIONS_STORE_NAME,
  PENDING_OPS_STORE_NAME,
  SYNC_META_STORE_NAME,
  TOMBSTONES_STORE_NAME,
  withStore,
} from "@/lib/local-database";
import {
  AppliedSyncOperationRecord,
  SyncEntityVersionState,
  SyncMetaRecord,
  SyncOperation,
  SyncTombstoneRecord,
} from "@/lib/sync-types";
import { createUuid } from "@/lib/uuid";

const SYNC_META_KEY = "sync-meta";

export function createDefaultSyncMeta(): SyncMetaRecord {
  return {
    connectedUserId: null,
    deviceId: createUuid(),
    initializedUserId: null,
    lamportCounter: 0,
    lastDeviceSeenAt: null,
    lastPulledServerOrder: null,
    lastSyncedAt: null,
    lastSyncError: null,
    status: "local-only",
    syncEnabled: false,
  };
}

function normalizeSyncMeta(
  record: Partial<SyncMetaRecord> | null | undefined,
): SyncMetaRecord {
  const defaults = createDefaultSyncMeta();

  if (!record) {
    return defaults;
  }

  return {
    ...defaults,
    ...record,
  };
}

export async function loadSyncMeta(): Promise<SyncMetaRecord> {
  const record = await withStore(SYNC_META_STORE_NAME, "readonly", (store) =>
    store.get(SYNC_META_KEY),
  );

  return normalizeSyncMeta(record as Partial<SyncMetaRecord> | undefined);
}

export async function saveSyncMeta(meta: SyncMetaRecord) {
  await withStore(SYNC_META_STORE_NAME, "readwrite", (store) =>
    store.put(meta, SYNC_META_KEY),
  );

  return meta;
}

export async function listPendingSyncOperations() {
  const result = await withStore(PENDING_OPS_STORE_NAME, "readonly", (store) =>
    store.getAll(),
  );

  return (result as SyncOperation[]).sort((left, right) => {
    if (left.lamport !== right.lamport) {
      return left.lamport - right.lamport;
    }

    return left.clientOpId.localeCompare(right.clientOpId);
  });
}

export async function savePendingSyncOperation(operation: SyncOperation) {
  await withStore(PENDING_OPS_STORE_NAME, "readwrite", (store) =>
    store.put(operation, operation.clientOpId),
  );

  return operation;
}

export async function deletePendingSyncOperation(clientOpId: string) {
  await withStore(PENDING_OPS_STORE_NAME, "readwrite", (store) =>
    store.delete(clientOpId),
  );
}

export async function clearPendingSyncOperations() {
  await withStore(PENDING_OPS_STORE_NAME, "readwrite", (store) =>
    store.clear(),
  );
}

async function clearStore(storeName: string) {
  await withStore(storeName, "readwrite", (store) => store.clear());
}

export async function loadLocalTombstones() {
  const result = await withStore(TOMBSTONES_STORE_NAME, "readonly", (store) =>
    store.getAll(),
  );

  return result as SyncTombstoneRecord[];
}
export async function loadAppliedSyncOperations() {
  const result = await withStore(APPLIED_OPS_STORE_NAME, "readonly", (store) =>
    store.getAll(),
  );

  return result as AppliedSyncOperationRecord[];
}

export async function markSyncOperationApplied(
  record: AppliedSyncOperationRecord,
) {
  await withStore(APPLIED_OPS_STORE_NAME, "readwrite", (store) =>
    store.put(record, record.clientOpId),
  );

  return record;
}

export async function loadEntityVersionStates() {
  const result = await withStore(
    ENTITY_VERSIONS_STORE_NAME,
    "readonly",
    (store) => store.getAll(),
  );

  return result as SyncEntityVersionState[];
}
export async function replaceEntityVersionStates(
  records: SyncEntityVersionState[],
) {
  await withStore(ENTITY_VERSIONS_STORE_NAME, "readwrite", (store) => {
    void store.clear();
    records.forEach((record) => {
      store.put(record, `${record.entityType}:${record.entityId}`);
    });
    return store.getAllKeys();
  });
}

export async function replaceLocalTombstones(records: SyncTombstoneRecord[]) {
  await withStore(TOMBSTONES_STORE_NAME, "readwrite", (store) => {
    void store.clear();
    records.forEach((record) => {
      store.put(record, `${record.entityType}:${record.entityId}`);
    });
    return store.getAllKeys();
  });
}
export async function resetLocalSyncState() {
  await Promise.all([
    clearStore(PENDING_OPS_STORE_NAME),
    clearStore(TOMBSTONES_STORE_NAME),
    clearStore(APPLIED_OPS_STORE_NAME),
    clearStore(ENTITY_VERSIONS_STORE_NAME),
  ]);

  return await saveSyncMeta(createDefaultSyncMeta());
}
