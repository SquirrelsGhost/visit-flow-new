#!/usr/bin/env bash
# Nächtliche Sicherung der v2-Datenbank, verschlüsselt mit age. Ohne Empfänger-Schlüssel bricht das
# Skript ab: unverschlüsselte Sicherungen mit Kundendaten sollen gar nicht erst entstehen.
#
#   VF_BACKUP_RECIPIENT=age1… ./backup.sh      (z. B. per Cron um 03:15)
#
# Wiederherstellen: age -d -i schluessel.txt datei.dump.age | pg_restore -d visitflow --clean --if-exists
set -euo pipefail

DIR="${VF_DB_DIR:-/srv/visit-flow/postgres}/backups"
KEEP_DAYS="${VF_BACKUP_KEEP_DAYS:-14}"
: "${VF_BACKUP_RECIPIENT:?VF_BACKUP_RECIPIENT (öffentlicher age-Schlüssel) fehlt}"

umask 077
mkdir -p "$DIR"
FILE="$DIR/visitflow-$(date +%Y-%m-%d_%H%M).dump.age"
cd "$(dirname "$0")"

docker compose exec -T postgres pg_dump -U postgres -d visitflow --format=custom --no-owner \
  | age -r "$VF_BACKUP_RECIPIENT" > "$FILE.tmp"
mv "$FILE.tmp" "$FILE"
find "$DIR" -name 'visitflow-*.dump.age' -mtime +"$KEEP_DAYS" -delete
echo "[Backup] $FILE"
