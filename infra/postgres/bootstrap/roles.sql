-- Run as a PostgreSQL administrator during environment provisioning.
-- Passwords and login credentials are never stored in source control.

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'seta_exp_app') THEN CREATE ROLE seta_exp_app NOLOGIN; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'seta_exp_migrator') THEN CREATE ROLE seta_exp_migrator NOLOGIN; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'seta_exp_readonly') THEN CREATE ROLE seta_exp_readonly NOLOGIN; END IF;
END $$;

REVOKE ALL ON DATABASE seta_expreso FROM PUBLIC;
GRANT CONNECT ON DATABASE seta_expreso TO seta_exp_app, seta_exp_migrator, seta_exp_readonly;
GRANT USAGE ON SCHEMA public TO seta_exp_app, seta_exp_migrator, seta_exp_readonly;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO seta_exp_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO seta_exp_app;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO seta_exp_readonly;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO seta_exp_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO seta_exp_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO seta_exp_readonly;

-- The migrator is reserved for controlled deployment ownership.
-- Its LOGIN/password must be provisioned outside Git and only when required.
