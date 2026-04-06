export function parseOptionalPercent(value: string) {
  const numeric = Number(value.trim());

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return Math.min(numeric, 100);
}
