# 🏆 TechNeekX Codathon Portal

A full-stack hackathon management portal for the **TechNeekX (TNX) Codathon 2K26** — giving organizers a single dashboard to manage teams and participants a self-serve window into their team info, event details, and documents.

> **Stack:** MERN (MongoDB · Express · React · Node.js) + Clerk (auth) + Cloudinary (file storage)  
> **Deployment:** Vercel (frontend) · Render (backend) · MongoDB Atlas (database)

---

## ✨ Features

### 👥 For Participants
- **Public landing page** — event timeline, prize pool, venue & format info (no login required)
- **My Team dashboard** — view team info, members, and event schedule after Clerk email/OTP login
- **Team Lead** — edit team name and upload/replace your team's presentation (PPT)
- **Members** — edit your own display name

### 🛠️ For Admins
- **Bulk CSV/XLSX import** — upload the Unstop long-format export to create all teams & users in one shot (idempotent — re-importing updates existing records matched by Registration ID)
- **Wildcard team creation** — manually add teams not in the source sheet
- **Team management** — search/filter, view full team details & PPTs, edit/override data
- **Lead reassignment** — move the lead role within a team
- **Dashboard stats** — total teams, participants, activations, and PPT submissions
- **Event info editor** — author and update the public landing page content

### 🔮 Coming Soon (Parked)
- **NOC generation** — per-participant PDF certificate/NOC with admin log

---

## 🗂️ Project Structure

```
CodathonProtal/
├── client/                   # React (Vite) frontend
│   ├── src/
│   │   ├── pages/            # HomePage, AdminPage, MyTeamPage, TeamsPage, TimelinePage, ...
│   │   ├── components/       # AdminTeamList, ParticipantDashboard, NocDocument, ...
│   │   │   ├── auth/         # ProtectedRoute
│   │   │   └── layout/       # Navbar, Footer, Layout
│   │   ├── context/          # AuthContext (Clerk integration)
│   │   └── services/         # api.js (Axios client)
│   ├── public/
│   ├── index.html
│   └── package.json
│
├── server/                   # Node.js + Express API
│   ├── src/
│   │   ├── config/           # db.js (MongoDB), cloudinary.js
│   │   ├── middlewares/       # auth.js, roleGuard.js, rateLimiter.js, errorHandler.js
│   │   ├── models/            # User.js, Team.js, EventInfo.js
│   │   ├── routes/            # adminRoutes.js, userRoutes.js, teamRoutes.js
│   │   ├── services/          # importService.js, clerkService.js, memberService.js
│   │   ├── validators/        # schemas.js (Joi/Zod validation)
│   │   ├── scripts/           # seedAdmin.js, seedTimeline.js, exportTeamsCsv.js, ...
│   │   └── index.js           # Express app entry point
│   └── test/                  # e2e, models, import, team, security tests
│
├── project.md                 # Full product specification
├── production.md              # Phase-wise build roadmap
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **pnpm** or **npm**
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A [Clerk](https://clerk.com) application (Email + OTP)
- A [Cloudinary](https://cloudinary.com) account

---

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd CodathonProtal
```

---

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/codathon

CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
```

**Seed the database:**

```bash
# Create the admin user
npm run seed:admin

# Populate event timeline / info
npm run seed:timeline
```

**Start the dev server:**

```bash
npm run dev
# API available at http://localhost:5000
```

---

### 3. Frontend setup

```bash
cd client
npm install
```

Create a `.env` file in `client/` (see `.env.example`):

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:5000
```

**Start the dev server:**

```bash
npm run dev
# App available at http://localhost:5173
```

---

## 📡 API Reference

### Public (no auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/event-info` | Landing page content (timeline, prize pool, venue) |

### Participant (Clerk auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/me` | Get own profile |
| `PATCH` | `/api/users/me` | Update own name |
| `GET` | `/api/teams/me` | Get own team details |
| `PATCH` | `/api/teams/me` | Edit team name *(lead only)* |
| `POST` | `/api/teams/me/ppt` | Upload / replace PPT *(lead only)* |

### Admin (role: admin required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/teams/import` | Bulk CSV/XLSX import |
| `POST` | `/api/admin/teams` | Create wildcard team |
| `GET` | `/api/admin/teams` | List all teams (supports `?search=` & `?createdVia=`) |
| `GET` | `/api/admin/teams/:teamId` | Full team details |
| `PATCH` | `/api/admin/teams/:teamId` | Edit team data |
| `PATCH` | `/api/admin/teams/:teamId/lead` | Reassign team lead |
| `POST` | `/api/admin/teams/:teamId/members` | Add a member |
| `PATCH` | `/api/admin/teams/:teamId/members/:memberId` | Update member info |
| `DELETE` | `/api/admin/teams/:teamId/members/:memberId` | Remove member |
| `GET` | `/api/admin/stats` | Dashboard stats |
| `PUT` | `/api/admin/event-info` | Update event info / timeline |

---

## 🔐 Auth Model

Authentication is fully delegated to **Clerk** (email + OTP). Authorization is enforced server-side:

1. Clerk middleware verifies the session token and attaches `clerkId` / `email` to every request.
2. The backend looks up the `User` document by verified email, reads the stored `role`, and checks it against the required permission — **never trusts client-claimed values**.
3. Routes are scoped to `/me` for participants (no spoofable IDs in URLs) and require `role === 'admin'` for all admin routes.

**Login flow for participants:**
- Click "My Team" → Clerk email/OTP prompt
- Email is matched against pre-loaded `User` records
  - ✅ Match → account activated, redirected to team dashboard
  - ❌ No match → blocked with *"Your email isn't registered. Contact organizers."*

---

## 🗄️ Database Schema

### `User`
| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Editable by user |
| `email` | String | Unique · immutable after first login |
| `clerkId` | String | Set on first login |
| `role` | `member \| lead \| admin` | |
| `teamId` | ObjectId → Team | Null for admins |
| `isActivated` | Boolean | False until first login |
| `organisation`, `course`, etc. | String | Stored for future NOC use |

### `Team`
| Field | Type | Notes |
|-------|------|-------|
| `teamName` | String | Editable by lead |
| `regnId` | String | Unique · used for idempotent re-import |
| `leadId` | ObjectId → User | Only admin can change |
| `memberIds` | [ObjectId] | Max 5 total (incl. lead) |
| `ppt` | String (URL) | Cloudinary link |
| `createdVia` | `preload \| wildcard` | |

### `EventInfo` (singleton)
| Field | Type | Notes |
|-------|------|-------|
| `timeline` | `[{ time, activity }]` | Event-day schedule |
| `prizePool` | String | Prize description |
| `location`, `venue` | String | |
| `eventFormat`, `eventDates` | String | |

---

## 📦 CSV / XLSX Import Format

The importer accepts the **Unstop long-format export** — one row per candidate, grouped by `Regn ID` at import time.

| Column | Notes |
|--------|-------|
| `Regn ID` | Team registration ID — groups rows into teams |
| `Team Name` | |
| `Name` | Candidate name |
| `Email` | Unique per participant |
| `Mobile` | |
| `Organisation` | College / institution |
| `Domain` | Hackathon domain / track |
| `Course`, `Course Specialization`, `Course Duration`, `Year of Graduation` | Stored for NOC |

> **Re-import behaviour:** if a team's `Regn ID` already exists, its record is **updated** (not rejected).

---

## 🧪 Running Tests

```bash
cd server

npm run test:models      # Model unit tests
npm run test:import      # CSV/XLSX import tests
npm run test:team        # Team business logic tests
npm run test:security    # Auth & authorization tests
npm run test:e2e         # End-to-end API tests
npm run test:all         # Run all tests sequentially
```

---

## 🏗️ Build & Deploy

### Frontend (Vercel)

```bash
cd client
npm run build            # Outputs to client/dist/
```

Push to GitHub and connect the `client/` directory to a Vercel project. Set the `VITE_*` env vars in the Vercel dashboard.

### Backend (Render)

Deploy the `server/` directory as a **Node.js web service** on Render. Set all `server/.env` variables in the Render environment settings.

---

## 🤝 Contributing

This is an internal TechNeekX project. For changes:

1. Create a feature branch off `main`
2. Make your changes and run the relevant tests
3. Open a pull request — CI runs lint + tests automatically

---

## 📄 License

Internal project — TechNeekX Community. Not licensed for public distribution.

