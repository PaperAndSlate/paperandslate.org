import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  KIT_ENABLED: z.enum(["true", "false"]).default("false"),
  KIT_API_KEY: z.string().optional(),
  KIT_FORM_ID: z.string().optional(),
  KIT_API_URL: z.string().url().default("https://api.convertkit.com/v3"),
  NEWSLETTER_RATE_LIMIT: z.coerce.number().int().positive().default(5),
  NEWSLETTER_RATE_WINDOW_SECONDS: z.coerce.number().int().positive().default(600),
  TRUSTED_PROXY_MODE: z.enum(["none", "coolify"]).default("none"),
  PUBLICATION_AS_OF: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .default("2026-08-27"),
  VALKEY_URL: z.string().url().optional(),
  SEARCH_PROVIDER: z.enum(["static", "typesense"]).default("static"),
  TYPESENSE_ENDPOINT: z.string().url().optional(),
  TYPESENSE_API_KEY: z.string().optional(),
  TYPESENSE_COLLECTION: z.string().default("search_records"),
  TYPESENSE_INDEX_ID: z.string().optional(),
  GLITCHTIP_DSN: z.string().url().optional(),
  RELEASE_ID: z.string().default("local-development"),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(input: NodeJS.ProcessEnv = process.env): Env {
  return envSchema.parse(input);
}
