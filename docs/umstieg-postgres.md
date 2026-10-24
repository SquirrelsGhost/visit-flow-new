# Umstieg auf PostgreSQL

Entscheidung vom 24.10.2026: v2 läuft auf PostgreSQL statt auf der gemeinsamen MongoDB mit v1.
Der Strangler-Plan mit geteilter Datenbank entfällt. v1 bleibt strikt read-only und wird am
Umstiegstag einmal ausgelesen.

## Was sich ändert

| Vorher (MongoDB) | Jetzt (PostgreSQL) |
| --- | --- |
| Mongoose-Models auf v1-Collections | Drizzle-Tabellen in `<Name>.model.ts`, SQL-Migrationen in `apps/api/drizzle/` |
| `_id` als ObjectId | `id text` mit derselben ObjectId als Hex; neue IDs über `newObjectId()` im selben Format |
| TTL-Indizes | `RetentionRule` je Modul, stündlicher Job mit Advisory-Lock (`lib/db/retention.ts`) |
| `teams.member_ids` / `mentor_ids`, `areas.team_ids` + `teams.area_id` | Tabellen `team_members` und `area_teams` (eine Quelle statt zwei) |
| Freie Felder im Nutzerdokument | Feste Spalten für alles, was v2 nutzt; übrige v1-Profilfelder vorübergehend in `users.profile` (jsonb) |
| `MONGO_URI`, `MONGO_TEST_URI` | `DATABASE_URL`, `TEST_DATABASE_URL` |

`users.profile` ist eine Übergangslösung: Jedes Modul, das portiert wird, zieht seine Felder in echte
Spalten oder Tabellen um (z. B. Tagesbericht, Rechnungsadresse, Pins). Neue Felder kommen nie dorthin.

## Übernahmeskript

`apps/api/src/migration/v1/`, Aufruf aus `apps/api`:

```bash
V1_MONGO_URI=… DATABASE_URL=… npm run migrate:v1 -- --dry-run   # Probe, speichert nichts
V1_MONGO_URI=… DATABASE_URL=… npm run migrate:v1                 # echte Übernahme
```

- Liest nur. Das Interface zur Quelle kennt nur `read`, und das Skript bricht ab, wenn der Mongo-Nutzer
  Schreibrechte hat. Dafür in v1 einen eigenen Nutzer mit Rolle `read` anlegen.
- Alles in einer Transaktion: entweder kommt alles an oder nichts.
- Läuft nur in eine leere Datenbank. `--reset` leert vorher die übernommenen Tabellen (für Proben auf
  Staging, gesperrt bei `NODE_ENV=production`).
- Das Protokoll nennt nur IDs, keine E-Mails oder Namen.

Übernommen werden heute:

| v1 | v2 | Hinweise |
| --- | --- | --- |
| `users` | `users` | E-Mail klein geschrieben; unbekannte Rolle wird `berater`; doppelte E-Mail behält das zuletzt aktive Konto; Verweise auf fehlende Teams/Mentoren werden entfernt. Nicht übernommen: `lastIpAddress`, `userAgent`, `deviceIds` (Datensparsamkeit), `stripeCustomerId` (kommt mit dem Abrechnungsmodul) |
| `teams` | `teams`, `team_members` | Mitglieder nur, wenn der Nutzer existiert |
| `areas` | `areas`, `area_teams` | Beide v1-Zuordnungen zusammengeführt |
| `subscriptions` | `subscriptions` | Nur Status-Felder fürs Profil |
| `systemsettings` | `system_settings` | |
| `refresh_tokens` | `refresh_tokens` | Nur gültige, nicht gesperrte. Gleicher SHA-256, deshalb bleibt das `vf_refresh`-Cookie gültig |

Bewusst nicht übernommen: `login_failures` (nach 15 Minuten wertlos), `audit_logs` (v1 bleibt als
read-only Archiv 90 Tage abrufbar), `consentlogs` (v2 war noch nicht live).

Jedes weitere Modul hängt bei seiner Portierung einen Schritt in `migrateV1.ts` ein, mit Test in
`migrationV1.pg.test.ts`. Offen sind unter anderem Fahrtenbuch, Enes-Gedächtnis, `userconsents`
(GPS-Widerspruch, rechtlich wichtig), Visits/Leads, Battle, Abrechnung.

## Ablauf am Umstiegstag

Voraussetzung: v2 kann alles, was die Nutzer an v1 brauchen. Ohne gemeinsame Datenbank laufen v1 und
v2 nicht parallel auf echten Daten.

1. **Vorher (mehrmals):** Probe auf Staging mit einer aktuellen Kopie: `migrate:v1 -- --reset`, Hinweise
   im Protokoll klären, Login mit echten Testkonten prüfen.
2. **Wartungsfenster ankündigen** (Vorschlag: nachts, 30 Minuten).
3. **v1 schreibend stoppen:** Nginx zeigt die Wartungsseite, v1-API anhalten. Ab hier ändert sich in
   MongoDB nichts mehr.
4. **Sicherung:** `mongodump` von v1 (bleibt als Archiv), leere Produktionsdatenbank für v2 bereit.
5. **Schema:** `npm run db:migrate` gegen Produktion.
6. **Probe:** `migrate:v1 -- --dry-run` gegen Produktion, Zahlen mit der letzten Staging-Probe vergleichen.
7. **Übernahme:** `migrate:v1`.
8. **v2 starten** mit demselben `JWT_SECRET` wie v1. Laufende Access-Tokens (15 Min.) und Refresh-Cookies
   (7 Tage) gelten weiter, niemand muss sich neu anmelden.
9. **Nginx auf v2 umstellen**, Stichproben: Login, Profil, Teamansicht, `/api/health` meldet `connected`.
10. **Zurück, falls nötig:** Nginx wieder auf v1. Da v1 nicht verändert wurde, ist es exakt im Stand von
    Schritt 3. Daten, die in v2 seit Schritt 8 entstanden sind, gehen dabei verloren, deshalb die
    Entscheidung innerhalb der ersten Stunde treffen.

## Offene Punkte

- **Hosting** der Produktionsdatenbank (eigener Server oder Managed in der EU), Backups mit
  Point-in-Time-Restore, TLS (`?sslmode=require`).
- **Mongo-Nutzer mit Rolle `read`** für das Skript in v1 anlegen (Emre, ohne Änderung am v1-Code).
- Was in `users.profile` liegt, wandert je Modul in Spalten.
