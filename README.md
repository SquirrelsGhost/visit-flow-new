# visit-flow v2

Neuaufbau von visit-flow auf einem sauberen Fundament. v2 läuft parallel zu v1 auf derselben Datenbank
und übernimmt Modul für Modul, bis v1 abgeschaltet werden kann.

## Starten

Voraussetzung: Node 22 und eine MongoDB.

```bash
npm install
cp apps/api/.env.example apps/api/.env      # Werte eintragen
cp apps/client/.env.example apps/client/.env
npm run dev:api      # http://localhost:3002/api/health (3001 belegt das v1-Backend)
npm run dev:client   # App: http://localhost:5173/login
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
| `apps/client` | Vite, React 19, Tailwind 4, Capacitor 8, Einwilligungs-Banner nach § 25 TDDDG |
| `packages/shared` | API-Format, Rollen, Consent-Typen und -Schemas |

Die Regeln für Code in diesem Repo stehen in [AGENTS.md](./AGENTS.md).
