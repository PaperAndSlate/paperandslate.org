import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX({
  configPath: "./source.config.ts",
  macro: false,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@paper-and-slate/content"],
  output:
    process.env.PAPER_SLATE_BUILD_MODE === "verification"
      ? undefined
      : process.env.NODE_ENV === "production"
        ? "standalone"
        : undefined,
};

export default withMDX(nextConfig);
