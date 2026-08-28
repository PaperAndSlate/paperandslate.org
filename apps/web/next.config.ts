import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX({
  configPath: "./source.config.ts",
  macro: false,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@paper-and-slate/content"],
  images: {
    // Reference assets are part of the page UI. An attachment disposition can
    // make Chromium treat the optimized response as a download, leaving the
    // image element incomplete during production visual capture.
    contentDispositionType: "inline",
  },
  output:
    process.env.PAPER_SLATE_BUILD_MODE === "verification"
      ? undefined
      : process.env.NODE_ENV === "production"
        ? "standalone"
        : undefined,
};

export default withMDX(nextConfig);
