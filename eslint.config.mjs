import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Fumadocs owns this generated collection. docs:validate regenerates and validates it;
  // author-source lint must not treat its generated @ts-nocheck boundary as authored code.
  { ignores: ["**/.next/**", "**/.source/**", "**/node_modules/**", "**/dist/**", "plans/**"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Next.js owns this generated file; keep all other lint rules active.
    files: ["apps/web/next-env.d.ts"],
    rules: { "@typescript-eslint/triple-slash-reference": "off" },
  },
);
