# Recruitment Exam Web Application

Full-stack recruitment exam system with student signup/login, profile, dynamic exam generation, timed exams, tab-switch tracking, and admin dashboard. Supports **PostgreSQL** in production, **SQLite** for local dev, and **Cloudflare R2** for scalable file uploads.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | **Production:** `postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public` (e.g. Railway Postgres, Neon). **Local dev (SQLite):** `file:./dev.db` |
| `ADMIN_USER` | No | Fallback admin login email/username if Admin table has no match |
| `ADMIN_PASS` | No | Fallback admin password |
| `SESSION_SECRET` | Yes | Secret for signing session cookies (change in production) |
| `R2_ACCOUNT_ID` | For R2 | Cloudflare account ID (optional if `R2_ENDPOINT` set) |
| `R2_ACCESS_KEY_ID` | For R2 | R2 S3-compatible access key |
| `R2_SECRET_ACCESS_KEY` | For R2 | R2 S3-compatible secret key |
| `R2_BUCKET` | For R2 | Bucket name for uploads |
| `R2_ENDPOINT` | For R2 | S3 API endpoint (e.g. `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`) |
| `R2_PUBLIC_BASE_URL` | For R2 | Public URL for download links (custom domain or R2 dev URL) |
| `MAX_UPLOAD_BYTES` | No | Max file size in bytes (default 50MB) |
| `APP_BASE_URL` | No | Optional base URL of the app (e.g. for emails/redirects) |

---

## How to Run

### Local development (SQLite)

1. **Install and generate Prisma client for SQLite:**

   ```bash
   npm install
   npm run db:generate:dev
   ```

2. **Configure `.env`:** Copy `.env.example` to `.env` and set `DATABASE_URL="file:./dev.db"`.

3. **Create DB (first time):** `npx prisma db push --schema=prisma/schema.sqlite.prisma`

4. **Start dev server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Uploads are stored in `public/uploads/`.

### Production (PostgreSQL + R2)

- Use **PostgreSQL** for the database and **Cloudflare R2** for file uploads (presigned URLs).
- Set all required env vars (see table above). Run migrations before first start (see Railway steps below).

---

## Railway Deployment

1. **Create a project** on [Railway](https://railway.app). Add a **PostgreSQL** plugin (or use an external Postgres and add its URL).

2. **Connect your repo** and configure the service:

   - **Build command:** `npm install && npm run db:generate && npm run build`
   - **Start command:** `npm run db:migrate:deploy && npm start`
   - **Root directory:** (leave default if app is at repo root)

3. **Environment variables** (Settings → Variables):

   - `DATABASE_URL` — from Railway Postgres (or your own Postgres URL)
   - `SESSION_SECRET` — generate a long random string
   - `ADMIN_USER` / `ADMIN_PASS` — admin fallback login
   - For file uploads: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ENDPOINT`, `R2_PUBLIC_BASE_URL`
   - Optional: `MAX_UPLOAD_BYTES`, `APP_BASE_URL`

4. **Migrations:** The start command runs `npm run db:migrate:deploy` before `npm start`, so the database is migrated on each deploy. For a one-off migration you can run in Railway shell: `npx prisma migrate deploy`.

5. **Health check:** Configure Railway to call `GET /health`. The app responds with `{ status: "ok", db: "connected" }` when the DB is reachable.

6. **Deploy.** The app will build, run migrations, and start with `npm start` (production server).

---

## Data migration (SQLite → Postgres)

To copy existing data from a local SQLite DB to Postgres (e.g. before going live):

1. Ensure **Postgres** is empty and migrations are applied: `DATABASE_URL=postgresql://... npm run db:migrate:deploy`
2. Ensure **SQLite** file exists at `prisma/dev.db` with your data.
3. Generate Postgres client and run the script:

   ```bash
   npm run db:generate
   npx tsx scripts/migrate_sqlite_to_postgres.ts
   ```

   Set `DATABASE_URL` to your Postgres URL. The script is **idempotent**: it skips tables that already have rows, so safe to re-run if it fails partway.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (localhost) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:generate` | Generate Prisma client (Postgres schema) |
| `npm run db:generate:dev` | Generate Prisma client for SQLite (local dev) |
| `npm run db:migrate:deploy` | Apply migrations (production; use on deploy) |
| `npm run db:migrate` | Run migrations in dev (interactive) |
| `npm run db:push` | Push schema without migrations (dev only) |

## Default Admin Login

- Username: `admin`
- Password: `admin123`

## Student Flow

1. Sign up / Log in
2. Fill profile: Name, Gender, College, Degree, Branch, CGPA (0–10), Roles (1–2)
3. Start exam → Theory section (5 per role) → Next: Practical (2 per role)
4. **Practical questions:** Upload files (zip, stl, glb, obj, pdf — max 50MB each). Multiple uploads per question; delete before submit.
5. Submit or auto-submit when timer ends (2 hours)

## Admin Flow

1. Log in at `/admin/login`
2. **Question Paper** tab — Add roles, add theory (5+ per role) and practical (2+ per role) questions
3. **Submissions** tab — View submissions; Click **Evaluate** for pending, **Download** PDF for evaluated
4. **Logs** tab — View blur/focus events per session
5. **Evaluate** — Per-question scoring, tab-switch counts; Save Evaluation to enable PDF download

## Focus Tracking Upgrade

The exam page enforces fullscreen and tracks attention using a multi-layer system:

**Tracked events:**
- **window_blur** / **window_focus** — Tab or window switch (Alt+Tab, switching apps)
- **visibility_hidden** / **visibility_visible** — Tab visibility (minimizing browser)
- **fullscreen_exit** — Leaving fullscreen mode
- **pagehide** — Page navigation or refresh
- **inactive_start** / **inactive_end** — No mouse/keyboard/scroll for 20 seconds

**Behavior:**
- Exam starts in fullscreen; exiting fullscreen is logged and shows a warning banner
- Duplicate or overlapping events (e.g. blur + visibility) are deduplicated
- `total_tab_switches` and `total_time_away` are stored per session
- Per-question: `active_time_ms`, `tab_switch_count`, `tab_switch_time_ms` (open/close and focus-return events)
- Admin Logs tab shows counts and a per-event timeline

## Practical File Uploads

- **Allowed types:** .zip, .stl, .glb, .obj, .pdf
- **Max size:** 50MB per file
- Multiple files per practical question
- Admin can view and download attachments during evaluation; PDF includes attachment list
