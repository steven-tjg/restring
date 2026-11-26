# Restring

Mobile-first PWA that tracks how long each tennis string job has been played and tells you when to restring.

Stack: Svelte 5 + Vite + vite-plugin-pwa, Firebase Auth (email/password) + Firestore (offline cache), GitHub Pages.

## Features
- Sign up with name, email, password. Session persists; login is only needed on a new device.
- Add racquets. Record the string: full bed or hybrid, with Polyester, Synthetic Gut, Multifilament or Natural Gut for mains and crosses.
- Log play time per session (quick buttons, manual entry, or live timer).
- Recommendation: progress bar, status (Good / Restring soon / Restring now) and projected restring date. Limits are editable in Settings.
- Works offline; data syncs when signal returns.

## Restring limits (defaults)
| Type | Hours | Days |
|---|---|---|
| Polyester | 15 | 45 |
| Synthetic gut | 25 | 90 |
| Multifilament | 25 | 90 |
| Natural gut | 35 | 120 |

Restring is advised when either limit is reached. Hybrid uses the lower limit of mains and crosses.

## Setup
1. **Firebase console** (free Spark plan):
   - Build > Authentication > Sign-in method > enable **Email/Password**.
   - Build > Firestore Database > create (production mode, nearest region).
   - Firestore > Rules > paste [firestore.rules](firestore.rules) > Publish.
   - Authentication > Settings > Authorized domains > add `steven-tjg.github.io`.
2. **Config**: the Firebase web config lives in the committed `.env` file (hobby project, no secrets needed). Edit it if you change Firebase project.
   ```
   npm install
   npm run dev
   ```
3. **GitHub**: Settings > Pages > Source: **GitHub Actions**.
4. Push to `main`. The workflow tests, builds and deploys to `https://steven-tjg.github.io/restring/`.

The Firebase web config is not secret; access is enforced by the Firestore rules.

## Scripts
- `npm run dev` / `npm run build` / `npm run preview`
- `npm test`: unit tests for the restring logic
- `npm run check`: type check
- `npm run icons`: regenerate PWA icons from `public/icon.svg`
