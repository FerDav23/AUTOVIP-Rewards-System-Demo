# AUTOVIP Rewards System – Demo

A **demo** frontend for the AUTOVIP rewards and points system. This project does **not** connect to a real backend; it runs with simulated data for portfolio and presentation use.

## What this is

- **Demo only:** No live API. All data is mocked when running in demo mode.
- **Role selector:** On the home page you can choose to **Sign in as Client** or **Sign in as Manager** to try both flows.
- **English UI:** The interface is in English.

## Quick start (demo mode)

1. Clone the repository and go to the client app:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Enable demo mode (no backend required). Create a `.env` file (see `client/.env.example`) and set:
   ```env
   VITE_DEMO_MODE=true
   VITE_API_URL=http://localhost:3001/api
   ```
   You can copy from the example: `cp .env.example .env` and add the line `VITE_DEMO_MODE=true`.
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open the app (e.g. `http://localhost:5173`). You’ll see the demo home page; choose **Sign in as Client** or **Sign in as Manager**. Any username/password will work in demo mode.

For full setup, scripts, and configuration options, see **[client/README.md](client/README.md)**.

## Tech stack

- React, Vite
- React Router
- Axios (replaced by mock layer when `VITE_DEMO_MODE=true`)

## License

See repository or project documentation.
