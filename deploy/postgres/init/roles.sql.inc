-- Endung .sql.inc, damit das Image die Datei nicht selbst ausführt: 01-roles.sh ruft sie mit den Passwörtern auf.
-- Rollen und Rechte für visit-flow v2. Läuft einmal beim ersten Start (leerer Datenordner).
-- Erwartet die psql-Variablen owner_pw und app_pw (siehe 01-roles.sh).
--
-- visitflow_owner  besitzt Datenbank und Schema, spielt Migrationen ein (npm run db:migrate, migrate:v1)
-- visitflow_app    nur für die laufende API: lesen und schreiben, aber keine Tabellen anlegen,
--                  ändern oder löschen. Ein Fehler in der API kann so kein Schema zerstören.

CREATE ROLE visitflow_owner LOGIN PASSWORD :'owner_pw';
CREATE ROLE visitflow_app LOGIN PASSWORD :'app_pw' CONNECTION LIMIT 60;

CREATE DATABASE visitflow OWNER visitflow_owner;
REVOKE ALL ON DATABASE visitflow FROM PUBLIC;
GRANT CONNECT, TEMPORARY ON DATABASE visitflow TO visitflow_app;

\connect visitflow

ALTER SCHEMA public OWNER TO visitflow_owner;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO visitflow_app;

-- Gilt für alle Tabellen, die visitflow_owner später per Migration anlegt
ALTER DEFAULT PRIVILEGES FOR ROLE visitflow_owner IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO visitflow_app;
ALTER DEFAULT PRIVILEGES FOR ROLE visitflow_owner IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO visitflow_app;
ALTER DEFAULT PRIVILEGES FOR ROLE visitflow_owner IN SCHEMA public
  GRANT USAGE ON TYPES TO visitflow_app;

-- Hängende Abfragen und vergessene Transaktionen nicht ewig laufen lassen
ALTER ROLE visitflow_app SET statement_timeout = '15s';
ALTER ROLE visitflow_app SET idle_in_transaction_session_timeout = '60s';
