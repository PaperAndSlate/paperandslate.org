import type { Page } from "@playwright/test";

export const DEFAULT_IMAGE_WAIT_TIMEOUT_MS = 15_000;

export type BrowserImageState = {
  url: string;
  complete: boolean;
  naturalWidth: number;
  naturalHeight: number;
};

export function failedBrowserImages(images: readonly BrowserImageState[]) {
  return images
    .filter((image) => !image.complete || image.naturalWidth === 0)
    .map(
      (image) =>
        `${image.url} (complete=${String(image.complete)}, naturalWidth=${image.naturalWidth}, naturalHeight=${image.naturalHeight})`,
    );
}

export async function waitForImages(
  page: Page,
  timeoutMs = DEFAULT_IMAGE_WAIT_TIMEOUT_MS,
): Promise<void> {
  const boundedTimeout =
    Number.isFinite(timeoutMs) && timeoutMs > 0
      ? Math.ceil(timeoutMs)
      : DEFAULT_IMAGE_WAIT_TIMEOUT_MS;
  const images = await page.evaluate(async (timeout) => {
    const candidates = [...document.images].filter((image) => image.currentSrc || image.src);
    await Promise.all(
      candidates.map(
        (image) =>
          new Promise<void>((resolve) => {
            let timer = 0;
            const done = () => {
              window.clearTimeout(timer);
              image.removeEventListener("load", done);
              image.removeEventListener("error", done);
              resolve();
            };
            if (image.complete) {
              resolve();
              return;
            }
            timer = window.setTimeout(done, timeout);
            image.addEventListener("load", done, { once: true });
            image.addEventListener("error", done, { once: true });
            // Close the race where the image completes between the initial
            // check and listener registration.
            if (image.complete) done();
          }),
      ),
    );
    return candidates.map((image) => {
      const raw = image.currentSrc || image.src;
      let url = raw.split(/[?#]/, 1)[0];
      try {
        const parsed = new URL(raw, document.baseURI);
        url = parsed.protocol === "data:" ? "data:" : `${parsed.origin}${parsed.pathname}`;
      } catch {
        // Keep the already query/hash-free source for malformed URLs.
      }
      return {
        url,
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      };
    });
  }, boundedTimeout);
  const failures = failedBrowserImages(images);
  if (failures.length > 0)
    throw new Error(`Browser image loading failed or timed out: ${failures.join("; ")}`);
}
