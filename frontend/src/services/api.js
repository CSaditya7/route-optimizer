const API_BASE = import.meta.env.VITE_API_URL || "/api";

/**
 * POST /api/optimize
 *
 * @param {{
 *   stops: { id: number, lat: number, lng: number }[],
 *   round_trip: boolean,
 *   num_vehicles: number
 * }} payload
 * @returns {Promise<OptimizeResult>}
 */
export async function optimizeRoute(payload) {
  const resp = await fetch(`${API_BASE}/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await resp.json();

  if (!resp.ok) {
    // Surface the backend's error message directly in the toast
    throw new Error(data.error || `Server error ${resp.status}`);
  }

  return data;
}

/**
 * GET /health — used on mount to confirm backend is reachable.
 * Resolves silently; rejects on network failure.
 */
export async function checkHealth() {
  const resp = await fetch(
    (import.meta.env.VITE_API_URL || "").replace("/api", "") + "/health"
  );
  if (!resp.ok) throw new Error("Backend unreachable");
  return resp.json();
}
