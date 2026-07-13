# API Contract — BANKAI (v1)

Base URL: `${VITE_API_BASE_URL}` (default `http://localhost:8787`). All bodies JSON.

## POST /api/v1/auth/register
Create a user (stored in MongoDB; password hashed with bcrypt).
- Req: `{ "email": string, "password": string (min 8) }`
- 201: `{ "user": { "id": string, "email": string }, "needsEmailConfirmation": boolean }`
- 400: `{ "error": string }` (validation) · 409 if already registered.

## POST /api/v1/auth/login
- Req: `{ "email": string, "password": string }`
- 200: `{ "access_token": string, "expires_at": number, "user": { "id": string, "email": string } }`
- 401: `{ "error": "Invalid credentials" }`

## GET /api/v1/auth/me
- Header: `Authorization: Bearer <access_token>`
- 200: `{ "user": { "id": string, "email": string } }`
- 401: `{ "error": "Unauthorized" }`

## GET /api/v1/health
- 200: `{ "status": "ok", "mongodb": boolean }`

## Errors
All errors are `{ "error": string }` with the appropriate status. Generic messages (no internals).
Rate limit: 20 auth requests / 15 min / IP → 429 `{ "error": "Too many requests" }`.
