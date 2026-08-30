BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'paper_slate_dcp_app') THEN
    CREATE ROLE paper_slate_dcp_app NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'paper_slate_dcp_migrator') THEN
    CREATE ROLE paper_slate_dcp_migrator NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA auth, control TO paper_slate_dcp_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth, control TO paper_slate_dcp_app;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA auth, control FROM paper_slate_dcp_app;

GRANT USAGE, CREATE ON SCHEMA auth, control TO paper_slate_dcp_migrator;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth, control TO paper_slate_dcp_migrator;

ALTER DEFAULT PRIVILEGES IN SCHEMA auth, control REVOKE ALL ON TABLES FROM PUBLIC;

COMMIT;
