import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import {
  createDeveloperAuthOptions,
  DCP_BETTER_AUTH_AUTH_SCHEMA,
  DCP_BETTER_AUTH_ROLE_MAP,
  DCP_BETTER_AUTH_STORAGE_ROLES,
} from "../packages/developer-control-plane/src/auth";
import { DCP_REASON_CODES } from "../packages/developer-control-plane/src/model";

type AuthField = {
  type: string | readonly string[];
  required?: boolean;
  fieldName?: string;
  unique?: boolean;
  index?: boolean;
  defaultValue?: unknown;
  references?: { model: string; field: string };
};

type AuthTable = {
  modelName: string;
  fields: Record<string, AuthField>;
  indexes?: readonly { fields: readonly string[]; unique?: boolean }[];
};

const root = process.cwd();
const migrationRoot = path.join(root, "packages", "developer-control-plane", "migrations");
const packageRoot = path.join(root, "packages", "developer-control-plane");
const files = fs
  .readdirSync(migrationRoot)
  .filter((file) => file.endsWith(".sql"))
  .sort();
if (
  files.join(",") !== "0001_auth_schema.sql,0002_control_schema.sql,0003_least_privilege_roles.sql"
)
  throw new Error("Unexpected DCP migration inventory");
const sql = files.map((file) => fs.readFileSync(path.join(migrationRoot, file), "utf8")).join("\n");

const dcpPackage = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8")) as {
  dependencies?: Record<string, string>;
};
if (dcpPackage.dependencies?.["better-auth"] !== "1.7.2")
  throw new Error("Migration parity requires better-auth 1.7.2");

const requireBetterAuth = createRequire(path.join(packageRoot, "package.json"));
const { getAuthTables } = requireBetterAuth("better-auth/db") as {
  getAuthTables: (
    options: ReturnType<typeof createDeveloperAuthOptions>,
  ) => Record<string, AuthTable>;
};

for (const required of [
  "CREATE SCHEMA IF NOT EXISTS auth",
  "CREATE SCHEMA IF NOT EXISTS control",
  "REFERENCES auth.organization",
  "REFERENCES control.developer_project",
  "REFERENCES control.api_key_metadata",
  "UNIQUE (organization_id, policy_version)",
  "CHECK (status <> 'revoked' OR overlap_ends_at IS NULL)",
  "REVOKE ALL ON ALL TABLES IN SCHEMA auth FROM PUBLIC",
  "REVOKE ALL ON ALL TABLES IN SCHEMA control FROM PUBLIC",
  "CREATE ROLE paper_slate_dcp_app NOLOGIN NOSUPERUSER",
])
  if (!sql.includes(required)) throw new Error(`Missing DCP migration control: ${required}`);

const controlSql = fs.readFileSync(path.join(migrationRoot, "0002_control_schema.sql"), "utf8");
for (const forbidden of [
  "plaintext",
  "authorization_header",
  "key_secret",
  "secret_value",
  "verifier_digest",
  "session_token",
])
  if (controlSql.toLowerCase().includes(forbidden))
    throw new Error(`Forbidden secret-bearing control column: ${forbidden}`);

if ((sql.match(/^BEGIN;$/gm) ?? []).length !== files.length)
  throw new Error("Every migration must be transaction-bounded");
if ((sql.match(/^COMMIT;$/gm) ?? []).length !== files.length)
  throw new Error("Every migration must commit deterministically");

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function qualifiedIdentifier(value: string) {
  return `(?:"${escapeRegExp(value)}"|${escapeRegExp(value)})`;
}

function getAuthSurface() {
  const baseURL = "https://control.example.test";
  const options = createDeveloperAuthOptions({
    enabled: true,
    fixtureAuthEnabled: true,
    database: {} as never,
    secret: "x".repeat(32),
    baseURL,
    trustedOrigins: [baseURL],
  });
  if (typeof options.advanced?.database?.generateId !== "function")
    throw new Error("Auth ID strategy is not the configured UUIDv7 generator");
  return { options, tables: getAuthTables(options) };
}

function parseTableBlocks() {
  const blocks = new Map<string, string>();
  const pattern = /CREATE TABLE\s+auth\.(?:"([^"]+)"|([a-z_][a-z0-9_]*))\s*\(([\s\S]*?)\);/gi;
  for (const match of sql.matchAll(pattern)) {
    const table = match[1] ?? match[2];
    const body = match[3];
    if (!table || !body) throw new Error("Malformed auth migration table");
    blocks.set(table, body);
  }
  return blocks;
}

function columnLine(body: string, name: string) {
  const pattern = new RegExp(
    `^\\s*(?:"${escapeRegExp(name)}"|${escapeRegExp(name)})\\s+[^\\r\\n]+$`,
    "im",
  );
  return body.match(pattern)?.[0] ?? null;
}

function columnNames(body: string) {
  const names = new Set<string>();
  for (const line of body.split(/\r?\n/)) {
    const match = /^\s*(?:"([^"]+)"|([a-z_][a-z0-9_]*))\s+/i.exec(line);
    const name = match?.[1] ?? match?.[2];
    if (name && !/^(?:constraint|primary|unique|check|foreign)$/i.test(name)) names.add(name);
  }
  return names;
}

function postgresType(
  field: { type: unknown; references?: { field?: string } },
  fieldName: string,
) {
  if (fieldName === "id" || field.references?.field === "id") return "text";
  if (field.type === "string") return "text";
  if (field.type === "boolean") return "boolean";
  if (field.type === "date") return "timestamptz";
  if (field.type === "json") return "jsonb";
  if (field.type === "number") return "integer";
  throw new Error(`Unsupported Better Auth field type for ${fieldName}`);
}

function declaredType(line: string) {
  return line.match(/^\s*(?:"[^"]+"|[a-z_][a-z0-9_]*)\s+([a-z]+)/i)?.[1]?.toLowerCase();
}

function hasIndex(table: string, fields: readonly string[]) {
  const pattern = new RegExp(
    `CREATE\\s+(?:UNIQUE\\s+)?INDEX[\\s\\S]*?ON\\s+auth\\.${qualifiedIdentifier(table)}\\s*\\(([^)]*)\\)`,
    "gi",
  );
  return [...sql.matchAll(pattern)].some((match) =>
    fields.every((field) =>
      new RegExp(`(?:"${escapeRegExp(field)}"|\\b${escapeRegExp(field)}\\b)`, "i").test(
        match[1] ?? "",
      ),
    ),
  );
}

function hasUniqueConstraint(table: string, fields: readonly string[]) {
  const body = parseTableBlocks().get(table) ?? "";
  const pattern = /UNIQUE\s*\(([^)]*)\)/gi;
  return [...body.matchAll(pattern)].some((match) =>
    fields.every((field) =>
      new RegExp(`(?:"${escapeRegExp(field)}"|\\b${escapeRegExp(field)}\\b)`, "i").test(
        match[1] ?? "",
      ),
    ),
  );
}

function hasUnique(table: string, field: string) {
  const line = columnLine(parseTableBlocks().get(table) ?? "", field);
  if (line && /\bUNIQUE\b/i.test(line)) return true;
  return hasIndex(table, [field]);
}

function hasReference(line: string, model: string, field: string) {
  return new RegExp(
    `REFERENCES\\s+auth\\.${qualifiedIdentifier(model)}\\s*\\(\\s*(?:"${escapeRegExp(field)}"|${escapeRegExp(field)})\\s*\\)`,
    "i",
  ).test(line);
}

function assertRoleConfiguration(options: ReturnType<typeof createDeveloperAuthOptions>) {
  const organizationPlugin = options.plugins?.find((plugin) => plugin.id === "organization") as
    | {
        options?: {
          creatorRole?: unknown;
          roles?: Record<string, unknown>;
        };
      }
    | undefined;
  const configuredRoles = Object.keys(organizationPlugin?.options?.roles ?? {}).sort();
  const expectedRoles = [...DCP_BETTER_AUTH_STORAGE_ROLES].sort();
  if (JSON.stringify(configuredRoles) !== JSON.stringify(expectedRoles))
    throw new Error("Better Auth organization roles do not match the DCP role mapping");
  if (organizationPlugin?.options?.creatorRole !== "owner")
    throw new Error("Better Auth organization creator role must be owner");
  for (const role of Object.values(DCP_BETTER_AUTH_ROLE_MAP))
    if (!configuredRoles.includes(role)) throw new Error(`Missing configured DCP role: ${role}`);
  return expectedRoles;
}

const { options: authOptions, tables: authTables } = getAuthSurface();
const configuredRoles = assertRoleConfiguration(authOptions);
const expectedModels = [
  "user",
  "session",
  "account",
  "verification",
  "organization",
  "member",
  "invitation",
];
if (JSON.stringify(Object.keys(authTables).sort()) !== JSON.stringify([...expectedModels].sort()))
  throw new Error("Better Auth getAuthTables model inventory changed");

const tableBlocks = parseTableBlocks();
if (tableBlocks.size !== expectedModels.length)
  throw new Error("Auth migration does not contain exactly the Better Auth table inventory");

for (const model of expectedModels) {
  const definition = authTables[model];
  const body = tableBlocks.get(model);
  if (!definition || !body) throw new Error(`Missing auth migration table: ${model}`);
  if (definition.modelName !== model)
    throw new Error(`Unexpected Better Auth model mapping: ${model}`);

  const expectedFields = new Set([
    "id",
    ...Object.entries(definition.fields).map(([name, field]) => field.fieldName || name),
  ]);
  const actualFields = columnNames(body);
  if (
    expectedFields.size !== actualFields.size ||
    [...expectedFields].some((field) => !actualFields.has(field))
  )
    throw new Error(`Auth migration fields do not match Better Auth getAuthTables for ${model}`);

  const idLine = columnLine(body, "id");
  if (!idLine || declaredType(idLine) !== "text" || !/7\[0-9a-f\]/i.test(idLine))
    throw new Error(
      `Auth migration ${model}.id does not match the configured UUIDv7 text strategy`,
    );

  for (const [logicalName, field] of Object.entries(definition.fields)) {
    const physicalName = field.fieldName || logicalName;
    const line = columnLine(body, physicalName);
    if (!line) throw new Error(`Missing Better Auth field ${model}.${physicalName}`);
    if (declaredType(line) !== postgresType(field, logicalName))
      throw new Error(`Wrong PostgreSQL type for Better Auth field ${model}.${physicalName}`);
    const required = field.required !== false;
    if (required !== /\bNOT NULL\b/i.test(line))
      throw new Error(`Nullability drift for Better Auth field ${model}.${physicalName}`);
    if (field.defaultValue === false && !/DEFAULT\s+false\b/i.test(line))
      throw new Error(`Missing false default for Better Auth field ${model}.${physicalName}`);
    if (typeof field.defaultValue === "string" && !line.includes(`DEFAULT '${field.defaultValue}'`))
      throw new Error(`Missing configured default for Better Auth field ${model}.${physicalName}`);
    if (field.unique && !hasUnique(model, physicalName))
      throw new Error(`Missing unique constraint for Better Auth field ${model}.${physicalName}`);
    if (
      field.index &&
      !hasIndex(model, [physicalName]) &&
      !hasUnique(model, physicalName) &&
      !hasUniqueConstraint(model, [physicalName])
    )
      throw new Error(`Missing index for Better Auth field ${model}.${physicalName}`);
    if (field.references && !hasReference(line, field.references.model, field.references.field))
      throw new Error(`Missing foreign key for Better Auth field ${model}.${physicalName}`);
  }

  for (const index of definition.indexes ?? []) {
    if (
      !hasIndex(model, index.fields) &&
      !(index.unique && hasUniqueConstraint(model, index.fields))
    )
      throw new Error(`Missing Better Auth table index for ${model}: ${index.fields.join(",")}`);
  }
}

for (const role of configuredRoles) {
  const rolePattern = new RegExp(
    `"role"\\s+text[\\s\\S]*?CHECK\\s*\\(\\s*"role"\\s+IN\\s*\\(([^)]*)\\)`,
    "i",
  );
  if (!rolePattern.test(sql) || !new RegExp(`'${escapeRegExp(role)}'`).test(sql))
    throw new Error(`Migration role constraint omits configured Better Auth role: ${role}`);
}

if (!sql.includes(`"role" text NOT NULL DEFAULT 'member'`))
  throw new Error("Migration must preserve Better Auth's pinned member default");
if (!sql.includes(`CREATE SCHEMA IF NOT EXISTS ${DCP_BETTER_AUTH_AUTH_SCHEMA}`))
  throw new Error("Better Auth physical schema mapping is not auth");

const reasonCheck = sql.match(
  /reason_code\s+text\s+NOT NULL\s+CHECK\s*\(\s*reason_code\s+IN\s*\(([^)]*)\)/i,
);
if (!reasonCheck || DCP_REASON_CODES.some((code) => !reasonCheck[1].includes(`'${code}'`)))
  throw new Error("Migration reason-code constraint does not match the bounded DCP allowlist");

console.log(
  `Verified ${files.length} deterministic DCP PostgreSQL migrations against Better Auth 1.7.2 getAuthTables (${expectedModels.length} models, ${configuredRoles.length} configured roles) without connecting.`,
);
