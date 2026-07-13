# BANKAI — 3D Soul Reaper Archive

A 3D, *Bleach*-inspired web experience. Log in, browse a **lineup of Soul Reapers**,
click one, and land on a cinematic **3D page** that **releases their Bankai** — a
reiatsu energy burst plus the bankai name **spoken aloud**.

Built with the multi-agent-system charter (`Agent.md`): PM → Frontend → Backend, with a
MongoDB-backed login service.

![stack](https://img.shields.io/badge/react-18-61dafb) ![stack](https://img.shields.io/badge/three.js-r169-black) ![stack](https://img.shields.io/badge/mongodb-auth-47a248)

---

## What it does
- 🔐 **Login/Register** — thin Express backend over **MongoDB** (bcrypt + JWT; login is the *only* backend concern).
- 🖼️ **Character lineup** — responsive, animated grid of characters with signature colors.
- 🌀 **3D character page** — `react-three-fiber` scene: swirling reiatsu particles, a portrait/model
  avatar, bloom glow, orbit controls.
- 🔊 **Bankai audio** — plays the character's mapped clip from `public/audio/` or **speaks the bankai
  name** via the browser's speech engine as a fallback.
- 🧩 **Drop-in assets** — add your own `.glb` models, portraits, and `.mp3` voice clips; the app uses
  them automatically and falls back gracefully when they're absent.

> **No copyrighted assets ship with this project.** Character art, 3D models, and
> voice/incantation audio are user-supplied. By default the app renders procedural
> visuals and speaks only the short bankai *name*.

---

## Prerequisites
- **Node.js 18+** (tested on 24)
- A **MongoDB** instance (local, Docker, or Atlas) — follow [`docs/mongodb-setup.md`](docs/mongodb-setup.md).

---

## Quick start (local)

### 1. Backend (login service)
```bash
cd backend
npm install
cp .env.example .env        # then set MONGODB_URI + JWT_SECRET
npm run dev                 # http://localhost:8787
```

### 2. Frontend (the 3D app)
```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_BASE_URL=http://localhost:8787
npm run dev                 # http://localhost:5173
```

Open **http://localhost:5173**, click **Register**, then explore the lineup and release
a bankai. New users land in the `users` collection in your MongoDB database.

> On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

---

## Project structure
```
bankai/
├── Agent.md                  # how the multi-agent charter was applied
├── README.md
├── contracts/api_contracts.md
├── docs/
│   ├── architecture.md
│   ├── database_schema.md
│   └── mongodb-setup.md      # ← the MongoDB walkthrough
├── memory/project_context.md # living decisions log
├── backend/                  # Express + MongoDB (login only)
│   └── src/{index.ts, routes/auth.ts, lib/*}
└── frontend/                 # Vite + React + react-three-fiber
    ├── public/{characters,models,audio}/   # drop-in assets (see each README)
    └── src/
        ├── data/characters.ts      # catalog (names + your own flavor text)
        ├── pages/{Login,Lineup,CharacterPage}.tsx
        ├── three/{BankaiScene,EnergyField,CharacterAvatar}.tsx
        ├── store/auth.ts           # zustand auth state
        └── lib/{api,audio}.ts
```

## Add your own characters
Edit [`frontend/src/data/characters.ts`](frontend/src/data/characters.ts) — add an object with an
`id`, names, a signature `color`/`accent`, and a `glyph`. Then optionally drop
`public/characters/<id>.jpg` and `public/models/<id>.glb`. For a voice clip, drop the mp3 in
`public/audio/` and map it to the character `id` in `CLIP_FILES`
([`frontend/src/lib/audio.ts`](frontend/src/lib/audio.ts)).

## Scripts
| Where | Command | Does |
|---|---|---|
| frontend | `npm run dev` | Vite dev server (HMR) |
| frontend | `npm run build` | Type-check + production build to `dist/` |
| frontend | `npm run typecheck` | TS only |
| backend | `npm run dev` | tsx watch server |
| backend | `npm run build` / `npm start` | compile / run compiled |

## Deploy
See [`docs/mongodb-setup.md`](docs/mongodb-setup.md) §5 — frontend to Vercel/Netlify,
backend to Render/Railway/Fly, plus the MongoDB/CORS wiring.

## Notes
- The frontend bundle is ~1.1 MB (322 KB gzip) — that's three.js. Acceptable for a 3D
  app; code-split later with `manualChunks` if you want.
- Verified: both apps install, type-check, and the frontend production build passes.
