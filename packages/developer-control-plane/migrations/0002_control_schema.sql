BEGIN;

CREATE SCHEMA IF NOT EXISTS control;

CREATE TABLE control.developer_project (
  id uuid PRIMARY KEY CHECK (substring(id::text FROM 15 FOR 1) = '7'),
  organization_id text NOT NULL REFERENCES auth.organization ("id") ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 160),
  status text NOT NULL CHECK (status IN ('active', 'disabled')),
  created_at timestamptz NOT NULL,
  UNIQUE (organization_id, name)
);

CREATE TABLE control.api_key_metadata (
  id uuid PRIMARY KEY CHECK (substring(id::text FROM 15 FOR 1) = '7'),
  organization_id text NOT NULL REFERENCES auth.organization ("id") ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES control.developer_project (id) ON DELETE CASCADE,
  provider_key_id text NOT NULL CHECK (char_length(provider_key_id) BETWEEN 1 AND 255),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 160),
  status text NOT NULL CHECK (status IN ('active', 'rotating', 'revoked')),
  created_at timestamptz NOT NULL,
  expires_at timestamptz,
  predecessor_key_id uuid REFERENCES control.api_key_metadata (id) ON DELETE RESTRICT,
  overlap_ends_at timestamptz,
  revoked_at timestamptz,
  policy_version bigint NOT NULL CHECK (policy_version > 0),
  UNIQUE (organization_id, provider_key_id),
  CHECK (status <> 'revoked' OR revoked_at IS NOT NULL),
  CHECK (status <> 'revoked' OR overlap_ends_at IS NULL),
  CHECK (predecessor_key_id IS NULL OR predecessor_key_id <> id)
);
CREATE INDEX control_api_key_project_index ON control.api_key_metadata (organization_id, project_id);

CREATE TABLE control.organization_policy_version (
  organization_id text PRIMARY KEY REFERENCES auth.organization ("id") ON DELETE CASCADE,
  current_version bigint NOT NULL CHECK (current_version >= 0),
  updated_at timestamptz NOT NULL
);

CREATE TABLE control.command_idempotency (
  command_id uuid PRIMARY KEY CHECK (substring(command_id::text FROM 15 FOR 1) = '7'),
  organization_id text NOT NULL REFERENCES auth.organization ("id") ON DELETE CASCADE,
  operation text NOT NULL CHECK (operation IN ('key.created', 'key.rotated', 'key.revoked')),
  result_key_id uuid NOT NULL REFERENCES control.api_key_metadata (id) ON DELETE CASCADE,
  state text NOT NULL CHECK (state = 'completed'),
  completed_at timestamptz NOT NULL
);

CREATE TABLE control.lifecycle_audit (
  id uuid PRIMARY KEY CHECK (substring(id::text FROM 15 FOR 1) = '7'),
  organization_id text NOT NULL REFERENCES auth.organization ("id") ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES control.developer_project (id) ON DELETE CASCADE,
  key_id uuid NOT NULL REFERENCES control.api_key_metadata (id) ON DELETE RESTRICT,
  actor_id text NOT NULL REFERENCES auth."user" ("id") ON DELETE RESTRICT,
  action text NOT NULL CHECK (action IN ('key.created', 'key.rotated', 'key.revoked')),
  result text NOT NULL CHECK (result IN ('success', 'denied', 'failed')),
  policy_version bigint NOT NULL CHECK (policy_version > 0),
  correlation_id uuid NOT NULL CHECK (substring(correlation_id::text FROM 15 FOR 1) = '7'),
  reason_code text NOT NULL CHECK (reason_code IN ('requested', 'owner-request', 'security-incident', 'compromised', 'expired', 'administrative')),
  occurred_at timestamptz NOT NULL
);
CREATE INDEX control_audit_tenant_time_index ON control.lifecycle_audit (organization_id, occurred_at);

CREATE TABLE control.lifecycle_outbox (
  id uuid PRIMARY KEY CHECK (substring(id::text FROM 15 FOR 1) = '7'),
  organization_id text NOT NULL REFERENCES auth.organization ("id") ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES control.developer_project (id) ON DELETE CASCADE,
  key_id uuid NOT NULL REFERENCES control.api_key_metadata (id) ON DELETE RESTRICT,
  event_type text NOT NULL CHECK (event_type IN ('key.created', 'key.rotated', 'key.revoked')),
  policy_version bigint NOT NULL CHECK (policy_version > 0),
  state text NOT NULL CHECK (state IN ('pending', 'failed', 'acknowledged')),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  occurred_at timestamptz NOT NULL,
  acknowledged_at timestamptz,
  failed_at timestamptz,
  UNIQUE (organization_id, policy_version),
  CHECK (state <> 'acknowledged' OR acknowledged_at IS NOT NULL),
  CHECK (state <> 'failed' OR failed_at IS NOT NULL)
);
CREATE INDEX control_outbox_delivery_index ON control.lifecycle_outbox (state, occurred_at);

REVOKE ALL ON SCHEMA control FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA control FROM PUBLIC;

COMMIT;
