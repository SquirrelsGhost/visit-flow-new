# visit-flow v2 – Architektur-Regeln

> Diese Regeln gelten für alle, Menschen wie KI-Agenten. Mehrere Agenten arbeiten parallel an diesem Repo,
> deshalb ist Einheitlichkeit wichtiger als persönlicher Stil. Die wichtigsten Regeln erzwingt ESLint;
> was hier steht und nicht automatisch geprüft wird, gilt trotzdem.

## 1. Aufbau

```
apps/
  api/        Express 5 – REST, später Socket.io, Cron-Jobs. Läuft parallel zu v1 auf derselben MongoDB.
  web/        Next.js 16 (App Router) + React + Capacitor – ein Build für Web, Admin/Office, iOS und Android.
              Seiten in src/app/ setzen nur zusammen und liefern generateMetadata() über TranslationService.
  client/     Alter Vite-Client, wird entfernt, sobald apps/web alles übernommen hat. Nichts Neues mehr hier.
packages/
  shared/     Typen, Zod-Schemas, Rollen, API-Format. Von api und client importiert.
```

- Module der API liegen unter `apps/api/src/modules/<modul>/`: `<Name>.model.ts`, `<Name>Repository.ts`, `<Name>Service.ts`, `<modul>.routes.ts`.
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

## 4. Parallelbetrieb mit v1

- v2 nutzt dieselbe MongoDB wie v1. Schemaänderungen an bestehenden Collections sind nur **additiv**, solange v1 schreibt.
- Neue Daten bekommen eigene Collections (Beispiel: `consentlogs` statt der v1-Collection `userconsents`).
- Access-Tokens haben dasselbe Format wie in v1 (HS256, `{ id, email, role }`, 15 Minuten) und dasselbe `JWT_SECRET`.
- Nginx schaltet Endpunkt-Gruppen einzeln auf v2 um, sobald ein Modul seine Abnahme bestanden hat.

## 5. Datenschutz (Privacy by Design)

- Sensible Felder werden mit `seal()` aus `lib/crypto/dataCipher.ts` verschlüsselt. Gelesen wird mit `readField()`, das auch Klartext aus v1 versteht.
- Muss nach einem verschlüsselten Feld gesucht werden, bekommt es zusätzlich einen `blindIndex()`. Eigener Schlüssel (`BLIND_INDEX_KEY`).
- Löschfristen sind TTL-Indizes in MongoDB, keine Aufräum-Logik in Endpunkten.
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
- Datenbank-Tests laufen gegen eine echte MongoDB, wenn `MONGO_TEST_URI` gesetzt ist (in der CI automatisch).
