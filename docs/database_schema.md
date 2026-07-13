# Database Schema — BANKAI (MongoDB)

## `users` (owned by the backend)
The login service stores its own users. Passwords are hashed with **bcrypt**; the backend
issues and verifies its own **JWT** access tokens (no managed auth provider).

```js
// collection: users
{
  _id:          ObjectId,   // user id (returned to the client as a string)
  email:        string,     // stored lowercased; UNIQUE
  passwordHash: string,     // bcrypt hash — never the raw password
  createdAt:    Date
}
```

Indexes (created at startup in `backend/src/lib/mongodb.ts`):
```js
db.users.createIndex({ email: 1 }, { unique: true })  // dedupe + fast login lookup
```
The unique index is what makes a second `register` with the same email fail (→ `409`).

## Optional: `characters` (DB-driven catalog)
The app ships with the catalog as static TS data (`frontend/src/data/characters.ts`). If
you'd rather drive it from the DB, mirror those fields in a collection and fetch them:

```js
// collection: characters
{
  _id:       'ichigo',      // use the slug as the document _id
  name:      'Ichigo Kurosaki',
  title:     'Substitute Soul Reaper',
  zanpakuto: 'Zangetsu',
  bankai:    'Tensa Zangetsu',
  element:   'void',
  color:     '#1ec8ff',     // signature hex used by the 3D scene
  accent:    '#e7003b',
  glyph:     '月',
  blurb:     'original flavor text',
  sortOrder: 1
}
```
Reads are public, so expose them through a small backend GET endpoint (don't hand the DB
connection string to the browser).

## Optional: `profiles` (per-user data, future)
```js
// collection: profiles
{
  _id:               ObjectId,   // = users._id
  displayName:       string,
  favoriteCharacter: string,     // references a characters._id slug
  updatedAt:         Date
}
```

Setup and run steps are in [`mongodb-setup.md`](./mongodb-setup.md).
