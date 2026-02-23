# Recruitment Exam Web Application

Full-stack recruitment exam system with student signup/login, profile, dynamic exam generation, timed exams, tab-switch tracking, and admin dashboard.

## How to Run

### Transfer / Use existing database (no migrations)

On a fresh system with the project and existing `prisma/dev.db` copied over:

```bash
npm install
npx prisma generate
npm run dev
```

The server will start using the existing database without altering it. Do **not** run `prisma migrate dev`, `prisma db push`, or `prisma migrate reset`.

**Database location:** The active SQLite file is at `prisma/dev.db`. Ensure `DATABASE_URL="file:./dev.db"` in `.env` (path is relative to the Prisma schema).

---

### First-time setup (new database)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` if needed. Default values work for local development:

- `DATABASE_URL="file:./dev.db"` — SQLite at `prisma/dev.db` (no extra setup)
- `ADMIN_USER="admin"` — Admin login username
- `ADMIN_PASS="admin123"` — Admin login password
- `SESSION_SECRET` — Used for signing session cookies (change in production)

### 3. Initialize database (new setup only)

For fresh setup only (creates new tables):

```bash
npm run prisma:migrate
```

Or use `npx prisma db push` for schema sync. **Do not run these when using an existing database.**

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Access via IP (same network):** The dev/production server binds to `0.0.0.0`, so you can also open `http://YOUR_IP:3000` (e.g. `http://192.168.1.5:3000`) from other devices on your network. Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux).

### 5. Build for production

```bash
npm run build
npm start
```

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm start` — Start production server
- `npm run prisma:generate` — Generate Prisma client
- `npm run prisma:migrate` — Run database migrations

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
