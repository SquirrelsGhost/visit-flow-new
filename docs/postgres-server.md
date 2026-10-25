# PostgreSQL auf dem eigenen Server

Entscheidung Emre (25.10.2026): Die ganze App nutzt nur PostgreSQL. Es läuft auf dem eigenen Server
in einem eigenen, abgesicherten Ordner. Die Dateien dafür liegen in `deploy/postgres/`.

## Aufbau

```
/srv/visit-flow/postgres/        root:root, chmod 700
  data/                          Datenbankdateien (gehört dem Container-Nutzer postgres)
  secrets/                       chmod 700, je Passwort eine Datei mit chmod 600
    postgres_password            Superuser, nur für Wartung
    visitflow_owner_password     Besitzer des Schemas, nur für Migrationen
    visitflow_app_password       laufende API
  backups/                       verschlüsselte Sicherungen
```

Sicherheit im Überblick:

- **Nur lokal erreichbar:** Der Port hängt an `127.0.0.1:5432`. Von außen ist die Datenbank nicht
  erreichbar, die API auf demselben Server verbindet sich lokal. Die Firewall bleibt für 5432 zu.
- **Drei Rollen:** Die API läuft als `visitflow_app` und darf nur lesen und schreiben, aber keine
  Tabellen anlegen, ändern, leeren oder löschen. Migrationen laufen als `visitflow_owner`. Den
  Superuser `postgres` braucht nur die Wartung.
- **Passwörter:** SCRAM-SHA-256, als Docker-Secrets aus Dateien, nicht in Umgebungsvariablen oder Git.
- **Datenprüfsummen** sind eingeschaltet und erkennen kaputte Blöcke.
- **Laufzeitgrenzen:** Für die App-Rolle gelten 15 s pro Abfrage und 60 s für offene Transaktionen.
- **Sicherungen** werden mit `age` verschlüsselt. Ohne Schlüssel bricht das Skript ab.

## Einrichten (einmalig)

Voraussetzung: Docker mit Compose-Plugin und `age` (`apt install age`).

```bash
sudo install -d -m 700 /srv/visit-flow/postgres /srv/visit-flow/postgres/secrets /srv/visit-flow/postgres/backups
for name in postgres_password visitflow_owner_password visitflow_app_password; do
  sudo sh -c "openssl rand -base64 36 | tr -d '\n' > /srv/visit-flow/postgres/secrets/$name"
  sudo chmod 600 /srv/visit-flow/postgres/secrets/$name
done

cd deploy/postgres
sudo docker compose up -d          # legt beim ersten Start Rollen und Datenbank an
sudo docker compose ps             # Status "healthy" abwarten
```

Danach in `apps/api/.env` auf dem Server:

```bash
DATABASE_URL=postgres://visitflow_app:<visitflow_app_password>@127.0.0.1:5432/visitflow
```

Migrationen bei jedem Deploy, vor dem Neustart der API, als Besitzer:

```bash
DATABASE_URL=postgres://visitflow_owner:<visitflow_owner_password>@127.0.0.1:5432/visitflow \
  npm run db:migrate --workspace=@visit-flow/api
```

Das Übernahmeskript (`migrate:v1`) läuft ebenfalls mit der Besitzer-URL.

Sonderzeichen im Passwort müssen in der URL kodiert sein (`encodeURIComponent`). Die Befehle oben
erzeugen Base64, darin können `+`, `/` und `=` vorkommen.

## Sicherungen

```bash
age-keygen -o visitflow-backup-key.txt     # NICHT auf dem Server lassen, z. B. im Passwortmanager
# öffentlichen Schlüssel (age1…) in die Cron-Zeile eintragen:
15 3 * * * VF_BACKUP_RECIPIENT=age1… /pfad/zum/repo/deploy/postgres/backup.sh >> /var/log/visitflow-backup.log 2>&1
```

- Die Sicherungen bleiben 14 Tage auf dem Server (`VF_BACKUP_KEEP_DAYS`). Zusätzlich sollte täglich
  eine Kopie auf einen zweiten Ort gehen (anderer Server oder Storage-Box), sonst hilft die Sicherung
  bei einem Plattenschaden nicht.
- Wiederherstellung einmal im Monat auf einem Testsystem ausprobieren:
  `age -d -i visitflow-backup-key.txt datei.dump.age | pg_restore -d visitflow --clean --if-exists`
- Wenn höchstens einige Minuten verloren gehen dürfen statt einem Tag, kommt später WAL-Archivierung
  (z. B. pgBackRest) dazu.

## Ohne Docker

Gleiche Idee mit dem Paket `postgresql-18`:
- Datenordner in `/srv/visit-flow/postgres/data` (`initdb --data-checksums --auth=scram-sha-256`).
- `listen_addresses = 'localhost'` setzen.
- `pg_hba.conf` nur `host visitflow all 127.0.0.1/32 scram-sha-256` erlauben.
- `deploy/postgres/init/roles.sql.inc` einmal mit `psql -v owner_pw=… -v app_pw=…` ausführen.
