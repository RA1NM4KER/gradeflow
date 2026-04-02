export function isNativeApp() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(
    (window as Window & typeof globalThis & { Capacitor?: unknown }).Capacitor,
  );
}
