const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getCryptoApi() {
  return typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
}

export function createUuid() {
  const cryptoApi = getCryptoApi();

  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }

  if (cryptoApi?.getRandomValues) {
    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
    return [
      hex.slice(0, 4).join(""),
      hex.slice(4, 6).join(""),
      hex.slice(6, 8).join(""),
      hex.slice(8, 10).join(""),
      hex.slice(10, 16).join(""),
    ].join("-");
  }

  let timestamp = Date.now();

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (token) => {
    const random = ((timestamp + Math.random() * 16) % 16) | 0;
    timestamp = Math.floor(timestamp / 16);
    const nibble = token === "x" ? random : (random & 0x3) | 0x8;
    return nibble.toString(16);
  });
}

export function isUuidV4(value: string) {
  return UUID_V4_PATTERN.test(value);
}

export function ensureUuid(value: unknown) {
  return typeof value === "string" && isUuidV4(value) ? value : createUuid();
}
