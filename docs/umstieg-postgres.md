# Umstieg auf PostgreSQL

Entscheidung vom 24.10.2026: v2 läuft auf PostgreSQL statt auf der gemeinsamen MongoDB mit v1.
Der Strangler-Plan mit geteilter Datenbank entfällt. v1 bleibt strikt read-only und wird am
Umstiegstag einmal ausgelesen.

## Was sich ändert

Das Schema ist ohne Rücksicht auf v1 neu entworfen (Entscheidung Emre, 25.10.2026: „Schema sauber
neu, Konten mit“). Die Daten kommen trotzdem einmal über das Übernahmeskript.

| v1 (MongoDB) | v2 (PostgreSQL) |
| --- | --- |
| `_id` als ObjectId | `uuid` (UUIDv7 über `newId()`); die Zuordnung alt → neu steht in `v1_ids` |
| `isWhitelisted` + `whitelistStatus` | ein Enum `approval_status` (pending, approved, rejected) |
| `isBlocked` + `blockedAt` + `blockUntil` | `blocked_at` (gesetzt = gesperrt) + `blocked_until` |
| `loginAttempts`, `lockedUntil` am Nutzer | entfallen, die Drosselung steht in `login_failures` |
| `role` + `roles` | `role` + `extra_roles` als Enum-Arrays |
| `users.teamId` und `teams.member_ids` | nur `users.team_id`; Mentoren in `team_mentors` |
| `areas.team_ids` und `teams.area_id` | nur `teams.area_id` |
| `subscriptions.type = "addon"` | `subscriptions.is_addon` |
| rund 50 fachliche Felder im Nutzerdokument | gehören dem jeweiligen Modul und kommen mit dessen Portierung |
| TTL-Indizes | `RetentionRule` je Modul, stündlicher Job mit Advisory-Lock |
| `MONGO_URI`, `MONGO_TEST_URI` | `DATABASE_URL`, `TEST_DATABASE_URL` |

Die Profil-Antwort (`/api/auth/me`, Login) behält die Feldnamen, die der Client kennt (`roles`,
`isWhitelisted`, `whitelistStatus`, `isBlocked` …). Fachliche Felder wie `dailyStatus`,
`strukturleiterCustomGroups`, `partnerStatus` oder `isAnonymousInLeaderboard` fehlen dort, bis ihr
Modul portiert ist.

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
| `users` | `users` | Nur Kontofelder. E-Mail klein geschrieben; unbekannte Rolle wird `berater`; doppelte E-Mail behält das zuletzt aktive Konto; Verweise auf fehlende Teams/Mentoren werden entfernt; ohne `teamId` gilt das Team, in dessen `member_ids` der Nutzer steht. Nie übernommen: IP, User-Agent, Geräte-IDs |
| `areas` | `areas` | |
| `teams` | `teams`, `team_mentors` | Gebiet aus `area_id`, sonst aus `areas.team_ids` |
| `subscriptions` | `subscriptions` | Nur Status-Felder fürs Profil, Stripe-IDs kommen mit dem Abrechnungsmodul |
| `systemsettings` | `system_settings` | |
| `refresh_tokens` | `refresh_tokens` | Nur gültige, nicht gesperrte, auf die neue UUID umgeschrieben. Gleicher SHA-256, deshalb bleibt das `vf_refresh`-Cookie gültig |

Bewusst nicht übernommen: `login_failures` (nach 15 Minuten wertlos), `audit_logs` (v1 bleibt als
read-only Archiv 90 Tage abrufbar), `consentlogs` (v2 war noch nicht live).

Jedes weitere Modul hängt bei seiner Portierung einen Schritt in `migrateV1.ts` ein, übersetzt v1-IDs
über `ctx.ids` und bekommt einen Test in `migrationV1.pg.test.ts`. Offen sind unter anderem Fahrtenbuch, Enes-Gedächtnis, `userconsents`
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
8. **v2 starten.** Alte Access-Tokens (ObjectId) lehnt v2 ab, der Client holt sich mit dem
   Refresh-Cookie sofort ein neues. Niemand muss sich neu anmelden.
9. **Nginx auf v2 umstellen**, Stichproben: Login, Profil, Teamansicht, `/api/health` meldet `connected`.
10. **Zurück, falls nötig:** Nginx wieder auf v1. Da v1 nicht verändert wurde, ist es exakt im Stand von
    Schritt 3. Daten, die in v2 seit Schritt 8 entstanden sind, gehen dabei verloren, deshalb die
    Entscheidung innerhalb der ersten Stunde treffen.

## Offene Punkte

- **Hosting** der Produktionsdatenbank (eigener Server oder Managed in der EU), Backups mit
  Point-in-Time-Restore, TLS (`?sslmode=require`).
- **Mongo-Nutzer mit Rolle `read`** für das Skript in v1 anlegen (Emre, ohne Änderung am v1-Code).
- Die fachlichen Nutzerfelder aus v1 je Modul übernehmen (Liste in `docs/umstieg-postgres.md` oben).
