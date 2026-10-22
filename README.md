# visit-flow v2

Neuaufbau von visit-flow auf einem sauberen Fundament. v2 läuft parallel zu v1 auf derselben Datenbank
und übernimmt Modul für Modul, bis v1 abgeschaltet werden kann.

## Starten

Voraussetzung: Node 22 und eine MongoDB.

```bash
npm install
cp apps/api/.env.example apps/api/.env      # Werte eintragen
cp apps/web/.env.example apps/web/.env
npm run dev:api      # API: http://localhost:3002/api/health
npm run dev:web      # App (Next.js): http://localhost:3001/login
```

## Prüfen

```bash
npm run check   # Lint, Typecheck, Tests
npm run build
```

## Aufbau

| Paket | Inhalt |
| --- | --- |
| `apps/api` | Express 5, `defineRoute` mit Zod, Auth kompatibel zu v1, Verschlüsselung, Consent-Protokoll |
| `apps/web` | Next.js 16 (App Router), React 19, Tailwind 4, Capacitor 8, Einwilligungs-Banner nach § 25 TDDDG. Leitet `/api` an die API weiter |
| `apps/client` | Alter Vite-Client, wird durch `apps/web` ersetzt und danach entfernt |
| `packages/shared` | API-Format, Rollen, Consent-Typen und -Schemas |

Die Regeln für Code in diesem Repo stehen in [AGENTS.md](./AGENTS.md).
