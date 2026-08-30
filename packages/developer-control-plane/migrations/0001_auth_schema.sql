BEGIN;

CREATE SCHEMA IF NOT EXISTS auth;

-- Better Auth 1.7.2 uses the custom UUIDv7 generator from auth.ts. The
-- direct PostgreSQL adapter therefore stores generated string IDs as text.
CREATE TABLE auth."user" (
  "id" text PRIMARY KEY CHECK ("id" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  "name" text NOT NULL CHECK (char_length("name") BETWEEN 1 AND 160),
  "email" text NOT NULL,
  "emailVerified" boolean NOT NULL DEFAULT false,
  "image" text,
  "createdAt" timestamptz NOT NULL,
  "updatedAt" timestamptz NOT NULL
);
CREATE UNIQUE INDEX auth_user_email_unique ON auth."user" ("email");

CREATE TABLE auth.account (
  "id" text PRIMARY KEY CHECK ("id" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  "issuer" text NOT NULL,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES auth."user" ("id") ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  "scope" text,
  "password" text,
  "createdAt" timestamptz NOT NULL,
  "updatedAt" timestamptz NOT NULL,
  CONSTRAINT auth_account_issuer_account_unique UNIQUE ("issuer", "accountId")
);
CREATE INDEX auth_account_user_id_index ON auth.account ("userId");

CREATE TABLE auth.session (
  "id" text PRIMARY KEY CHECK ("id" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  "expiresAt" timestamptz NOT NULL,
  "token" text NOT NULL UNIQUE,
  "createdAt" timestamptz NOT NULL,
  "updatedAt" timestamptz NOT NULL,
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES auth."user" ("id") ON DELETE CASCADE,
  "activeOrganizationId" text
);
CREATE INDEX auth_session_user_id_index ON auth.session ("userId");

CREATE TABLE auth.verification (
  "id" text PRIMARY KEY CHECK ("id" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL,
  "updatedAt" timestamptz NOT NULL
);
CREATE INDEX auth_verification_identifier_index ON auth.verification ("identifier");

CREATE TABLE auth.organization (
  "id" text PRIMARY KEY CHECK ("id" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  "name" text NOT NULL CHECK (char_length("name") BETWEEN 1 AND 160),
  "slug" text NOT NULL CHECK ("slug" ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  "logo" text,
  "createdAt" timestamptz NOT NULL,
  "metadata" text
);
CREATE UNIQUE INDEX auth_organization_slug_unique ON auth.organization ("slug");

ALTER TABLE auth.session
  ADD CONSTRAINT auth_session_active_organization_fk
  FOREIGN KEY ("activeOrganizationId") REFERENCES auth.organization ("id") ON DELETE SET NULL;

CREATE TABLE auth.member (
  "id" text PRIMARY KEY CHECK ("id" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  "organizationId" text NOT NULL REFERENCES auth.organization ("id") ON DELETE CASCADE,
  "userId" text NOT NULL REFERENCES auth."user" ("id") ON DELETE CASCADE,
  "role" text NOT NULL DEFAULT 'member' CHECK ("role" IN ('owner', 'admin', 'member', 'developer', 'read_only_analyst')),
  "createdAt" timestamptz NOT NULL,
  CONSTRAINT auth_member_organization_user_unique UNIQUE ("organizationId", "userId")
);
CREATE INDEX auth_member_user_id_index ON auth.member ("userId");

CREATE TABLE auth.invitation (
  "id" text PRIMARY KEY CHECK ("id" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  "organizationId" text NOT NULL REFERENCES auth.organization ("id") ON DELETE CASCADE,
  "email" text NOT NULL,
  "role" text CHECK ("role" IS NULL OR "role" IN ('owner', 'admin', 'member', 'developer', 'read_only_analyst')),
  "status" text NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'accepted', 'rejected', 'canceled')),
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL,
  "inviterId" text NOT NULL REFERENCES auth."user" ("id") ON DELETE CASCADE
);
CREATE INDEX auth_invitation_organization_index ON auth.invitation ("organizationId");
CREATE INDEX auth_invitation_email_index ON auth.invitation ("email");

REVOKE ALL ON SCHEMA auth FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA auth FROM PUBLIC;

COMMIT;
