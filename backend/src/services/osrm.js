import fetch from "node-fetch";
import { AppError } from "../utils/error.js";

const BASE = process.env.OSRM_BASE_URL || "https://router.project-osrm.org";
const TIMEOUT = Number(process.env.OSRM_TIMEOUT_MS) || 15_000;

/**
 * Call OSRM's Table API to get an n×n matrix of drive durations (seconds)
 * and distances (meters) between all stops.
 *
 * OSRM Table endpoint:
 *   GET /table/v1/driving/{coordinates}
 *       ?annotations=duration,distance
 *       &sources=all&destinations=all
 *
 * Coordinates format: lng,lat;lng,lat;…  (note: lng FIRST for OSRM)
 *
 * @param {Array<{lat: number, lng: number}>} stops
 * @returns {{ durations: number[][], distances: number[][] }}
 */
export async function buildDistanceMatrix(stops) {
  // OSRM expects longitude,latitude
  const coords = stops.map((s) => `${s.lng},${s.lat}`).join(";");
  const url =
    `${BASE}/table/v1/driving/${coords}` +
    `?annotations=duration,distance&sources=all&destinations=all`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);

  let raw;
  try {
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!resp.ok) {
      throw new AppError(
        `OSRM Table API returned ${resp.status}: ${resp.statusText}`,
        502
      );
    }
    raw = await resp.json();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      throw new AppError("OSRM request timed out — try fewer stops.", 504);
    }
    if (err instanceof AppError) throw err;
    throw new AppError(`Could not reach OSRM: ${err.message}`, 502);
  }

  if (raw.code !== "Ok") {
    throw new AppError(`OSRM error: ${raw.code} — ${raw.message || "unknown"}`, 502);
  }

  // OSRM occasionally returns null cells for unreachable pairs — replace with
  // a large finite value so the solver can still produce a route.
  const LARGE = 9_999_999;

  const durations = raw.durations.map((row) =>
    row.map((v) => (v === null || v === undefined ? LARGE : Math.round(v)))
  );
  const distances = raw.distances.map((row) =>
    row.map((v) => (v === null || v === undefined ? LARGE : Math.round(v)))
  );

  return { durations, distances };
}
