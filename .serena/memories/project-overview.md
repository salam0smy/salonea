# Salona — Project Overview

**Purpose:** Multi-tenant SaaS platform for Saudi beauty salons. Customers book services via a public-facing page; salon owners manage via an admin panel.

**Tech Stack:**
- Nuxt 4 (app/ directory structure)
- Nuxt UI v3 (Tailwind v4) — use `UButton`, `UInput`, etc.
- @nuxtjs/i18n — Arabic default (RTL), English secondary
- @nuxtjs/supabase — DB + auth
- @pinia/nuxt — state management
- TypeScript throughout
- Vitest + @nuxt/test-utils (nuxt environment + happy-dom)

**Key aliases:** `~` resolves to project root; `~/app/types` → `<root>/app/types/index.ts`

**Structure:**
- `app/` — Nuxt app root (pages, components, composables, layouts, assets)
- `server/` — Nitro server routes + middleware
- `tests/` — Vitest tests mirroring `app/` and `server/` structure
- `i18n/` — locale JSON files
- `docs/plans/` — implementation plans

**Commands:**
- Dev: `npm run dev`
- Test: `npm run test` (or `npm test <file>` for specific file)
- Lint: `npm run lint` / `npm run lint:fix`
- Build: `npm run build`
