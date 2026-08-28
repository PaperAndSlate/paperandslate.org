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
    // Full-page captures and route checks must validate assets below the fold
    // too. Promote discovered lazy images before waiting so the browser does
    // not leave them permanently incomplete outside the viewport.
    for (const image of document.images) image.loading = "eager";
    await Promise.all(
      candidates.map(
        (image) =>
          new Promise<void>((resolve) => {
            let timer = 0;
            let settled = false;
            if (image.complete) {
              resolve();
              return;
            }
            timer = window.setTimeout(() => {
              if (settled) return;
              settled = true;
              resolve();
            }, timeout);
            image.addEventListener(
              "load",
              () => {
                if (settled) return;
                settled = true;
                window.clearTimeout(timer);
                resolve();
              },
              { once: true },
            );
            image.addEventListener(
              "error",
              () => {
                if (settled) return;
                settled = true;
                window.clearTimeout(timer);
                resolve();
              },
              { once: true },
            );
            // Close the race where the image completes between the initial
            // check and listener registration.
            if (image.complete) {
              settled = true;
              window.clearTimeout(timer);
              resolve();
            }
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
