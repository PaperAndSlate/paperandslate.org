type LighthouseSettings = Record<string, unknown>;

/**
 * Activate LHCI's Puppeteer manager with a caller-owned profile. This avoids
 * chrome-launcher@1.2.x owning the browser process and immediately removing
 * its generated profile after taskkill on Windows.
 */
export function withOwnedPuppeteerBrowser<T extends LighthouseSettings>(
  collect: T,
  userDataDir: string,
  bootstrapScript = "scripts/lighthouse-puppeteer-bootstrap.cjs",
): T & {
  puppeteerScript: string;
  puppeteerLaunchOptions: Record<string, unknown>;
} {
  return {
    ...collect,
    puppeteerScript: bootstrapScript,
    puppeteerLaunchOptions: {
      ...(typeof collect.puppeteerLaunchOptions === "object" &&
      collect.puppeteerLaunchOptions !== null &&
      !Array.isArray(collect.puppeteerLaunchOptions)
        ? collect.puppeteerLaunchOptions
        : {}),
      userDataDir,
    },
  } as T & {
    puppeteerScript: string;
    puppeteerLaunchOptions: Record<string, unknown>;
  };
}
