import { SyncStatus } from "@/lib/sync-types";

export function getSyncStatusLabel(status: SyncStatus) {
  switch (status) {
    case "connecting":
      return "Connecting";
    case "syncing":
      return "Syncing…";
    case "up-to-date":
      return "Up to date";
    case "offline-pending":
      return "Offline changes pending";
    case "error":
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
