# Project Context — "BANKAI" (Bleach 3D Tribute)

Living context per the multi-agent charter (`Agent.md`). Update after every significant decision.

## What we're building
A 3D React web app themed on the anime *Bleach*. Visitors log in, see a **lineup of
Soul Reaper characters**, click one, and land on a cinematic **3D character page** that
renders the character and **releases their Bankai** — projecting an energy effect and
**speaking the Bankai aloud** (voice clip if provided, otherwise browser speech synthesis).

## Decisions (ADR-lite)
- **Frontend stack:** Vite + React 18 + TypeScript (strict). Charter default is Next.js;
  swapped to **Vite SPA** because this is a client-heavy 3D experience with no SSR/SEO need
  and the simplest `npm run dev` story for a react-three-fiber app. (Charter §Customizing allows stack swaps.)
- **3D:** `three` + `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing` (bloom).
- **Backend scope:** **login only** (per request). `Express + TypeScript`, thin auth service.
  Endpoints: `register`, `login`, `me`. No other server logic.
- **Database / Auth:** **MongoDB** (`mongodb` driver). The backend owns auth itself —
  **bcrypt** (`bcryptjs`) for password hashing and **JWT** (`jsonwebtoken`) for access tokens
  signed with `JWT_SECRET`. Users live in a `users` collection (unique index on `email`).
  Migrated off Supabase Auth on 2026-06-29. Walkthrough in `docs/mongodb-setup.md`.
- **Character/Bankai data:** static TS module in the frontend (`src/data/characters.ts`) so the
  experience works with zero DB rows. Optional `characters` table SQL is provided for those who
  want it DB-driven later.
- **Legal/IP:** ship **no copyrighted assets**. Character art, GLB models, and voice/incantation
  audio are user-supplied drop-ins. Out of the box we render procedural portraits + 3D energy and
  speak only the short Bankai *name* via the Web Speech API. We do **not** embed release incantations.

## Auth flow (contract)
Frontend → Express backend → MongoDB. Backend verifies the bcrypt password hash and returns a
self-signed JWT access token; frontend stores it (memory + localStorage) and gates the
lineup/character routes behind it.

## Repo layout
```
bankai/
├── Agent.md                 # pointer to the multi-agent charter
├── docs/                    # architecture, schema, mongodb-setup (the walkthrough)
├── memory/project_context.md
├── contracts/api_contracts.md
├── backend/                 # Express + MongoDB (login only)
└── frontend/                # Vite + React + react-three-fiber
```

## Open items / future
- Optional: move character catalog into MongoDB (`characters` collection schema provided).
- Optional: per-character GLB models + real voice clips (drop into `frontend/public/{models,audio}`).
- QA + Security gates from the charter not yet run (personal creative build); structure is gate-ready.
