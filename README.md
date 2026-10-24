# visit-flow v2

Neuaufbau von visit-flow auf einem sauberen Fundament mit PostgreSQL. Die Daten aus v1 (MongoDB) kommen
am Umstiegstag über ein einmaliges Übernahmeskript, v1 selbst wird dabei nur gelesen
(siehe [docs/umstieg-postgres.md](./docs/umstieg-postgres.md)).

## Starten

Voraussetzung: Node 22 und PostgreSQL 17 oder neuer.

```bash
npm install
cp apps/api/.env.example apps/api/.env      # Werte eintragen
cp apps/web/.env.example apps/web/.env
npm run db:migrate --workspace=@visit-flow/api   # Tabellen anlegen
npm run dev:api      # API: http://localhost:3002/api/health
npm run dev:web      # App (Next.js): http://localhost:3001/login
```

## Prüfen

```bash
npm run check   # Lint, Typecheck, Tests
npm run build
```

Datenbank-Tests laufen mit, sobald `TEST_DATABASE_URL` auf ein PostgreSQL zeigt, zum Beispiel:

```bash
docker run -d --name vf-pg -e POSTGRES_PASSWORD=visitflow -p 5432:5432 postgres:18
TEST_DATABASE_URL=postgres://postgres:visitflow@localhost:5432/postgres npm test
```

## Aufbau

| Paket | Inhalt |
| --- | --- |
| `apps/api` | Express 5, `defineRoute` mit Zod, PostgreSQL mit Drizzle, Auth kompatibel zu v1, Verschlüsselung, Consent-Protokoll, Übernahme aus v1 |
| `apps/web` | Next.js 16 (App Router), React 19, Tailwind 4, Capacitor 8, Einwilligungs-Banner nach § 25 TDDDG. Leitet `/api` an die API weiter |
| `apps/client` | Alter Vite-Client, wird durch `apps/web` ersetzt und danach entfernt |
| `packages/shared` | API-Format, Rollen, Consent-Typen und -Schemas |

Die Regeln für Code in diesem Repo stehen in [AGENTS.md](./AGENTS.md).
