# DebriDAV Frontend

Admin dashboard for [DebriDAV](https://github.com/skjaere/debridav) — a WebDAV gateway for debrid services.

Built with React, TypeScript, Tailwind CSS, and a Dracula-inspired theme.

## Features

- **Dashboard** — Embedded Grafana monitoring panels
- **File Browser** — Browse WebDAV filesystem with streaming playback via proxy
- **Usenet** — NZB file upload and import queue monitoring
- **Torrents** — Add torrents via file upload or magnet link (qBittorrent-compatible API)
- **Configuration** — Inline editing for all DebriDAV settings (Core, WebDAV, Providers, Arrs, NNTP) with verification, credential pairs, and debrid client management

## Tech Stack

- [Vite](https://vite.dev/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [React Router v7](https://reactrouter.com/)
- [Lucide React](https://lucide.dev/) icons
- [Express](https://expressjs.com/) production server with API/WebDAV reverse proxy

## Getting Started

### Prerequisites

- Node.js 20+
- A running [DebriDAV](https://github.com/skjaere/debridav) backend

### Development

```bash
npm install
npm run dev
```

The Vite dev server starts on `http://localhost:5173` and proxies `/api` requests to `http://localhost:8080`.

### Production

```bash
npm run build
npm run serve
```

The Express server serves the built static files and proxies API requests to the backend.

### Docker

```bash
docker build -t debridav-frontend .
docker run -p 3000:3000 -e API_TARGET=http://debridav:8080 debridav-frontend
```

Docker Compose example pairing frontend with backend:

```yaml
services:
  debridav:
    image: ghcr.io/skjaere/debridav:latest
    # ... backend config

  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      API_TARGET: http://debridav:8080
    depends_on:
      - debridav
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Express server port |
| `API_TARGET` | `http://localhost:8080` | DebriDAV backend URL |
| `DEBRIDAV_WEBDAV_USERNAME` | — | WebDAV basic auth username (for stream proxy) |
| `DEBRIDAV_WEBDAV_PASSWORD` | — | WebDAV basic auth password (for stream proxy) |

## Project Structure

```
src/
├── components/
│   ├── config/      # Configuration editors and property rows
│   ├── files/       # File browser detail modal
│   ├── layout/      # Sidebar, topbar, dashboard layout
│   ├── queue/       # Import queue detail modal
│   ├── ui/          # Shared UI primitives (Badge, Button, Card, etc.)
│   └── usenet/      # NZB upload form
├── hooks/           # Data fetching hooks (useConfig, useNntpPools, etc.)
├── lib/             # API client, constants
├── pages/           # Route-level page components
│   └── config/      # Config page wrappers per group
├── router/          # React Router configuration
└── types/           # TypeScript type definitions
server/
└── index.ts         # Express production server with API proxy
```

## License

See the [DebriDAV](https://github.com/skjaere/debridav) repository.
