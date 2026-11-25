# Noteworthy Planets Website

My code.org app in website form. Used to publish discovered planets from the game, "No Man's Sky".

## Planet API

Planets are stored in Cloudflare D1 (`noteworthy-planets`) and served by `src/worker.js`. Everything else is static from `public/`.

| Route | What it does |
| --- | --- |
| `GET /api/planets` | All visible planets |
| `GET /api/planets/:id` | One planet |
| `POST /api/planets` | Post a planet (5 per hour per visitor) |
| `GET /api/posters` | Poster leaderboard |
| `DELETE /api/planets/:id` | Hide a planet, needs the `x-admin-key` header |

Dropdown choices live in `public/data/options.json` and the Worker only accepts values from it.

Set the admin key once: `npx wrangler secret put ADMIN_KEY`

Run locally: `npx wrangler d1 migrations apply noteworthy-planets --local` then `npx wrangler dev`
