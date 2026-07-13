# MongoDB Setup & Deployment Walkthrough — BANKAI

MongoDB is the project's **database**. The login backend owns auth itself (bcrypt for
passwords, JWT for tokens) and talks to Mongo; the frontend never touches the DB directly.
This guide covers local dev and production deploy.

---

## 0. What you'll end up with
- A MongoDB instance (local `mongod`, Docker, or MongoDB Atlas).
- A connection string in `MONGODB_URI` and a long random `JWT_SECRET`.
- A `users` collection with a unique index on `email` (auto-created at startup).

---

## 1. Get a MongoDB running

Pick **one**:

### Option A — Docker (quickest for local dev)
```bash
docker run -d --name bankai-mongo -p 27017:27017 mongo:7
```
Connection string: `mongodb://localhost:27017`

### Option B — Local install
Install MongoDB Community Server, start `mongod`. Default URI: `mongodb://localhost:27017`.

### Option C — MongoDB Atlas (managed, good for prod)
1. Go to **https://www.mongodb.com/atlas** → create a free cluster.
2. **Database Access** → add a user with a password.
3. **Network Access** → allow your IP (or `0.0.0.0/0` for testing only).
4. **Connect → Drivers** → copy the `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net` URI.

---

## 2. Configure the backend
`backend/.env` (copy from `.env.example`):
```env
PORT=8787
MONGODB_URI=mongodb://localhost:27017      # or your Atlas mongodb+srv URI
MONGODB_DB=bankai
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:5173
```

Generate a strong `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

> ⚠️ `MONGODB_URI` (carries DB credentials) and `JWT_SECRET` are secrets. Keep them **only**
> in the backend's `.env` / your host's secret store. Never put them in the frontend or any `VITE_*`.

---

## 3. Run local dev
**Frontend** (`frontend/.env` — copy from `.env.example`):
```env
VITE_API_BASE_URL=http://localhost:8787
```

Run both (see the root `README.md`), open the app, click **Register**. The backend creates
the `users` collection on first write; you can inspect it with `mongosh`:
```bash
mongosh "mongodb://localhost:27017/bankai" --eval "db.users.find().pretty()"
```
(Passwords are stored only as bcrypt hashes.)

---

## 4. (Optional) DB-driven character catalog
The app ships the catalog as static TS data, so this is optional. To drive it from Mongo,
create a `characters` collection (schema in [`database_schema.md`](./database_schema.md)),
seed it, and add a small backend GET endpoint to serve it.

---

## 5. Deploy

### Backend (the login service) — e.g. Render / Railway / Fly.io
1. Deploy the `backend/` folder as a Node web service. Build: `npm install && npm run build`.
   Start: `npm start`. Health check path: `/api/v1/health`.
2. Set env vars in the host's dashboard: `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET`,
   `JWT_EXPIRES_IN`, and `CORS_ORIGINS=https://your-frontend-domain`.
3. Use a managed DB (Atlas) for `MONGODB_URI` in prod and lock Network Access to your host.

### Frontend — e.g. Vercel / Netlify / Cloudflare Pages
1. Project root = `frontend/`. Build command: `npm run build`. Output dir: `dist`.
2. Env var: `VITE_API_BASE_URL=https://your-backend-url`.
3. SPA routing: add a catch-all rewrite to `index.html`:
   - **Netlify** (`frontend/public/_redirects`): `/*  /index.html  200`
   - **Vercel** (`vercel.json`): a rewrite of `/(.*)` → `/index.html`.

---

## 6. Security checklist
- [ ] `MONGODB_URI` and `JWT_SECRET` are **only** in backend secrets — never in the bundle or git.
- [ ] `JWT_SECRET` is long and random (not the example value).
- [ ] Atlas Network Access is restricted (no permanent `0.0.0.0/0`).
- [ ] `CORS_ORIGINS` lists exact prod origins (no `*`).
- [ ] Rate limiting on `/api/v1/auth/*` (already in `backend/src/index.ts`).
- [ ] HTTPS everywhere (your hosts provide this by default).

---

## Troubleshooting
- **`Missing required env var: MONGODB_URI`** → you didn't create `backend/.env` (copy it from `.env.example`).
- **`failed to connect to MongoDB`** → `mongod` isn't running, or the URI/credentials/Network-Access rule is wrong.
- **Login returns "Invalid credentials"** → user doesn't exist yet (Register first) or wrong password.
- **`Email already registered` (409)** → that email is already in the `users` collection.
- **CORS error in the browser console** → the frontend origin isn't in `CORS_ORIGINS`.
- **"Cannot reach the server"** → backend isn't running, or `VITE_API_BASE_URL` is wrong.
