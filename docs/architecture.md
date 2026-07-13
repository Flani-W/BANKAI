# Architecture — BANKAI

## Overview
A single-page 3D web experience with a thin auth backend.

```
┌──────────────────────────────┐        ┌──────────────────────┐        ┌──────────────────┐
│  Frontend (Vite + React)     │  HTTPS │  Backend (Express)   │ driver │  MongoDB         │
│  - react-three-fiber 3D      ├───────►│  login-only service  ├───────►│  users           │
│  - character lineup          │ /auth  │  register/login/me   │        │  collection      │
│  - 3D bankai page + audio    │◄───────┤  issues/verifies JWT │◄───────┤                  │
└──────────────────────────────┘        └──────────────────────┘        └──────────────────┘
        static character data (TS)        bcrypt passwords · self-issued JWT
```

## Components
### Frontend (`frontend/`)
- **Vite + React 18 + TS (strict).** Routing via `react-router-dom`.
- **Auth gate:** `useAuth` (Zustand) stores the JWT; `<ProtectedRoute>` guards `/lineup` and `/character/:id`.
- **Lineup page:** responsive grid of character cards (portrait + name + Bankai), animated.
- **Character page:** a react-three-fiber `<Canvas>` scene:
  - Procedural energy field (GPU particle points) in the character's signature color.
  - A billboard rendering the character portrait (or a loaded `.glb` model if present).
  - Bloom postprocessing for the reiatsu glow.
  - "Release Bankai" button → intensifies the effect + plays audio (clip or speech synthesis).
- **Audio:** `lib/audio.ts` — plays the character's mapped clip from `public/audio/` if one
  exists (see `CLIP_FILES`), else falls back to `speechSynthesis`.

### Backend (`backend/`)
- **Express + TS.** Hardened with `helmet`, CORS allow-list, `express-rate-limit`.
- **Login only.** Owns auth directly — `bcryptjs` for password hashing, `jsonwebtoken` for
  tokens, `mongodb` for storage:
  - `POST /api/v1/auth/register` → create user (bcrypt hash).
  - `POST /api/v1/auth/login` → verify password, return `{ access_token, expires_at, user }`.
  - `GET  /api/v1/auth/me` → verifies bearer token, returns the user.
  - `GET  /api/v1/health`.

### Data / Auth (MongoDB)
- A `users` collection (`{ email, passwordHash, createdAt }`) with a unique index on `email`.
- The backend signs and verifies its own JWTs with `JWT_SECRET`; identities live entirely in Mongo.
- Optional `characters` collection if you want a DB-driven catalog (see schema doc).

## Non-functional
- No secrets in the client bundle (only `VITE_*` public values: the API base URL).
- `MONGODB_URI` and `JWT_SECRET` live **only** in the backend env.
- Graceful fallbacks everywhere: missing image → CSS placeholder; missing model → procedural billboard;
  missing audio clip → speech synthesis; backend unreachable → clear error state.
