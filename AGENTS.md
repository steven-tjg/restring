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
- `src/routes/`: one component per screen (Auth, Home, RacquetForm, RacquetDetail, StringJobForm, Playtime, Cut, Settings)
- `src/lib/restring.ts`: pure restring logic (limits, status, projection). Covered by `restring.test.ts`
- `src/lib/catalog.ts`: popular racquet brands/models and string brands/models. Each string model carries its type (poly, syngut, multi, natural), so the type is never picked by hand. Racquet and string pickers are dropdown-only (no free text); add new gear here. Also display helpers (`racquetTitle`, `stringNames`)
- `src/lib/StringPicker.svelte`: brand + model selects for one string side (mains or crosses)
- `src/lib/Ring.svelte`, `JobStatus.svelte`, `BottomNav.svelte`: progress ring, status block, bottom navigation
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
- `racquets/{id}`: name (optional nickname, or "Brand Model"), brand, model, `activeStringJobId`
- `stringJobs/{id}`: setup (`full` or `hybrid`), `mainsType`, `crossesType`, `mainsBrand`/`mainsModel`/`crossesBrand`/`crossesModel`, `mainsName`/`crossesName` ("Brand Model", and the only name on records from before the catalog), gauge, separate `tensionMain`/`tensionCross`, `strungAt`, `playedMinutes`, `status` (`active` or `cut`), `endedAt`, `endReason` (`worn`, `tension`, `broke`, `change`), optional `cost`. Strings saved before the Cut flow may have status `retired` (shown as "Replaced") or `broken` (shown as "Broke"); `endLabel` in `restring.ts` handles both. The brand/model fields are optional so older records still render

String lifecycle per racquet: unstrung -> strung (one active string, `activeStringJobId`) -> **cut** -> unstrung -> strung. A racquet can only be given a new string when unstrung; `StringJobForm` sends users to the Cut screen if one is active. Cutting (`cutStringJob` in `db.ts`) records the cut date and reason, moves the string to history and clears `activeStringJobId`. The string form offers "Same as last string" to pre-fill the next one. History per string shows dates, days in use, total hours, average pace, tension, gauge, cost and cost per hour, and its playtime entries.
- `sessions/{id}`: a playtime entry: `stringJobId`, `racquetId`, `playedAt`, `minutes`, `remark` (free text). Old entries may have `kind` (`match` or `practice`) instead of a remark

Durations are stored as whole minutes but always entered and shown in **hours** (`fmtHours` in `restring.ts`; entry is `hours * 60` rounded). There is no log/timer screen: playtime is added from `Playtime.svelte`, edited in `RacquetDetail.svelte`. Past strings stay in history with their entries, expandable per string.

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
- **Styling** is plain CSS in `src/app.css` with CSS variables and light/dark support (court green, tennis-ball yellow accent). Keep touch targets at least 44px. Use native `<select>` for pickers. Pages with the bottom nav use `class="page with-nav"`; forms hide the nav.
- **Never write `undefined` to Firestore**; it rejects it. Use `null` for empty values.
- **Icons** are generated from `public/icon.svg` with `npm run icons` (config in `pwa-assets.config.ts`). Do not edit the PNGs by hand.
- Do not name a Svelte import `path` in a file that draws SVG `<path>`; it triggers a warning.
- **Config.** The Firebase web config is in the committed `.env` (`VITE_FIREBASE_*`). It is public by design. Data access is enforced by `firestore.rules`, so never loosen those rules.
- Do not rename or move `base: '/restring/'` in `vite.config.ts` without also updating the manifest `start_url` and `scope`.

## Deploy
Pushing to `main` runs `.github/workflows/deploy.yml`: install, test, build, deploy to Pages. Do not commit `dist/` or `node_modules/`.
