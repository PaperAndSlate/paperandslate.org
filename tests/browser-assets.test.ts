import { describe, expect, it } from "vitest";
import { failedBrowserImages } from "../scripts/browser-assets";

describe("browser image evidence", () => {
  it("reports timed-out and broken images, including natural dimensions", () => {
    expect(
      failedBrowserImages([
        { url: "https://example.test/ok.png", complete: true, naturalWidth: 10, naturalHeight: 10 },
        {
          url: "https://example.test/broken.png",
          complete: true,
          naturalWidth: 0,
          naturalHeight: 0,
        },
        {
          url: "https://example.test/pending.png",
          complete: false,
          naturalWidth: 0,
          naturalHeight: 0,
        },
      ]),
    ).toEqual([
      "https://example.test/broken.png (complete=true, naturalWidth=0, naturalHeight=0)",
      "https://example.test/pending.png (complete=false, naturalWidth=0, naturalHeight=0)",
    ]);
  });
});
