# AUTOVIP Rewards – Frontend

Web frontend for the AUTOVIP points and rewards system (maintenance history and rewards management). This repository is configured to run as a **demo** with mock data and no backend, or with a real API when demo mode is off.

## Features

- **Authentication:** Sign in as AUTOVIP client or as manager (admin).
- **Points & rewards:** View points, available rewards, and redeem via contact flow.
- **User profile:** View membership, vehicles, and redeemed rewards history.
- **Manager dashboard:** Manage users, rewards, promotions, points, and birthday messages.
- **Demo mode:** Run without a backend using simulated data; choose role from the home page.
- **Responsive layout:** Works on mobile and desktop.
- **Error handling:** Error boundaries and centralized logging.

## Prerequisites

- Node.js 18+
- npm or yarn

For **demo mode:** no backend required.  
For **live API:** a running backend and correct `VITE_API_URL`.

## Installation

1. From the repo root, go to the client:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment (see below):
   ```bash
   cp .env.example .env
   ```
   Edit `.env` as needed.

## Demo mode (no backend)

To run the app as a **demo** with mock data:

1. In `.env`, set:
   ```env
   VITE_DEMO_MODE=true
   VITE_API_URL=http://localhost:3001/api
   ```
2. Run:
   ```bash
   npm run dev
   ```
3. Open the app (e.g. `http://localhost:5173`). You will see:
   - A **demo notice** at the top: "Demo mode – simulated data only."
   - A **home page** with two options: **Sign in as Client** and **Sign in as Manager**.
4. Use any username and password to sign in; the app will use mock auth and data.

When `VITE_DEMO_MODE=true`:

- No real API calls are made.
- All data (users, points, rewards, promotions, etc.) is simulated.
- The "Maintenance History" link is shown as disabled (demo only).

## Running with a real backend

1. In `.env`, **do not** set `VITE_DEMO_MODE`, or set it to `false`.
2. Set your API base URL:
   ```env
   VITE_API_URL=https://your-api.example.com/api
   ```
3. Run `npm run dev` or `npm run build` and `npm run preview` as needed.

Optional: to show the "Maintenance History" link (client profile/rewards), set:

```env
VITE_MAINTENANCE_HISTORY_URL=https://your-maintenance-app.example.com/qr-login
```

## Scripts

- `npm run dev` – Start dev server with hot reload (default: `http://localhost:5173`).
- `npm run build` – Production build (output in `dist/`).
- `npm run preview` – Serve the production build locally.
- `npm run lint` – Run ESLint.

## Project structure

```
client/
├── src/
│   ├── components/       React components
│   │   ├── DemoEntry.jsx      Demo role selector (when VITE_DEMO_MODE=true)
│   │   ├── DemoBanner.jsx     Demo mode notice
│   │   ├── AUTOVIPLogin.jsx   Client login
│   │   ├── ManagerLogin.jsx   Manager login
│   │   ├── RewardsPoints.jsx  Points and rewards (client)
│   │   ├── UserProfile.jsx    User profile
│   │   ├── ManagerDashboard.jsx  Manager panel
│   │   └── ...
│   ├── services/         API and mock layer
│   │   ├── apiClient.jsx     Axios instance, auth interceptors
│   │   ├── user.jsx          Auth and user API
│   │   ├── autovipUsers.jsx   Users, memberships, vehicles, points
│   │   ├── autovipRewards.jsx Rewards and reward types
│   │   ├── autovipPromotions.jsx  Promotions
│   │   ├── mock/              Mock data and demo behavior
│   │   │   └── mockData.js
│   │   └── ...
│   ├── config/           Theme/colors (e.g. init-colors.js)
│   ├── utils/            e.g. logger
│   ├── App.jsx
│   └── main.jsx
├── public/
├── .env.example
├── vite.config.js
└── package.json
```

## Environment variables

All env vars use the `VITE_` prefix so Vite can expose them to the client.

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:3001/api`). |
| `VITE_DEMO_MODE` | Set to `true` to use mock data and disable real API calls. |
| `VITE_MAINTENANCE_HISTORY_URL` | Optional. URL for "Maintenance History" link; only used when not in demo mode. |

Files (in order of precedence): `.env.[mode].local` > `.env.local` > `.env.[mode]` > `.env`.  
Do not commit `.env` or files containing secrets (they are in `.gitignore`).

## Theming

The app supports dynamic colors by membership type (Gold, Platinum, Black). Colors are initialized from `src/config/init-colors.js` based on the current user’s membership.

## Security

- JWT-style tokens with expiration; stored in `localStorage`.
- HTTP client adds `Authorization: Bearer <token>` and handles 401/403 (e.g. redirect to login).
- Error boundaries catch React errors to avoid full app crashes.
- Logging is configured to avoid leaking sensitive data in production.

## Build and deploy

- **Production build:** `npm run build` → output in `dist/`.
- Deploy the contents of `dist/` to any static host (Netlify, Vercel, S3, Nginx, etc.).
- For demo deployments, set `VITE_DEMO_MODE=true` in the build environment (e.g. in your CI or host’s env).

## Status

- Implemented: auth (client + manager), rewards flow, profile, manager dashboard, demo mode, mock data, English UI.
- Optional improvements: unit/integration tests, i18n for multiple languages, accessibility audit.
