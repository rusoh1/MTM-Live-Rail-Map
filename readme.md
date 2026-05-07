# MTM Live Rail Map

A real-time public transport tracking web application for Melbourne, built on top of [LED-Rails-Backend](https://github.com/kea-studios/LED-Rails-Backend) by [Chris Dirks / Kea Studios](https://keastudios.co.nz).

> **Credits:** The core backend architecture — GTFS-Realtime protobuf ingestion, track block KML mapping, multi-network support, LED board output, Docker setup, and Bun server — was built by Chris Dirks. This project extends that foundation significantly to become a full public-facing live transport web application.

---

## What this project is

This started as a backend service for driving physical LED train maps. It has since been extended into a fully featured live transport tracking website with a rich interactive frontend, real-time departure boards, service alerts, and line-by-line station navigation — while keeping the original LED board functionality intact.

### What's new in this fork

- **Interactive dark-themed map** — CartoDB Dark Matter base with OpenRailwayMap overlay, custom train triangle markers with white outlines coloured by line
- **Live departure boards** — click any station to see upcoming services grouped by line, with platform numbers, Inbound/Outbound badges, City Loop / Metro Tunnel / Flinders St routing indicators, Express indicators, and outbound terminus names
- **Service alerts panel** — left sidebar shows real-time GTFS service alerts with severity colour coding and expandable descriptions, route tags displayed as human-readable line names
- **Lines panel** — right sidebar lists all Melbourne Metro lines; expand any line to see stations in order, click a station to fly the map to it and open its departure board
- **Station markers** — grouped by parent station from stops.txt, visible at zoom 11+, clickable for departure info
- **Smart direction inference** — inbound/outbound detection using direction_id with fallback inference from trip terminus when direction data is absent
- **PTV Timetable API proxy** — server-side HMAC-SHA1 signed proxy for the PTV Timetable API (requires separate PTV credentials)
- **CORS support** — frontend can be hosted separately from the backend (e.g. on cPanel shared hosting) with a single `BACKEND_URL` config line
- **Auto-removal of stale trains** — trains faded after 3 min, removed from map after 10 min without a position update
- **15-second refresh** — matches the backend's GTFS fetch interval for the freshest possible data
- **Response compression** — zstd / brotli / gzip / deflate (unchanged from original)
- **Docker + Railway ready** — existing Dockerfile and docker-compose.yml work out of the box

---

## API Endpoints

All endpoints are prefixed with the city code (e.g. `/mel-ltm`):

| Endpoint | Description |
|---|---|
| `/` | Server status |
| `/{city}-ltm/status` | Network metrics (trains, blocks, uptime) |
| `/{city}-ltm/api/vehicles` | All active GTFS vehicle entities |
| `/{city}-ltm/api/vehicles/trains` | Train entities only |
| `/{city}-ltm/api/alerts` | GTFS service alert entities |
| `/{city}-ltm/api/trackedtrains` | Processed tracked train list |
| `/{city}-ltm/api/stops` | Stop/platform map (stop_id → name, coords, platform) |
| `/{city}-ltm/api/map` | Live map (this page) |
| `/{city}-ltm/api/viewer` | LED PCB preview |
| `/{city}-ltm/api/positions.csv` | LED position data |
| `/{city}-ltm/api/pcb.svg` | PCB silkscreen SVG |
| `/api/ptv-departures` | PTV Timetable API proxy (requires PTV credentials) |

---

## Setup

### Requirements
- [Bun](https://bun.sh) 1.x
- A Transport Victoria GTFS Realtime API key — [register here](https://www.ptv.vic.gov.au/footer/data-and-reporting/datasets/gtfs/)

### Local development

```bash
git clone https://github.com/rusoh1/MTM-Live-Rail-Map.git
cd MTM-Live-Rail-Map
bun install
```

Create a `.env` file in the project root:

```env
MEL=your_transport_vic_api_key

# Optional — PTV Timetable API (separate credentials, email APIKeyRequest@ptv.vic.gov.au)
PTV_DEVID=your_dev_id
PTV_KEY=your_ptv_key
```

```bash
bun run server.ts
```

Open `http://localhost:3000/mel-ltm/api/map`

---

## Deployment

### Option A — Docker (VPS)

```bash
docker compose up -d
```

Then put Caddy or Nginx in front for HTTPS:

```
# Caddyfile
yourdomain.com {
    reverse_proxy localhost:3000
}
```

### Option B — Railway (no server needed)

1. Push to GitHub
2. [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Add environment variables in the Railway dashboard (`MEL`, `PTV_DEVID`, `PTV_KEY`, `NODE_ENV=production`)
4. Railway provides a public URL automatically

### Option C — Split (backend on Railway, frontend on cPanel)

The map is a single static HTML file and can be hosted anywhere separately from the backend.

1. Deploy backend to Railway (Option B above)
2. In `map.html`, set the `BACKEND_URL` constant near the top of the script:
   ```js
   const BACKEND_URL = 'https://your-app.up.railway.app/mel-ltm';
   ```
3. Upload `map.html` to your cPanel `public_html/` directory
4. Visit `https://yourdomain.com/map.html`

---

## Project structure

| File | Description |
|---|---|
| `server.ts` | Bun HTTP server, routing, compression, CORS, PTV proxy |
| `railNetwork.ts` | Network config loader, GTFS fetching, track block assignment |
| `trackBlocks.ts` | KML parsing and LED block occupancy |
| `trainPairs.ts` | Paired train detection |
| `platforms.ts` | stops.txt parser (stop name, coords, platform, parent station) |
| `cache.ts` | Gzip JSON cache layer |
| `customUtils.ts` | Timestamped colourised logging |
| `map.html` | Interactive live map frontend |
| `viewer.html` | LED PCB preview |
| `railNetworks/MEL/` | Melbourne config, stops, track blocks, PCB files |

---

## License

MIT — see [LICENSE](LICENCE).

Original backend by [Chris Dirks / Kea Studios](https://keastudios.co.nz) — go check out the physical LED train maps.
