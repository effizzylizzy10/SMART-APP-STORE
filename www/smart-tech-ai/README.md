# Smart Tech AI

AI chat that works online and offline. Plain HTML, CSS and JavaScript, so there is nothing to build.

## Folders
- `index.html` — the page
- `css/styles.css` — all styling
- `js/` — the app code, loaded in this order: `config` (providers, settings, storage), `studio` (search, logo/image/GIF creation), `ui` (chat screen, settings, photos, voice), `knowledge` and `research` (daily self-learning), `offline` (on-device models), `chat` (sending messages), `main` (start-up), `background` (animated background)
- `assets/icon.svg` — app icon
- `sw.js` — service worker that lets the app open with no internet
- `manifest.webmanifest` — lets you install it to your home screen

## Run it
Host this folder on any https static host (Vercel, Netlify, GitHub Pages). Open it once while online, then Settings → Offline models → Install a model.

## Updating
- If you add, remove or rename a file, update `SHELL` in `sw.js` and raise `VERSION` so phones refresh their saved copy.
- API keys are typed into each browser and stay in that browser.
