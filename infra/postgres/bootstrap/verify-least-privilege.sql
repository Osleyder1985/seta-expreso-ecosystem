CREATE ROLE seta_exp_app LOGIN PASSWORD 'ci-app-password';
CREATE ROLE seta_exp_readonly LOGIN PASSWORD 'ci-readonly-password';
GRANT CONNECT ON DATABASE seta_expreso TO seta_exp_app, seta_exp_readonly;
GRANT USAGE ON SCHEMA public TO seta_exp_app, seta_exp_readonly;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO seta_exp_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO seta_exp_app;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO seta_exp_readonly;
