import { buildBootstrapOperations } from "@/lib/sync-operation-builders";
import { AppState, getDefaultAppState } from "@/lib/app-state";
import {
  applyLocalSyncOperation,
  applyRemoteSyncOperation,
  createEmptySyncMergeContext,
} from "@/lib/sync-reducer";
import { getSyncEntityKey } from "@/lib/sync-schema";
import {
  clearPendingSyncOperations,
  deletePendingSyncOperation,
  loadAppliedSyncOperations,
  loadEntityVersionStates,
  loadLocalTombstones,
  listPendingSyncOperations,
  loadSyncMeta,
  markSyncOperationApplied,
  replaceEntityVersionStates,
  replaceLocalTombstones,
  savePendingSyncOperation,
  saveSyncMeta,
} from "@/lib/sync-storage";
import {
  SyncEntityVersionState,
  SyncMergeContext,
  SyncMetaRecord,
  SyncOperation,
  SyncStatus,
  SyncTombstoneRecord,
} from "@/lib/sync-types";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { isNativeApp } from "@/lib/platform";

export interface SyncAdapter {
  applyRemoteState: (state: AppState) => void;
  getAppState: () => AppState | null;
}

interface RemoteSyncOperationRow {
  client_op_id: string;
  created_at: string;
  device_id: string;
  entity_id: string;
  entity_type: string;
  field_mask: string[];
  id: string;
  lamport: number;
  op_type: string;
  parent_entity_id: string | null;
  parent_entity_type: string | null;
  payload: SyncOperation["payload"];
  server_order: number;
}

interface UploadedOperationRow {
  client_op_id: string;
  id: string;
  server_order: number;
}

const REMOTE_SYNC_BATCH_SIZE = 500;
const DEVICE_HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;

function createMergeContext(
  entityVersions: SyncEntityVersionState[],
  tombstones: SyncTombstoneRecord[],
): SyncMergeContext {
  return {
    entityVersions: new Map(
      entityVersions.map((record) => [
        getSyncEntityKey(record.entityType, record.entityId),
        record,
      ]),
    ),
    tombstones: new Map(
      tombstones.map((record) => [
        getSyncEntityKey(record.entityType, record.entityId),
        record,
      ]),
    ),
  };
}

async function loadMergeContext() {
  const [entityVersions, tombstones] = await Promise.all([
    loadEntityVersionStates(),
    loadLocalTombstones(),
  ]);

  return createMergeContext(entityVersions, tombstones);
}

async function saveMergeContext(context: SyncMergeContext) {
  await Promise.all([
    replaceEntityVersionStates(Array.from(context.entityVersions.values())),
    replaceLocalTombstones(Array.from(context.tombstones.values())),
  ]);
}

function isDefaultSemesterShape(state: AppState) {
  const semester = state.semesters[0];

  if (!semester) {
    return true;
  }

  return (
    state.semesters.length === 1 &&
    semester.name === "Semester 1 2026" &&
    semester.periodLabel === "January to June" &&
    semester.courses.length === 0
  );
}

export function isAppStateEffectivelyEmpty(state: AppState) {
  return (
    state.semesters.every((semester) => semester.courses.length === 0) &&
    isDefaultSemesterShape(state)
  );
}

export async function enqueueLocalSyncOperation(
  baseState: AppState,
  operation: SyncOperation,
  nextMeta: SyncMetaRecord,
  options: {
    isAuthenticated: boolean;
    isOnline: boolean;
  },
) {
  const currentContext = await loadMergeContext();
  const applied = applyLocalSyncOperation(baseState, operation, currentContext);

  await Promise.all([
    savePendingSyncOperation(operation),
    saveMergeContext(applied.context),
    saveSyncMeta({
      ...nextMeta,
      status: options.isAuthenticated
        ? options.isOnline
          ? "syncing"
          : "offline-pending"
        : "local-only",
    }),
  ]);

  return applied;
}

function getDevicePlatform() {
  if (typeof navigator === "undefined") {
    return "unknown";
  }

  if (isNativeApp()) {
    return "capacitor";
  }

  return "web";
}

function getDeviceName() {
  if (typeof navigator === "undefined") {
    return "GradeLog device";
  }

  return navigator.userAgent.slice(0, 120);
}

async function registerUserDevice(userId: string, syncMeta: SyncMetaRecord) {
  const now = Date.now();
  if (
    syncMeta.lastDeviceSeenAt !== null &&
    now - syncMeta.lastDeviceSeenAt < DEVICE_HEARTBEAT_INTERVAL_MS
  ) {
    return {
      ...syncMeta,
      connectedUserId: userId,
    };
  }

  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await client.from("user_devices").upsert(
    {
      device_id: syncMeta.deviceId,
      device_name: getDeviceName(),
      last_seen_at: new Date().toISOString(),
      platform: getDevicePlatform(),
      user_id: userId,
    },
    {
      onConflict: "user_id,device_id",
    },
  );

  if (error) {
    throw error;
  }

  return {
    ...syncMeta,
    connectedUserId: userId,
    lastDeviceSeenAt: now,
  };
}

function toRemoteSyncOperationRow(operation: SyncOperation, userId: string) {
  return {
    client_op_id: operation.clientOpId,
    device_id: operation.deviceId,
    entity_id: operation.entityId,
    entity_type: operation.entityType,
    field_mask: operation.fieldMask,
    lamport: operation.lamport,
    op_type: operation.opType,
    parent_entity_id: operation.parentEntityId,
    parent_entity_type: operation.parentEntityType,
    payload: operation.payload,
    user_id: userId,
  };
}

function fromRemoteSyncOperationRow(
  row: RemoteSyncOperationRow,
): SyncOperation {
  return {
    clientOpId: row.client_op_id,
    deviceId: row.device_id,
    entityId: row.entity_id,
    entityType: row.entity_type as SyncOperation["entityType"],
    fieldMask: row.field_mask,
    lamport: row.lamport,
    opType: row.op_type as SyncOperation["opType"],
    parentEntityId: row.parent_entity_id,
    parentEntityType:
      row.parent_entity_type as SyncOperation["parentEntityType"],
    payload: row.payload,
    serverOrder: row.server_order,
  } as SyncOperation;
}

async function uploadOperations(userId: string, operations: SyncOperation[]) {
  const client = getSupabaseBrowserClient();

  if (!client || operations.length === 0) {
    return [] as UploadedOperationRow[];
  }

  const { data, error } = await client
    .from("sync_operations")
    .upsert(
      operations.map((operation) =>
        toRemoteSyncOperationRow(operation, userId),
      ),
      {
        onConflict: "user_id,device_id,client_op_id",
      },
    )
    .select("client_op_id,id,server_order");

  if (error) {
    throw error;
  }

  return (data ?? []) as UploadedOperationRow[];
}

async function upsertRemoteTombstones(
  userId: string,
  uploadedRows: UploadedOperationRow[],
  operations: SyncOperation[],
) {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const rowsByClientOpId = new Map(
    uploadedRows.map((row) => [row.client_op_id, row]),
  );

  const tombstones = operations
    .filter(
      (operation) =>
        operation.opType === "semester.delete" ||
        operation.opType === "course.delete" ||
        operation.opType === "assessment.delete",
    )
    .map((operation) => {
      const uploadedRow = rowsByClientOpId.get(operation.clientOpId);

      if (!uploadedRow) {
        return null;
      }

      return {
        deleted_at: new Date().toISOString(),
        deleted_by_op_id: uploadedRow.id,
        deleted_server_order: uploadedRow.server_order,
        entity_id: operation.entityId,
        entity_type: operation.entityType,
        user_id: userId,
      };
    })
    .filter(Boolean);

  if (tombstones.length === 0) {
    return;
  }

  const { error } = await client.from("entity_tombstones").upsert(tombstones, {
    onConflict: "user_id,entity_type,entity_id",
  });

  if (error) {
    throw error;
  }
}

async function acknowledgeUploadedOperations(rows: UploadedOperationRow[]) {
  let maxServerOrder: number | null = null;

  for (const row of rows) {
    await Promise.all([
      deletePendingSyncOperation(row.client_op_id),
      markSyncOperationApplied({
        clientOpId: row.client_op_id,
        serverOrder: row.server_order,
      }),
    ]);

    maxServerOrder =
      maxServerOrder === null
        ? row.server_order
        : Math.max(maxServerOrder, row.server_order);
  }

  return maxServerOrder;
}

async function fetchRemoteOperations(
  userId: string,
  lastServerOrder: number | null,
) {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  let query = client
    .from("sync_operations")
    .select(
      "client_op_id,created_at,device_id,entity_id,entity_type,field_mask,id,lamport,op_type,parent_entity_id,parent_entity_type,payload,server_order",
    )
    .eq("user_id", userId)
    .order("server_order", { ascending: true })
    .limit(REMOTE_SYNC_BATCH_SIZE);

  if (lastServerOrder !== null) {
    query = query.gt("server_order", lastServerOrder);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as RemoteSyncOperationRow[];
}

async function clearRemoteSyncData(userId: string) {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const { error: tombstoneError } = await client
    .from("entity_tombstones")
    .delete()
    .eq("user_id", userId);

  if (tombstoneError) {
    throw tombstoneError;
  }

  const { error: operationsError } = await client
    .from("sync_operations")
    .delete()
    .eq("user_id", userId);

  if (operationsError) {
    throw operationsError;
  }
}

function resolvePostSyncStatus({
  hasPendingOps,
  isOnline,
}: {
  hasPendingOps: boolean;
  isOnline: boolean;
}): SyncStatus {
  if (hasPendingOps && !isOnline) {
    return "offline-pending";
  }

  if (hasPendingOps) {
    return "syncing";
  }

  return "up-to-date";
}

async function applyPulledOperations(
  adapter: SyncAdapter,
  rows: RemoteSyncOperationRow[],
  syncMeta: SyncMetaRecord,
) {
  if (rows.length === 0) {
    return {
      latestServerOrder: syncMeta.lastPulledServerOrder,
      skippedDeleteCount: 0,
    };
  }

  const baseState = adapter.getAppState() ?? getDefaultAppState();
  const currentContext = await loadMergeContext();
  const appliedRows = await loadAppliedSyncOperations();
  const appliedClientOpIds = new Set(appliedRows.map((row) => row.clientOpId));
  let nextState = baseState;
  let nextContext = currentContext;
  let latestServerOrder = syncMeta.lastPulledServerOrder;
  let skippedDeleteCount = 0;

  for (const row of rows) {
    latestServerOrder =
      latestServerOrder === null
        ? row.server_order
        : Math.max(latestServerOrder, row.server_order);

    if (appliedClientOpIds.has(row.client_op_id)) {
      continue;
    }

    const operation = fromRemoteSyncOperationRow(row);
    const result = applyRemoteSyncOperation(nextState, operation, nextContext);
    nextState = result.state;
    nextContext = result.context;

    if (
      result.reason === "entity-deleted" ||
      result.reason === "parent-deleted"
    ) {
      skippedDeleteCount += 1;
    }

    await markSyncOperationApplied({
      clientOpId: row.client_op_id,
      serverOrder: row.server_order,
    });
  }

  adapter.applyRemoteState(nextState);
  await saveMergeContext(nextContext);

  return {
    latestServerOrder,
    skippedDeleteCount,
  };
}

function getConflictNotice(skippedDeleteCount: number) {
  if (skippedDeleteCount === 0) {
    return null;
  }

  if (skippedDeleteCount === 1) {
    return "One change was skipped because the item was deleted on another device.";
  }

  return `${skippedDeleteCount} changes were skipped because those items were deleted on another device.`;
}

export async function syncWithServer(options: {
  adapter: SyncAdapter;
  isOnline: boolean;
  setErrorMessage: (message: string | null) => void;
  setStatusNotice: (message: string | null) => void;
  setStatus: (status: SyncStatus) => Promise<void>;
  userId: string | null;
}) {
  const {
    adapter,
    isOnline,
    setErrorMessage,
    setStatusNotice,
    setStatus,
    userId,
  } = options;

  if (!userId) {
    await setStatus("local-only");
    return;
  }

  if (!isOnline) {
    await setStatus("offline-pending");
    return;
  }

  const appState = adapter.getAppState();

  if (!appState) {
    return;
  }

  await setStatus("syncing");
  setErrorMessage(null);

  let syncMeta = await loadSyncMeta();
  let nextStatusNotice: string | null = null;

  try {
    syncMeta = await registerUserDevice(userId, syncMeta);
    await saveSyncMeta(syncMeta);

    const localHasData = !isAppStateEffectivelyEmpty(appState);
    const needsBootstrap = syncMeta.initializedUserId !== userId;
    const needsRemoteHead =
      needsBootstrap || syncMeta.lastPulledServerOrder === null;
    const remoteHead = needsRemoteHead
      ? await fetchRemoteOperations(userId, null)
      : [];

    if (needsBootstrap) {
      if (remoteHead.length === 0) {
        if (localHasData) {
          const bootstrap = buildBootstrapOperations(syncMeta, appState);
          syncMeta = bootstrap.nextMeta;
          const uploadedRows = await uploadOperations(
            userId,
            bootstrap.operations,
          );
          await upsertRemoteTombstones(
            userId,
            uploadedRows,
            bootstrap.operations,
          );
          const latestServerOrder =
            await acknowledgeUploadedOperations(uploadedRows);
          await clearPendingSyncOperations();

          syncMeta = {
            ...syncMeta,
            connectedUserId: userId,
            initializedUserId: userId,
            lastPulledServerOrder: latestServerOrder,
          };
          await saveSyncMeta(syncMeta);
        }
      } else if (!localHasData) {
        const pullResult = await applyPulledOperations(
          adapter,
          remoteHead,
          syncMeta,
        );
        nextStatusNotice =
          getConflictNotice(pullResult.skippedDeleteCount) ??
          "Your grades are now in sync on this device.";

        syncMeta = {
          ...syncMeta,
          connectedUserId: userId,
          initializedUserId: userId,
          lastPulledServerOrder: pullResult.latestServerOrder,
        };
        await saveSyncMeta(syncMeta);
      } else {
        await clearRemoteSyncData(userId);
        await clearPendingSyncOperations();
        const bootstrap = buildBootstrapOperations(syncMeta, appState);
        syncMeta = bootstrap.nextMeta;
        const uploadedRows = await uploadOperations(
          userId,
          bootstrap.operations,
        );
        await upsertRemoteTombstones(
          userId,
          uploadedRows,
          bootstrap.operations,
        );
        const latestServerOrder =
          await acknowledgeUploadedOperations(uploadedRows);

        syncMeta = {
          ...syncMeta,
          connectedUserId: userId,
          initializedUserId: userId,
          lastPulledServerOrder: latestServerOrder,
        };
        await saveSyncMeta(syncMeta);
        nextStatusNotice =
          "This device is now connected. Existing grades on this device were kept for sync.";
      }

      if (nextStatusNotice === null && localHasData) {
        nextStatusNotice = "This device is now connected.";
      }
    } else if (syncMeta.lastPulledServerOrder === null) {
      // If the cursor was lost locally for an already initialized user,
      // recover by replaying the remote log instead of re-running destructive
      // bootstrap logic.
      const pullResult = await applyPulledOperations(
        adapter,
        remoteHead,
        syncMeta,
      );
      nextStatusNotice = getConflictNotice(pullResult.skippedDeleteCount);

      syncMeta = {
        ...syncMeta,
        connectedUserId: userId,
        initializedUserId: userId,
        lastPulledServerOrder: pullResult.latestServerOrder,
      };
      await saveSyncMeta(syncMeta);
    }

    const pendingOperations = await listPendingSyncOperations();

    if (pendingOperations.length > 0) {
      const uploadedRows = await uploadOperations(userId, pendingOperations);
      await upsertRemoteTombstones(userId, uploadedRows, pendingOperations);
      const latestUploadedServerOrder =
        await acknowledgeUploadedOperations(uploadedRows);

      if (
        latestUploadedServerOrder !== null &&
        (syncMeta.lastPulledServerOrder === null ||
          latestUploadedServerOrder > syncMeta.lastPulledServerOrder)
      ) {
        syncMeta = {
          ...syncMeta,
          connectedUserId: userId,
          initializedUserId: userId,
          lastPulledServerOrder: latestUploadedServerOrder,
        };
        await saveSyncMeta(syncMeta);
      }
    }

    const pulledRows = await fetchRemoteOperations(
      userId,
      syncMeta.lastPulledServerOrder,
    );

    if (pulledRows.length > 0) {
      const pullResult = await applyPulledOperations(
        adapter,
        pulledRows,
        syncMeta,
      );
      nextStatusNotice =
        getConflictNotice(pullResult.skippedDeleteCount) ?? nextStatusNotice;

      syncMeta = {
        ...syncMeta,
        connectedUserId: userId,
        initializedUserId: userId,
        lastPulledServerOrder: pullResult.latestServerOrder,
      };
      await saveSyncMeta(syncMeta);
    }

    syncMeta = {
      ...syncMeta,
      connectedUserId: userId,
      initializedUserId: syncMeta.initializedUserId ?? userId,
      lastSyncedAt: Date.now(),
    };
    await saveSyncMeta(syncMeta);

    const remainingPendingOperations = await listPendingSyncOperations();
    await setStatus(
      resolvePostSyncStatus({
        hasPendingOps: remainingPendingOperations.length > 0,
        isOnline,
      }),
    );
    setStatusNotice(nextStatusNotice);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "GradeLog sync failed.";
    setErrorMessage(message);
    setStatusNotice(null);
    await setStatus("error");
  }
}
