# Tally — Codebox to-do app

A to-do list with accounts. React (Vite) + Tailwind + Aceternity UI in `client/`,
an Express API at the repo root, Supabase for auth and Postgres.

```
browser ──(Supabase Auth: sign up / log in)──▶ Supabase
   │
   └─ /api/todos  + Bearer <access token> ──▶ Express ──(service role, filtered by user_id)──▶ Postgres
```

## 1. Supabase setup (once)

1. **SQL Editor → New query**: paste `db/todos.sql` and run it.
2. **Authentication → Sign In / Providers → Email**: make sure it's enabled.
   For quick local testing you can turn off **Confirm email**; leave it on in production.
3. **Authentication → URL Configuration**: set **Site URL** to `http://localhost:5173`
   (change it to your Vercel URL after deploying).
4. **Project Settings → API**: copy the project URL, the **anon/publishable** key, and the **service_role** key.

## 2. Environment variables

| File | Variables |
| --- | --- |
| `.env` (from `.env.example`) | `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| `client/.env.local` (from `client/.env.example`) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

Anything prefixed `VITE_` ends up in the browser, so it must never hold the service role key.

## 3. Run locally

```bash
npm install
npm --prefix client install
npm run dev:all        # API on :3000, app on http://localhost:5173
```

Vite proxies `/api` to Express, so the browser only ever talks to one origin.

## API

All routes need `Authorization: Bearer <Supabase access token>` and only ever touch the caller's own todos.

| Method | Path | Body | Result |
| --- | --- | --- | --- |
| GET | `/api/todos` | – | the user's todos, newest first |
| POST | `/api/todos` | `{ "title": "..." }` | `201` + the new todo |
| PATCH | `/api/todos/:id` | `{ "title"?: "...", "completed"?: bool }` | the updated todo, or `404` |
| DELETE | `/api/todos/:id` | – | `{ "deleted": todo }`, or `404` |

The day 1–2 routes (`/api/users`, `/api/me`) are unchanged.

## Deploy to Vercel

`vercel.json` deploys the repo as one Vercel project with two [services](https://vercel.com/docs/services) on one domain:

| Service | Root | What it is | Public path |
| --- | --- | --- | --- |
| `api` | `.` | Express app (`app.js`) | `/api/*` (receives the full path, e.g. `/api/todos`) |
| `client` | `client/` | Vite build of the React app | everything else |

The browser calls `/api/...` on the same domain, so no CORS and no service bindings are needed.
`server.js` is only for local runs.

1. Push to GitHub and import the repo in Vercel (root directory = repo root).
2. Add the env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
   The `VITE_` ones are baked into the client at build time, so set them before the first deploy (or redeploy after changing them).
3. Deploy, then add the Vercel URL to Supabase's **Site URL / Redirect URLs**.

To run the production routing locally: `npm run dev:vercel` (`vercel dev -L`, no Vercel login needed).
