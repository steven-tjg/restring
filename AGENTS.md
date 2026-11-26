# AGENTS.md

Guidance for AI coding agents working on Restring.

## What this is
Restring is a mobile-first PWA for tennis players. Users sign up, add racquets, record which string is installed (full bed or hybrid), log play time, and get a recommendation for when to restring. It is a hobby project hosted free on GitHub Pages with Firebase as the backend.

## Stack
- Svelte 5 (runes mode: `$state`, `$derived`, `$effect`, `$props`) with TypeScript
- Vite 8 and `vite-plugin-pwa` (service worker, manifest, offline app shell)
- Firebase Auth (email and password) and Firestore with persistent local cache
- Vitest for unit tests
- GitHub Actions deploys to GitHub Pages at `https://steven-tjg.github.io/restring/` (`base` is `/restring/`)

## Commands
- `npm run dev`: dev server
- `npm test`: unit tests (Vitest)
- `npm run check`: `svelte-check` type check
- `npm run build`: production build into `dist/`
- `npm run preview`: serve the production build
- `npm run icons`: regenerate PWA icons from `public/icon.svg`

Run `npm run check`, `npm test` and `npm run build` before finishing a change. All three must pass.

## Layout
- `src/App.svelte`: auth gate, data sync start/stop, route switch
- `src/routes/`: one component per screen (Auth, Home, RacquetForm, RacquetDetail, StringJobForm, LogPlay, Settings)
- `src/lib/restring.ts`: pure restring logic (limits, status, projection). Covered by `restring.test.ts`
- `src/lib/stringTypes.ts`: string type list, labels, tips, default limits
- `src/lib/db.ts`: Firestore listeners, Svelte stores, and all write functions
- `src/lib/auth.ts`: sign up, log in, log out, auth stores
- `src/lib/firebase.ts`: Firebase init (persistent auth and Firestore cache)
- `src/lib/router.ts`: tiny hash router (no router library)
- `src/lib/types.ts`: shared types
- `firestore.rules`: security rules, must be published in the Firebase console

## Data model
Everything lives under `users/{uid}/`:
- `users/{uid}`: name, email, unit (`kg` or `lb`), optional `customLimits`
- `racquets/{id}`: name, brand, model, `activeStringJobId`
- `stringJobs/{id}`: setup (`full` or `hybrid`), `mainsType`, `crossesType`, names, gauge, tensions, `strungAt`, `playedMinutes`, `status` (`active`, `retired`, `broken`)
- `sessions/{id}`: `stringJobId`, `racquetId`, `playedAt`, `minutes`, `kind` (`match` or `practice`)

`playedMinutes` on a string job is denormalized. Anything that adds, edits or deletes a session must update it in the same batch with `increment()` (see `logSession`, `updateSession`, `deleteSession` in `db.ts`).

## Restring logic
- Types: `poly`, `syngut`, `multi`, `natural`. Default limits are in `DEFAULT_LIMITS` (hours and days).
- Restring is advised when either hours or days reach the limit.
- Hybrid uses the lower limit of mains and crosses.
- Status: below 80% is good, 80% to 100% is soon, 100% or more is now.
- Keep this logic pure and in `restring.ts`. Add or update tests when you change it.

## Conventions and gotchas
- **Offline first.** Firestore writes are fire-and-forget (`.catch(fail)`, never `await` in UI flows). Awaiting a write hangs while offline. Create document IDs locally with `doc(collection(...))`.
- **Signed-in users stay signed in.** Auth uses persisted sessions. Do not add timeouts or forced logout. Logout is only in Settings.
- **Dates** are local `YYYY-MM-DD` strings (`toDateStr`), not timestamps, so day math is timezone-safe.
- **Routing** is hash based so GitHub Pages refreshes never 404. Add routes in `router.ts` and `App.svelte`.
- **Performance matters on phones.** Keep the JS bundle small, avoid heavy dependencies, and use the modular Firebase imports only (never the compat build).
- **Styling** is plain CSS in `src/app.css` with CSS variables and light/dark support. Keep touch targets at least 44px.
- **Config.** The Firebase web config is in the committed `.env` (`VITE_FIREBASE_*`). It is public by design. Data access is enforced by `firestore.rules`, so never loosen those rules.
- Do not rename or move `base: '/restring/'` in `vite.config.ts` without also updating the manifest `start_url` and `scope`.

## Deploy
Pushing to `main` runs `.github/workflows/deploy.yml`: install, test, build, deploy to Pages. Do not commit `dist/` or `node_modules/`.
