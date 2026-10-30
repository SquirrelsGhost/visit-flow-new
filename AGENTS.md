<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Project Architecture Rules

> These rules are **mandatory** for all contributors — human or AI.
> Multiple agents work on this codebase. Consistency is non-negotiable.

---

## 1. Component-Based Architecture

Every piece of UI **must** be a component. No inline JSX logic in pages beyond composing components.

**Pages are composers only:**
```tsx
// src/app/page.tsx — CORRECT ✅
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
      <FeatureGrid />
    </main>
  );
}
```

```tsx
// src/app/page.tsx — WRONG ❌
export default function HomePage() {
  return (
    <nav className="flex gap-4">
      <a href="/">Home</a>
      <a href="/about">About</a>
    </nav>
  );
}
```

---

## 2. File & Folder Structure

```
src/
├── app/                        # Next.js App Router (pages & layouts ONLY)
│   ├── layout.tsx
│   ├── page.tsx
│   └── [route]/
│       └── page.tsx
│
├── components/                 # All reusable UI components
│   ├── navigation/
│   │   ├── Navigation.tsx
│   │   ├── NavigationItem.tsx
│   │   ├── NavigationVerticalLine.tsx
│   │   └── NavigationLoginButton.tsx
│   │
│   ├── ui/                     # Generic, atomic UI primitives
│   │   ├── Button.tsx
│   │   └── Badge.tsx
│   │
│   └── [feature]/              # Feature-specific components (same pattern)
│
├── hooks/                      # Custom React hooks (use*.ts)
├── lib/                        # Pure utility functions, helpers, constants
├── types/                      # Shared TypeScript types & interfaces
└── styles/                     # Global styles (only globals.css lives here)
```

**Rules:**
- Each component gets its **own file** named exactly like the component (`NavigationItem.tsx`).
- Import components directly from their file path — no barrel `index.ts` files.
- No component file should exceed **150 lines**. Split it if it does.

---

## 3. Component Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Component file | `PascalCase.tsx` | `NavigationItem.tsx` |
| Component export | `export default function` | `export default function NavigationItem` |
| Component import | Default import — never named | `import Button from "@/components/ui/Button"` |
| Hook file | `camelCase.ts` | `useAuth.ts` |
| Utility file | `camelCase.ts` | `formatDate.ts` |
| Type file | `camelCase.ts` | `user.types.ts` |
| Folder | `camelCase` | `navigation/`, `ui/` |

---

## 4. Component Composition Pattern

Parent components **receive children** through explicit named child components, not via props arrays or JSX spread.

```tsx
// CORRECT ✅ — explicit, readable, composable
<Navigation>
  <NavigationItem href="/" label="Home" />
  <NavigationItem href="/docs" label="Docs" />
  <NavigationVerticalLine />
  <NavigationLoginButton />
</Navigation>

// WRONG ❌ — opaque, hard to extend
<Navigation items={["Home", "Docs"]} showLogin />
```

---

## 5. Props & TypeScript

- **Every** component must have an explicitly typed `Props` interface defined in the same file.
- Use `interface` for props, `type` for unions/aliases.
- No `any`. No implicit `any`. Period.

```tsx
// CORRECT ✅
interface NavigationItemProps {
  href: string;
  label: string;
  isActive?: boolean;
}

export default function NavigationItem({ href, label, isActive = false }: NavigationItemProps) {
  // ...
}
```

---

## 6. Styling Rules (Tailwind)

- Use Tailwind utility classes directly in JSX. No inline `style={{}}` objects unless unavoidable (e.g. dynamic CSS variables).
- Extract repeated class combinations into a `const` or helper at the top of the file — never duplicate long class strings.
- No global CSS except for `src/styles/globals.css` (base resets, CSS variables, font imports).

---

## 7. Server vs. Client Components & Dynamic Routes

- **Default to Server Components.** Only add `"use client"` when the component needs browser APIs, event listeners, or React state/effects.
- Never put `"use client"` on a page or layout unless absolutely necessary — add it to the smallest possible leaf component instead.
- Document **why** a component is a Client Component with a comment above the directive.

```tsx
// Needs useState for controlled input
"use client";
```

### Pages that read `cookies()` or `headers()` must export `instant = false`

In Next.js 16, calling `cookies()` or `headers()` (e.g. via `TranslationService`) outside a `<Suspense>` boundary triggers a prerender error. Every page in this project that calls `TranslationService.GetUserTranslations()` **must** include:

```tsx
// This page reads request-time data (cookies/headers) for locale detection.
// instant = false opts it out of prerender validation — rendering is still server-side.
// See: https://nextjs.org/docs/messages/blocking-prerender-runtime
export const instant = false;
```

Place it before `generateMetadata`. This is a Next.js 16 route-segment config — not a component concern.

---

## 8. One Responsibility Per Component

A component does **one thing**. If you find yourself writing two unrelated UI concerns in one component — split it.

---

## 9. No Magic Numbers or Hardcoded Strings in JSX

Put constants in `src/lib/constants.ts` or co-locate them at the top of the file.

```tsx
// CORRECT ✅
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
] as const;

// WRONG ❌
<NavigationItem href="/about" label="About" />  // string scattered across JSX
```

---

## 10. SEO — `generateMetadata` on Every Page

Every page **must** export a `generateMetadata` function (not a static `metadata` object).
This keeps meta tags **locale-aware** — the same system that translates UI strings also translates SEO tags.

### How it works

```
ITranslation (per page namespace)
  └── MetaTags: IMetaTags          ← title, description, imgUrl, tags, url
        │
        ▼
TranslationService.GetUserTranslations()   ← resolves locale from cookie / Accept-Language
        │
        ▼
MetaTagService.CreateMetaTags(t.PageName.MetaTags)   ← returns full Next.js Metadata
```

### Pattern (copy this into every page)

```tsx
import { Metadata } from "next";
import { MetaTagService } from "@/services/MetaTagService";
import { TranslationService } from "@/services/TranslationService";

export async function generateMetadata(): Promise<Metadata> {
  const t = await TranslationService.GetUserTranslations();
  return MetaTagService.CreateMetaTags(t.PageName.MetaTags);
}
```

### Adding meta tags for a new page

1. Add a `MetaTags: IMetaTags` field to the page namespace in `ITranslation.ts`
2. Fill in values for every locale (`en/en.ts`, `de/de.ts`, …)
3. Export `generateMetadata` in the page file as above

### `IMetaTags` fields

| Field | Requirement |
|---|---|
| `title` | Full page title — **not** shortened (MetaTagService sets this directly, no template) |
| `description` | 140–160 characters. Unique per page. |
| `imgUrl` | Absolute URL to a 1200×630 PNG in `/public/og/` |
| `tags` | Array of keyword strings |
| `url` | Canonical absolute URL of the page |

> **Never** use a static `export const metadata` in pages. Always use `generateMetadata`.
> The only static `metadata` allowed is the site-wide default in `layout.tsx`.

---

## 11. API Routes

Next.js App Router API routes live in `src/app/api/` as `route.ts` files.

### File structure

```
src/app/api/
└── [resource]/
    └── route.ts    ← one file per resource, named exports per HTTP verb
```

### Always use `ok()` and `err()` from `@/lib/api`

Every endpoint must return a consistent `{ success, data | error }` shape.
Never return a raw object from an API route.

```ts
import { ok, err } from "@/lib/api";

// { success: true,  data: T }
return ok(data);

// { success: false, error: string }
return err("Something went wrong", 400);
```

### Pattern (copy this for every new route)

```ts
import { ok, err } from "@/lib/api";

// 1. Define the response type in this file (or src/types/)
interface MyResponse {
  id: string;
  name: string;
}

// 2. Named export for each HTTP verb you support
export async function GET(): Promise<Response> {
  try {
    // 3. Call a service — no business logic inside the handler
    const data: MyResponse = await MyService.getData();
    return ok(data);
  } catch (error) {
    console.error("[GET /api/resource]", error);
    return err("Internal server error");
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const data = await MyService.create(body);
    return ok(data, 201);
  } catch (error) {
    console.error("[POST /api/resource]", error);
    return err("Internal server error");
  }
}
```

### Rules

| Rule | Detail |
|---|---|
| File location | `src/app/api/[resource]/route.ts` |
| HTTP verbs | Named exports: `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |
| Response shape | Always `ok()` or `err()` — never a raw `NextResponse.json({})` |
| Business logic | In `src/services/` — handlers are thin wrappers only |
| Response type | Define an `interface` for every `ok()` payload |
| Error logging | Always `console.error("[METHOD /api/route]", error)` before returning `err()` |

## Imported Claude Cowork project instructions
