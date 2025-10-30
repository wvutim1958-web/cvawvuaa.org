## Quick orientation for AI coding agents

This repository is a mostly-static website for the Central Virginia Chapter of WVU Alumni with a small Node-based helper API. The site uses plain HTML/CSS/vanilla JS, JSON data files under `content/` and `newsletters/`, and some server-side scripts in Node for auxiliary tasks (rankings API).

Be practical and make minimal, targeted changes. Avoid large-scale refactors unless the maintainer requests them.

Key commands (how maintainers run or test):

- Start the lightweight Node server (serves the site + rankings API):

```bash
npm install
npm start    # runs `node server.js` and serves files on http://localhost:3000
```

- Quick static preview (if you don't need the Node API):

```bash
python3 -m http.server 8000  # then open http://localhost:8000/index.html
```

Important files & where to look for common tasks

- `index.html` — site entry and examples of client-side data usage.
- `server.js` — small Express server that serves static files and exposes `/api/rankings` and `/api/update-rankings`.
- `package.json` — scripts: `start` (server) and `update` (ranking updater).
- `content/` — JSON content consumed by pages (e.g., `content/gallery.json`).
- `newsletters/posts.json` — newsletter archive used by `/newsletters/` pages.
- `events/rsvp.html` — RSVP form implementation: uses FormSubmit for email and stores local admin captures in `localStorage`.
- `assets/` and `assets/gallery/` — static media; add images under `assets/gallery/YYYY/...` and update `content/gallery.json`.

Data model & runtime persistence patterns

- Many pages read small JSON files from `content/` or `newsletters/` at runtime (client-side fetch). Edit the JSON directly; pages expect specific keys documented near each JSON (see `readme.md`).
- Some admin features store data in browser `localStorage` (e.g., RSVPs). For testing, maintainers often run `localStorage.clear()` in the browser console before re-testing.
- The Node server writes/reads `rankings-data.json` on startup; check `calculate-points.js` and `update-rankings.js` for ranking logic.

Project conventions and patterns

- Vanilla JS only: there are no frameworks. Follow existing vanilla JS patterns and DOM manipulation style.
- Files are often UPPERCASE and hyphenated (e.g., `IMAGE-OPTIMIZATION-GUIDE.md`). Keep case consistent when adding new top-level docs.
- Year-based content: gallery and some pages infer year from file paths and fields like `date`/`year` in JSON.

Debugging tips & common developer actions

- To reproduce form/localStorage bugs: open developer console (F12), run `localStorage.clear()`, refresh, and re-submit the form.
- To debug server-side code: run `node server.js` (or `npm start`) and open `http://localhost:3000` — server logs print helpful messages (see `server.js`).
- Search for data-driven pages by looking for `fetch` calls in `js/` and `scripts/` directories.

What to change and where (examples)

- Add a gallery entry: put images in `assets/gallery/2025/` and append an object to `content/gallery.json`.
- Edit RSVP admin capture behavior: `events/rsvp.html` and its inline script manage exports/imports of RSVP JSON/CSV.
- Update rankings logic: modify `calculate-points.js` and use `node update-rankings.js` or the `/api/update-rankings` endpoint.

Checks and expectations for PRs from an AI agent

- Keep diffs small and focused. Mention the exact files changed and reason in the PR body.
- If adding JS behavior, include a short manual test plan (how to reproduce the behavior and what to check in the browser console).
- Do not remove or rename data files under `content/` unless you also update all pages that consume them.

If anything here is unclear or you want me to expand specific sections (for example: deployment, Netlify settings, or the rankings code), say which area and I'll iterate.
