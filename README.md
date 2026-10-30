# Visit Flow

A Next.js 16 project with TypeScript and Tailwind CSS.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001/login) to see the result.

---

## Architecture

This project follows a strict **component-based architecture**. Every piece of UI is a component. Pages are composers only — they assemble components, never define raw JSX markup inline.

### Example

```tsx
// src/app/page.tsx
export default function HomePage() {
  return (
    <main>
      <Navigation>
        <NavigationItem href="/" label="Home" />
        <NavigationItem href="/about" label="About" />
        <NavigationVerticalLine />
        <NavigationLoginButton />
      </Navigation>
      <HeroSection />
    </main>
  );
}
```

### Folder Structure

```
src/
├── app/                  # App Router — pages & layouts ONLY
├── components/           # All UI components
│   ├── navigation/       # Feature-grouped components
│   │   ├── Navigation.tsx
│   │   ├── NavigationItem.tsx
│   │   ├── NavigationVerticalLine.tsx
│   │   ├── NavigationLoginButton.tsx
│   │   └── index.ts      # Barrel export
│   └── ui/               # Atomic primitives (Button, Badge, …)
├── hooks/                # Custom hooks (use*.ts)
├── lib/                  # Utilities & constants
├── types/                # Shared TypeScript types
└── styles/               # globals.css only
```

### Key Rules

| Rule | Summary |
|---|---|
| **Component files** | `PascalCase.tsx`, one component per file, max 150 lines |
| **Props** | Explicit `interface Props`, no `any` |
| **Composition** | Prefer `<Parent><Child /></Parent>` over prop arrays |
| **Barrel exports** | Import from `index.ts`, not individual files |
| **Server/Client** | Default Server Component; `"use client"` only at leaf level |
| **Styling** | Tailwind classes only; no inline `style={{}}` |
| **Constants** | In `src/lib/constants.ts` or top of file — no magic strings in JSX |

> Full rules for AI agents are in [`AGENTS.md`](./AGENTS.md).

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Linting | ESLint 9 |
