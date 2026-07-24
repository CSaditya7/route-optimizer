# 🚚 Route Optimizer

A professional full-stack route optimization web application that calculates the most efficient delivery route across multiple stops using real road data. 

![Route Optimizer](https://img.shields.io/badge/Stack-React%20%2B%20Node.js-blue) ![MapLibre](https://img.shields.io/badge/Map-MapLibre%20GL%20JS-green) ![OSRM](https://img.shields.io/badge/Routing-OSRM-orange) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

- 🗺️ **Interactive Map** — Click to add stops, drag pins to reposition, MapLibre GL JS with OpenStreetMap vector tiles
- ⚡ **TSP Optimization** — Nearest-neighbour + 2-opt algorithm solves the Travelling Salesman Problem in pure JavaScript
- 🛣️ **Real Road Routing** — OSRM public API provides actual drive times, distances, and road-following geometry
- 🚗 **Multi-Vehicle VRP** — Support for 1–5 vehicles with greedy cluster assignment
- 🔄 **Round Trip / Open Route** — Toggle whether the driver returns to the depot
- 📥 **CSV Import** — Import stops from a CSV file with `lat,lng` columns
- 📤 **CSV Export** — Export the optimised route with visit order
- ↩️ **Undo / Redo** — Full history of stop edits (Ctrl+Z / Ctrl+Y)
- 📊 **Route Stats** — Total time, distance, savings %, and per-leg breakdown
- 📱 **Mobile Responsive** — Works on desktop and mobile browsers

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Map | MapLibre GL JS + OpenFreeMap tiles |
| Backend | Node.js + Express |
| Routing | OSRM (Open Source Routing Machine) |
| Solver | Nearest-Neighbour + 2-opt TSP (pure JS) |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## 📁 Project Structure

```
route-optimizer/
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js              # Express entry point
│       ├── routes/
│       │   └── optimize.js        # POST /api/optimize
│       ├── controllers/
│       │   └── optimizeCtrl.js    # Orchestrates OSRM + solver
│       ├── services/
│       │   ├── osrm.js            # Distance matrix (OSRM Table API)
│       │   ├── geometry.js        # Road polyline (OSRM Route API)
│       │   └── solver.js          # TSP/VRP solver (pure JavaScript)
│       └── utils/
│           ├── geo.js             # Polyline decoder, formatters
│           └── error.js           # AppError class, error handler
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx                # Root component, state orchestration
        ├── main.jsx               # React entry point
        ├── styles/
        │   └── global.css         # Dark theme design tokens + layout
        ├── services/
        │   └── api.js             # Fetch wrapper for backend
        ├── hooks/
        │   └── useStops.js        # Stop CRUD + undo/redo history
        └── components/
            ├── Map/
            │   ├── MapView.jsx    # Map container component
            │   ├── useMapLibre.js # Map init hook, markers, route layer
            │   └── markers.js     # Numbered SVG marker factory
            ├── Sidebar/
            │   ├── Sidebar.jsx    # Left panel shell
            │   ├── StopList.jsx   # Ordered stop rows
            │   ├── StopCard.jsx   # Single stop with edit/delete
            │   └── RouteStats.jsx # Totals + per-leg table
            └── Controls/
                ├── OptimizeButton.jsx
                ├── RoundTripToggle.jsx
                ├── VehicleSelector.jsx
                └── ImportExport.jsx
```

---

## 🚀 Local Setup

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| Git | any | [git-scm.com](https://git-scm.com) |

No Python required. The TSP solver is pure JavaScript.

### 1 — Clone the repository

```bash
git clone https://github.com/CSaditya7/route-optimizer.git
cd route-optimizer
```

### 2 — Setup the backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs at `http://localhost:3001`
Verify: open `http://localhost:3001/health` → should return `{"status":"ok"}`

### 3 — Setup the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

Open `http://localhost:5173` in your browser.

---

## 🔧 Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
PORT=3001
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:5173,http://localhost:5174
OSRM_BASE_URL=https://router.project-osrm.org
OSRM_TIMEOUT_MS=15000
MAX_STOPS=25
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=30
```

---

## 📖 API Reference

### `POST /api/optimize`

Optimizes a multi-stop delivery route.

**Request body:**
```json
{
  "stops": [
    { "id": 1, "lat": 28.6139, "lng": 77.2090 },
    { "id": 2, "lat": 28.6300, "lng": 77.2200 },
    { "id": 3, "lat": 28.5900, "lng": 77.1800 }
  ],
  "round_trip": true,
  "num_vehicles": 1
}
```

**Response:**
```json
{
  "order": [0, 2, 1],
  "ordered_stop_ids": [1, 3, 2],
  "path": [[28.61, 77.20], [28.60, 77.19]],
  "legs": [
    { "from": 0, "to": 1, "duration_s": 354, "distance_m": 4660 }
  ],
  "total_duration_s": 1367,
  "total_distance_m": 17027,
  "savings_pct": 12,
  "num_stops": 3
}
```

### `GET /health`

Returns server status.

```json
{ "status": "ok", "ts": 1234567890 }
```

---

## 🌐 Deployment

### Backend → Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Set **Root Directory** to `backend`
4. Add environment variables from `.env.example`
5. Generate a public domain under Settings → Networking

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-railway-app.up.railway.app/api
   ```
4. Deploy

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Z` | Undo last stop change |
| `Ctrl + Y` | Redo |
| `Ctrl + Enter` | Optimize route |

---

## 📄 CSV Import Format

Your CSV file must have `lat` and `lng` columns. An optional `label` column sets the stop name.

```csv
lat,lng,label
28.6139,77.2090,Warehouse
28.6300,77.2200,Customer A
28.5900,77.1800,Customer B
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📝 License

MIT License — feel free to use this project for personal or commercial purposes.

---

## 👨‍💻 Author

**Adi** — ECE Student at JIIT Noida  
GitHub: [@CSaditya7](https://github.com/CSaditya7)
