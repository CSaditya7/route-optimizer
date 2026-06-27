import { buildDistanceMatrix } from "../services/osrm.js";
import { solveVRP } from "../services/solver.js";
import { fetchRouteGeometry } from "../services/geometry.js";
import { AppError } from "../utils/error.js";

const MAX_STOPS = Number(process.env.MAX_STOPS) || 25;

/**
 * Validate the incoming request body.
 * Throws AppError (400) on any problem.
 */
function validateBody({ stops, num_vehicles }) {
  if (!Array.isArray(stops) || stops.length < 2) {
    throw new AppError("Provide at least 2 stops.", 400);
  }
  if (stops.length > MAX_STOPS) {
    throw new AppError(`Maximum ${MAX_STOPS} stops allowed.`, 400);
  }
  for (const [i, s] of stops.entries()) {
    if (typeof s.lat !== "number" || typeof s.lng !== "number") {
      throw new AppError(`Stop at index ${i} has invalid lat/lng.`, 400);
    }
    if (s.lat < -90 || s.lat > 90 || s.lng < -180 || s.lng > 180) {
      throw new AppError(`Stop at index ${i} has out-of-range coordinates.`, 400);
    }
  }
  if (num_vehicles !== undefined) {
    const v = Number(num_vehicles);
    if (!Number.isInteger(v) || v < 1 || v > 5) {
      throw new AppError("num_vehicles must be an integer from 1 to 5.", 400);
    }
  }
}

/**
 * Compute naive (sequential) total duration to measure optimisation savings.
 */
function naiveDuration(matrix) {
  let total = 0;
  for (let i = 0; i < matrix.length - 1; i++) {
    total += matrix[i][i + 1];
  }
  total += matrix[matrix.length - 1][0]; // return to depot
  return total;
}

export async function optimizeRoute(req, res) {
  const { stops, round_trip = true, num_vehicles = 1 } = req.body;

  validateBody({ stops, num_vehicles });

  const n = stops.length;

  // ── Step 1: build n×n drive-time matrix from OSRM ─────────────────────────
  const { durations, distances } = await buildDistanceMatrix(stops);

  // ── Step 2: solve TSP/VRP with OR-Tools ───────────────────────────────────
  const order = await solveVRP({
    durations,
    distances,
    numVehicles: Number(num_vehicles),
    roundTrip: Boolean(round_trip),
  });
  // order = array of original stop indices in optimised visit sequence

  // ── Step 3: fetch road-following geometry for the optimised order ──────────
  const orderedStops = order.map((i) => stops[i]);
  const { path, legs } = await fetchRouteGeometry(orderedStops, Boolean(round_trip));

  // ── Step 4: compute totals & savings ──────────────────────────────────────
  const total_duration_s = legs.reduce((s, l) => s + l.duration_s, 0);
  const total_distance_m = legs.reduce((s, l) => s + l.distance_m, 0);

  const naive = naiveDuration(durations);
  const savings_pct =
    naive > 0 ? Math.round(((naive - total_duration_s) / naive) * 100) : 0;

  // ── Step 5: build leg labels using original visit-position indices ─────────
  const labelledLegs = legs.map((leg, i) => ({
    from: i === 0 ? 0 : i,           // visit position (0 = depot)
    to: i + 1 < order.length ? i + 1 : 0,
    from_id: stops[order[i]]?.id,
    to_id: stops[order[(i + 1) % order.length]]?.id,
    duration_s: leg.duration_s,
    distance_m: leg.distance_m,
  }));

  res.json({
    order,                                        // original indices
    ordered_stop_ids: order.map((i) => stops[i].id),
    path,                                         // [[lat,lng], …]
    legs: labelledLegs,
    total_duration_s,
    total_distance_m,
    savings_pct: Math.max(0, savings_pct),
    num_stops: n,
  });
}
