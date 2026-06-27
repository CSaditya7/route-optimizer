import fetch from "node-fetch";
import { decodePolyline } from "../utils/geo.js";
import { AppError } from "../utils/error.js";

const BASE = process.env.OSRM_BASE_URL || "https://router.project-osrm.org";
const TIMEOUT = Number(process.env.OSRM_TIMEOUT_MS) || 15_000;

/**
 * Fetch the road-following route geometry for an ordered list of stops.
 *
 * Uses OSRM Route API:
 *   GET /route/v1/driving/{coordinates}
 *       ?overview=full&geometries=polyline6&steps=false&annotations=false
 *
 * When roundTrip=true we append the first stop to the end so OSRM closes
 * the loop and returns the full return leg geometry.
 *
 * @param {Array<{lat, lng}>} orderedStops - stops in optimised visit order
 * @param {boolean} roundTrip
 * @returns {{ path: [number,number][], legs: {duration_s, distance_m}[] }}
 */
export async function fetchRouteGeometry(orderedStops, roundTrip) {
  const waypoints = roundTrip
    ? [...orderedStops, orderedStops[0]]
    : orderedStops;

  // OSRM: lng,lat
  const coords = waypoints.map((s) => `${s.lng},${s.lat}`).join(";");
  const url =
    `${BASE}/route/v1/driving/${coords}` +
    `?overview=full&geometries=polyline6&steps=false`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);

  let raw;
  try {
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!resp.ok) {
      throw new AppError(
        `OSRM Route API returned ${resp.status}: ${resp.statusText}`,
        502
      );
    }
    raw = await resp.json();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      throw new AppError("OSRM geometry request timed out.", 504);
    }
    if (err instanceof AppError) throw err;
    throw new AppError(`Could not reach OSRM: ${err.message}`, 502);
  }

  if (raw.code !== "Ok" || !raw.routes?.length) {
    throw new AppError(
      `OSRM could not find a route: ${raw.code || "unknown"}`,
      502
    );
  }

  const route = raw.routes[0];

  // Decode the full overview polyline into [lat, lng] pairs
  const path = decodePolyline(route.geometry, 6);

  // Extract per-leg duration and distance
  const legs = route.legs.map((leg) => ({
    duration_s: Math.round(leg.duration),
    distance_m: Math.round(leg.distance),
  }));

  return { path, legs };
}
