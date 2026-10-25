#!/usr/bin/env bash
# Wird vom postgres-Image beim ersten Start ausgeführt. Liest die Passwörter aus den Docker-Secrets,
# damit sie weder in der Compose-Datei noch in der Prozessliste stehen.
set -euo pipefail

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres \
  -v owner_pw="$(cat /run/secrets/visitflow_owner_password)" \
  -v app_pw="$(cat /run/secrets/visitflow_app_password)" \
  -f /docker-entrypoint-initdb.d/roles.sql.inc
