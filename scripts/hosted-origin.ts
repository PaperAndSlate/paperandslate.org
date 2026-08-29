export const HOSTED_STAGING_ORIGIN = "https://paper-and-slate-web.dev.tower";

export function assertHostedStagingOrigin(value: string, label: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid URL`);
  }
  if (
    url.origin !== HOSTED_STAGING_ORIGIN ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  )
    throw new Error(`${label} must be the exact HTTPS staging origin ${HOSTED_STAGING_ORIGIN}`);
  return url.origin;
}

export function assertResponseOrigin(responseUrl: string, expectedOrigin: string, label: string) {
  let actual: URL;
  let expected: URL;
  try {
    actual = new URL(responseUrl);
    expected = new URL(expectedOrigin);
  } catch {
    throw new Error(`${label} returned an invalid final URL`);
  }
  if (actual.origin !== expected.origin)
    throw new Error(`${label} followed a redirect outside ${expected.origin}`);
  return actual;
}
