const defaultHealthUrl = "http://127.0.0.1:3000/health";

function validateHealthUrl(url: string) {
  if (!/^https?:\/\/[A-Za-z0-9][A-Za-z0-9_.:-]*(?::\d+)?\/health$/.test(url))
    throw new Error(`Unexpected container health URL: ${url}`);
  return url;
}

export function healthProbeCommand(client: string, target = defaultHealthUrl) {
  const normalized = client.trim();
  if (!normalized || !/^[A-Za-z0-9_./\\:-]+$/.test(normalized))
    throw new Error(`Unexpected container health client path: ${client}`);
  const url = validateHealthUrl(target);
  if (/(^|[\\/])wget$/i.test(normalized)) return `${normalized} -qO- --timeout=2 ${url}`;
  if (/(^|[\\/])curl$/i.test(normalized)) return `${normalized} -fsS --max-time 2 ${url}`;
  throw new Error(`Container health client must be curl or wget: ${client}`);
}
