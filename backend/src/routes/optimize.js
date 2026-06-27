import { Router } from "express";
import { optimizeRoute } from "../controllers/optimizeCtrl.js";
import { asyncWrap } from "../utils/error.js";

const router = Router();

/**
 * POST /api/optimize
 *
 * Body:
 * {
 *   stops: [{ id, lat, lng }],   // 2–25 stops; index 0 = depot
 *   round_trip: boolean,          // return to depot after last stop
 *   num_vehicles: number          // 1–5 (default 1)
 * }
 *
 * Response:
 * {
 *   order: number[],              // original stop indices in visit order
 *   ordered_stop_ids: number[],   // stop .id values in visit order
 *   path: [number, number][],     // [lat, lng] pairs for road polyline
 *   legs: { from, to, duration_s, distance_m }[],
 *   total_duration_s: number,
 *   total_distance_m: number,
 *   savings_pct: number           // % improvement vs naïve sequential order
 * }
 */
router.post("/optimize", asyncWrap(optimizeRoute));

export default router;
