import {
  SYNC_STATUS_CONNECTING,
  SYNC_STATUS_ERROR,
  SYNC_STATUS_OFFLINE_PENDING,
  SYNC_STATUS_SYNCING,
  SYNC_STATUS_UP_TO_DATE,
  SyncStatus,
} from "@/lib/sync/types";

export function getSyncStatusLabel(status: SyncStatus) {
  switch (status) {
    case SYNC_STATUS_CONNECTING:
      return "Connecting";
    case SYNC_STATUS_SYNCING:
      return "Syncing…";
    case SYNC_STATUS_UP_TO_DATE:
      return "Up to date";
    case SYNC_STATUS_OFFLINE_PENDING:
      return "Offline changes pending";
    case SYNC_STATUS_ERROR:
      return "Sync needs attention";
    default:
      return "Local only";
  }
}

export function formatLastSyncedAt(timestamp: number | null) {
  if (timestamp === null) {
    return null;
  }

  const diffMs = Date.now() - timestamp;

  if (diffMs < 45_000) {
    return "Synced just now";
  }

  const diffMinutes = Math.round(diffMs / 60_000);

  if (diffMinutes < 60) {
    return `Synced ${diffMinutes} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `Synced ${diffHours} hr ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `Synced ${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}
