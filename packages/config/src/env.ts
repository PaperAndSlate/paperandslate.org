import { z } from "zod";

const baseEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DEPLOYMENT_ENV: z.enum(["local", "ci", "staging", "production"]).default("local"),
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
  VALKEY_KEY_PREFIX: z
    .string()
    .regex(/^[A-Za-z0-9._-]{1,64}:$/)
    .default("paper_and_slate_web_cache:"),
  SEARCH_PROVIDER: z.enum(["static", "typesense"]).default("static"),
  TYPESENSE_ENDPOINT: z.string().url().optional(),
  TYPESENSE_API_KEY: z.string().optional(),
  TYPESENSE_SEARCH_API_KEY: z.string().optional(),
  TYPESENSE_COLLECTION: z.string().default("search_records"),
  TYPESENSE_COLLECTION_ALIAS: z.string().default("search_records"),
  TYPESENSE_INDEX_ID: z.string().optional(),
  GLITCHTIP_DSN: z.string().url().optional(),
  RELEASE_ID: z.string().default("local-development"),
  DCP_ENABLED: z.enum(["true", "false"]).default("false"),
  DCP_FIXTURE_AUTH_ENABLED: z.enum(["true", "false"]).default("false"),
  DCP_DATABASE_URL: z.string().url().optional(),
  DCP_BETTER_AUTH_SECRET: z.string().min(32).optional(),
  DCP_BETTER_AUTH_URL: z.string().url().optional(),
  DCP_TRUSTED_ORIGINS: z.string().optional(),
});

export const envSchema = baseEnvSchema.superRefine((env, context) => {
  if (env.DCP_ENABLED === "true") {
    const required: Array<[keyof typeof env, unknown]> = [
      ["DCP_DATABASE_URL", env.DCP_DATABASE_URL],
      ["DCP_BETTER_AUTH_SECRET", env.DCP_BETTER_AUTH_SECRET],
      ["DCP_BETTER_AUTH_URL", env.DCP_BETTER_AUTH_URL],
      ["DCP_TRUSTED_ORIGINS", env.DCP_TRUSTED_ORIGINS],
    ];
    for (const [path, value] of required) {
      if (!value)
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [path],
          message: `${path} is required when DCP_ENABLED=true`,
        });
    }
    if (env.DCP_DATABASE_URL && !/^postgres(?:ql)?:\/\//.test(env.DCP_DATABASE_URL))
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DCP_DATABASE_URL"],
        message: "DCP_DATABASE_URL must use PostgreSQL",
      });
  }

  if (
    env.DCP_FIXTURE_AUTH_ENABLED === "true" &&
    (env.DCP_ENABLED !== "true" ||
      env.DEPLOYMENT_ENV === "staging" ||
      env.DEPLOYMENT_ENV === "production")
  )
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["DCP_FIXTURE_AUTH_ENABLED"],
      message: "DCP fixture authentication is permitted only in enabled local or CI environments",
    });
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(input: NodeJS.ProcessEnv = process.env): Env {
  return envSchema.parse(input);
}
