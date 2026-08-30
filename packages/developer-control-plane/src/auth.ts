import { betterAuth, type BetterAuthOptions } from "better-auth";
import { createAccessControl, organization } from "better-auth/plugins";
import type { Pool } from "pg";
import { v7 as uuidv7 } from "uuid";
import type { OrganizationRole } from "./model";

export const DCP_SESSION_SECONDS = 7 * 24 * 60 * 60;
export const DCP_SESSION_REFRESH_SECONDS = 24 * 60 * 60;
export const DCP_SESSION_FRESH_SECONDS = 5 * 60;
export const DCP_BETTER_AUTH_AUTH_SCHEMA = "auth" as const;
export const DCP_BETTER_AUTH_ID_STRATEGY = "uuidv7-custom-text" as const;

const dcpAccessControl = createAccessControl({
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
} as const);

const dcpOwnerRole = dcpAccessControl.newRole({
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
});
const dcpAdminRole = dcpAccessControl.newRole({
  organization: ["update"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
});
const dcpDeveloperRole = dcpAccessControl.newRole({
  organization: [],
  member: [],
  invitation: [],
  team: [],
  ac: ["read"],
});
const dcpReadOnlyAnalystRole = dcpAccessControl.newRole({
  organization: [],
  member: [],
  invitation: [],
  team: [],
  ac: ["read"],
});

export const DCP_BETTER_AUTH_ROLE_MAP: Readonly<Record<OrganizationRole, string>> = {
  owner: "owner",
  admin: "admin",
  developer: "developer",
  read_only_analyst: "read_only_analyst",
};

export const DCP_BETTER_AUTH_STORAGE_ROLES = [
  "owner",
  "admin",
  "member",
  "developer",
  "read_only_analyst",
] as const;

const dcpBetterAuthRoles = {
  owner: dcpOwnerRole,
  admin: dcpAdminRole,
  member: dcpDeveloperRole,
  developer: dcpDeveloperRole,
  read_only_analyst: dcpReadOnlyAnalystRole,
};

export type DeveloperAuthConfig = {
  enabled: boolean;
  fixtureAuthEnabled: boolean;
  database: Pool | undefined;
  secret: string | undefined;
  baseURL: string | undefined;
  trustedOrigins: readonly string[];
};

export class DeveloperAuthConfigurationError extends Error {
  readonly code = "DCP_AUTH_CONFIGURATION_INVALID";

  constructor() {
    super("Developer Control Plane authentication is disabled or incompletely configured");
    this.name = "DeveloperAuthConfigurationError";
  }

  toJSON() {
    return { code: this.code, message: this.message };
  }
}

function exactOrigin(value: string) {
  const url = new URL(value);
  if (url.origin !== value || url.username || url.password)
    throw new DeveloperAuthConfigurationError();
  return url.origin;
}

export function createDeveloperAuthOptions(config: DeveloperAuthConfig): BetterAuthOptions {
  if (
    !config.enabled ||
    !config.database ||
    !config.secret ||
    config.secret.length < 32 ||
    !config.baseURL ||
    config.trustedOrigins.length === 0
  )
    throw new DeveloperAuthConfigurationError();

  const baseURL = exactOrigin(config.baseURL);
  const trustedOrigins = [...new Set(config.trustedOrigins.map(exactOrigin))];
  if (!trustedOrigins.includes(baseURL)) throw new DeveloperAuthConfigurationError();

  return {
    appName: "Paper & Slate Developer Control Plane",
    database: config.database,
    secret: config.secret,
    baseURL,
    trustedOrigins,
    emailAndPassword: { enabled: config.fixtureAuthEnabled },
    session: {
      expiresIn: DCP_SESSION_SECONDS,
      updateAge: DCP_SESSION_REFRESH_SECONDS,
      freshAge: DCP_SESSION_FRESH_SECONDS,
      cookieCache: { enabled: false },
    },
    advanced: {
      useSecureCookies: baseURL.startsWith("https://"),
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
        secure: baseURL.startsWith("https://"),
        path: "/",
      },
      crossSubDomainCookies: { enabled: false },
      disableCSRFCheck: false,
      disableOriginCheck: false,
      database: { generateId: () => uuidv7() },
    },
    plugins: [
      organization({
        creatorRole: "owner",
        roles: dcpBetterAuthRoles,
      }),
    ],
  };
}

export function createDeveloperAuth(config: DeveloperAuthConfig) {
  return betterAuth(createDeveloperAuthOptions(config));
}
