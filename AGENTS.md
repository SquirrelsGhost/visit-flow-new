# visit-flow v2 – Architektur-Regeln

> Diese Regeln gelten für alle, Menschen wie KI-Agenten. Mehrere Agenten arbeiten parallel an diesem Repo,
> deshalb ist Einheitlichkeit wichtiger als persönlicher Stil. Die wichtigsten Regeln erzwingt ESLint;
> was hier steht und nicht automatisch geprüft wird, gilt trotzdem.

## 1. Aufbau

```
apps/
  api/        Express 5 – REST, später Socket.io, Cron-Jobs. Datenbank: PostgreSQL über Drizzle ORM.
  web/        Next.js 16 (App Router) + React + Capacitor – ein Build für Web, Admin/Office, iOS und Android.
              Seiten in src/app/ setzen nur zusammen und liefern generateMetadata() über TranslationService.
  client/     Alter Vite-Client, wird entfernt, sobald apps/web alles übernommen hat. Nichts Neues mehr hier.
packages/
  shared/     Typen, Zod-Schemas, Rollen, API-Format. Von api und client importiert.
```

- Module der API liegen unter `apps/api/src/modules/<modul>/`: `<Name>.model.ts` (Drizzle-Tabelle), `<Name>Repository.ts`, `<Name>Service.ts`, `<modul>.routes.ts`.
- Querschnitt (HTTP, Auth, Krypto, Datenschutz) liegt unter `apps/api/src/lib/`.
- Im Client: `app/` setzt nur zusammen, `components/<feature>/` für UI, `hooks/`, `lib/`, `texts/`.
- Keine Barrel-Dateien (`index.ts`, die nur re-exportieren). Das Shared-Paket exportiert über Subpfade (`@visit-flow/shared/consent`).

## 2. Harte Regeln (ESLint, Pre-Commit und CI brechen ab)

| Regel | Warum |
| --- | --- |
| Max. 150 Zeilen pro Datei (ohne Leer- und Kommentarzeilen) | Keine 2.700-Zeilen-Router mehr wie in v1 |
| Kein `any` | Typen sind der Vertrag zwischen Client und API |
| `import type` für reine Typen | Saubere Builds |
| Keine `eslint-disable`-Kommentare (werden ignoriert) | Ausnahmen gehören sichtbar in `eslint.config.mjs` |

Ausnahmen vom Zeilenlimit stehen in `MAX_LINES_AUSNAHMEN` in `eslint.config.mjs`, jede mit Begründung.

## 3. API-Endpunkte

- Jeder Endpunkt wird mit `defineRoute()` registriert. Pflicht ist `auth`: eine Mindestrolle oder ausdrücklich `"public"`.
- Body, Query und Params werden mit Zod geprüft. Schemas, die auch der Client braucht, liegen in `packages/shared`.
- Schemas für Eingaben sind `.strict()`, damit niemand Felder wie `role` oder `teamId` mitschicken kann (Mass-Assignment, Pentest C-4/C-5).
- Routen enthalten keine Geschäftslogik. Der Handler ruft einen Service auf und gibt dessen Ergebnis zurück.
- Antworten nur über `ok()` / `err()`: `{ success: true, data }` oder `{ success: false, error, message }`.
  `message` bleibt, solange der v1-Client noch v2-Endpunkte aufruft.
- Fehler als `HttpError` werfen (`badRequest`, `forbidden`, `conflict` …). Der zentrale Error-Handler übersetzt sie.

## 4. Datenbank (PostgreSQL)

- **Die ganze App nutzt nur PostgreSQL** (Emre, 25.10.2026). Keine zweite Datenbank, kein MongoDB, Redis oder SQLite im Server. Was sonst Redis erledigen würde (Sperren, Zähler, Warteschlangen, Benachrichtigungen), läuft über Tabellen, Advisory-Locks oder LISTEN/NOTIFY. Die einzige Ausnahme ist der `mongodb`-Treiber im Übernahmeskript, der v1 nur liest.
- Betrieb, Rollen und Sicherungen stehen in `docs/postgres-server.md`. Die API verbindet sich als `visitflow_app` (nur Lesen und Schreiben), Migrationen laufen als `visitflow_owner`.
- Tabellen werden in `<Name>.model.ts` mit Drizzle beschrieben (Spalten camelCase im Code, snake_case in der Datenbank).
- Jede Schemaänderung: Model ändern, `npm run db:generate --workspace=@visit-flow/api`, die erzeugte SQL-Datei in `apps/api/drizzle/` lesen und mit committen. Die CI bricht ab, wenn Model und Migrationen auseinanderlaufen.
- Migrationen nie nachträglich ändern, nur neue anhängen. Eingespielt wird mit `npm run db:migrate` einmal pro Deploy, nicht beim Start jeder Instanz.
- Verweise sind Fremdschlüssel mit bewusst gewähltem `onDelete`. Feste Wertelisten sind Postgres-Enums (`pgEnum`), Regeln über mehrere Spalten CHECK-Constraints.
- Jede Information hat genau eine Quelle (kein doppeltes `member_ids` neben `team_id` wie in v1). Keine JSON-Sammelspalten für Felder, die eigentlich Spalten sind; `jsonb` nur für wirklich freie Daten (z. B. Audit-Metadaten).
- IDs sind `uuid` (UUIDv7 über `newId()` aus `lib/db/ids.ts`). IDs aus Anfragen vor der Abfrage mit `isUuid()` prüfen. Reine Protokolltabellen nutzen eine fortlaufende `bigint`-ID.
- Fachliche Nutzerfelder (Tagesstatus, Pins, Rechnungsadresse …) gehören in die Tabellen ihres Moduls, nicht in `users`.
- Services kennen nur ihr Repository-Interface. SQL steht ausschließlich in Repositories und Models.
- Access-Tokens haben dasselbe Format wie in v1 (HS256, `{ id, email, role }`, 15 Minuten) und dasselbe `JWT_SECRET`.
- v1 ist strikt read-only. Daten aus v1 kommen nur über das Übernahmeskript `apps/api/src/migration/v1/` (siehe `docs/umstieg-postgres.md`). Wer ein Modul portiert, ergänzt dort den Schritt für seine Collections und übersetzt v1-IDs über die `IdMap`.

## 5. Datenschutz (Privacy by Design)

- Sensible Felder werden mit `seal()` aus `lib/crypto/dataCipher.ts` verschlüsselt. Gelesen wird mit `readField()`, das auch Klartext aus v1 versteht.
- Muss nach einem verschlüsselten Feld gesucht werden, bekommt es zusätzlich einen `blindIndex()`. Eigener Schlüssel (`BLIND_INDEX_KEY`).
- Löschfristen meldet jedes Modul als `RetentionRule` an (`lib/db/retention.ts`), ein Job löscht stündlich. Keine Aufräum-Logik in Endpunkten. Abfragen, bei denen die Frist zählt, filtern zusätzlich selbst nach Zeit.
- Logs speichern keine vollen IPs und User-Agents: `shortenIp()` und `browserName()` aus `lib/privacy/anonymize.ts`.
- Jeder Service mit personenbezogenen Daten implementiert `PrivacyCleanable` (`onUserExport`, `onUserDelete`) und meldet sich bei der Privacy-Registry an.
- Externe Inhalte im Client nur in `<ExternalContent>`; nichts lädt vor der Einwilligung.

## 6. Client

- Jede Komponente in eigener Datei, Default-Export, Name = Dateiname, Props als `interface` in derselben Datei.
- Seiten und `App.tsx` setzen nur Komponenten zusammen, keine eigene Logik und kein eigenes Markup.
- API-Aufrufe nur über `lib/apiClient.ts`. Er liefert immer eine `ApiResponse`, auch im Funkloch.
- Wiederholte Tailwind-Klassen als Konstante oben in der Datei.
- Texte für Nutzer liegen in `src/texts/`, nicht im JSX.

## 7. Tests

- Jedes portierte Modul bekommt vorher Tests, die das Verhalten von v1 festhalten (siehe Pflicht-Testfälle der Phase-0-Bestandsaufnahme).
- `npm run check` muss vor jedem Push grün sein (Lint, Typecheck, Tests).
- Datenbank-Tests (`*.pg.test.ts`) laufen gegen ein echtes PostgreSQL, wenn `TEST_DATABASE_URL` gesetzt ist (in der CI automatisch). Jede Datei holt sich mit `createTestDatabase()` eine eigene, frisch migrierte Datenbank.
