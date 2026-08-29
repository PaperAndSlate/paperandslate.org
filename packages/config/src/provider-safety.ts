export type ProviderUrlOptions = {
  protocols?: readonly string[];
  allowHttp?: boolean;
  allowCredentials?: boolean;
  allowQuery?: boolean;
};

const blockedHostnames = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata.google.com",
  "instance-data.ec2.internal",
  "169.254.169.254",
]);

function ipv4IsBlocked(value: string) {
  const octets = value.split(".").map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet))) return true;
  const [a, b] = octets;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19 || b === 51)) ||
    (a === 203 && b === 0) ||
    a >= 224
  );
}

function ipv6IsBlocked(value: string) {
  const normalized = value.toLowerCase();
  const groups = ipv6Groups(normalized);
  if (!groups) return true;
  const first = groups[0];
  const allZero = groups.every((group) => group === 0);
  const loopback = allZero || (groups.slice(0, 7).every((group) => group === 0) && groups[7] === 1);
  if (
    loopback ||
    (first & 0xfe00) === 0xfc00 ||
    (first & 0xffc0) === 0xfe80 ||
    (first & 0xff00) === 0xff00
  )
    return true;

  const mapped = groups.slice(0, 5).every((group) => group === 0) && groups[5] === 0xffff;
  const compatible = groups.slice(0, 6).every((group) => group === 0);
  if (mapped || compatible) {
    const ipv4 = `${groups[6] >> 8}.${groups[6] & 0xff}.${groups[7] >> 8}.${groups[7] & 0xff}`;
    return ipv4IsBlocked(ipv4);
  }
  return false;
}

function ipv6Groups(value: string): number[] | null {
  let normalized = value;
  const dotted = normalized.lastIndexOf(".");
  if (dotted >= 0) {
    const separator = normalized.lastIndexOf(":", dotted);
    if (separator < 0) return null;
    const octets = normalized
      .slice(separator + 1)
      .split(".")
      .map(Number);
    if (
      octets.length !== 4 ||
      octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)
    )
      return null;
    normalized = `${normalized.slice(0, separator + 1)}${((octets[0] << 8) | octets[1]).toString(16)}:${((octets[2] << 8) | octets[3]).toString(16)}`;
  }

  const halves = normalized.split("::");
  if (halves.length > 2) return null;
  const parseHalf = (half: string) => {
    if (!half) return [];
    const parts = half.split(":");
    if (parts.some((part) => !/^[0-9a-f]{1,4}$/.test(part))) return null;
    return parts.map((part) => Number.parseInt(part, 16));
  };
  const left = parseHalf(halves[0]);
  const right = parseHalf(halves[1] ?? "");
  if (!left || !right) return null;
  if (halves.length === 1) return left.length === 8 ? left : null;
  const zeroCount = 8 - left.length - right.length;
  return zeroCount > 0 ? [...left, ...Array.from({ length: zeroCount }, () => 0), ...right] : null;
}

export function isBlockedProviderHost(hostname: string) {
  const host = hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "");
  if (
    blockedHostnames.has(host) ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".localhost") ||
    host.endsWith(".home.arpa")
  )
    return true;
  const isIpv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host);
  const isIpv6 = host.includes(":");
  return isIpv4 ? ipv4IsBlocked(host) : isIpv6 ? ipv6IsBlocked(host) : false;
}

export function assertSafeProviderUrl(
  value: string,
  label: string,
  options: ProviderUrlOptions = {},
): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid URL`);
  }
  const protocols = options.protocols ?? (options.allowHttp ? ["http:", "https:"] : ["https:"]);
  if (!protocols.includes(url.protocol)) throw new Error(`${label} uses an unsupported protocol`);
  if (url.protocol === "http:" && options.allowHttp !== true)
    throw new Error(`${label} must use HTTPS outside explicitly local test configuration`);
  if (!options.allowCredentials && (url.username || url.password))
    throw new Error(`${label} must not contain credentials`);
  if ((!options.allowQuery && url.search) || url.hash)
    throw new Error(`${label} must not contain a query or fragment`);
  if (isBlockedProviderHost(url.hostname)) throw new Error(`${label} targets a private host`);
  return url;
}

export async function readBoundedResponse(response: Response, maxBytes: number): Promise<string> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0)
    throw new Error("Response byte limit must be a positive safe integer");
  const declaredLength = response.headers.get("content-length");
  if (declaredLength !== null) {
    const length = Number(declaredLength);
    if (!Number.isSafeInteger(length) || length < 0 || length > maxBytes) {
      await response.body?.cancel().catch(() => undefined);
      throw new Error("Provider response exceeded the byte limit");
    }
  }
  if (!response.body) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > maxBytes) throw new Error("Provider response exceeded the byte limit");
    return new TextDecoder().decode(bytes);
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      total += next.value.byteLength;
      if (total > maxBytes) throw new Error("Provider response exceeded the byte limit");
      chunks.push(next.value);
    }
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw error;
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export async function readBoundedJson<T>(response: Response, maxBytes: number): Promise<T> {
  const text = await readBoundedResponse(response, maxBytes);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Provider returned invalid JSON");
  }
}
