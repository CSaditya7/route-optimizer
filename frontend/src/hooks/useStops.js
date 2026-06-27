import { useState, useCallback, useRef } from "react";

let _nextId = 1;
const newId = () => _nextId++;

/**
 * Manages the stops array with full undo/redo history.
 *
 * History is a stack of stop-array snapshots. Each mutating action
 * pushes the current state onto the past stack and clears the future stack.
 *
 * Returns:
 *   stops           – current stops array
 *   addStop         – (lat, lng) → void
 *   removeStop      – (id) → void
 *   moveStop        – (id, lat, lng) → void  (called on marker dragend)
 *   clearStops      – () → void
 *   loadStops       – (stops[]) → void  (CSV import)
 *   undo / redo     – () → void
 *   canUndo / canRedo – boolean
 */
export function useStops() {
  const [stops, setStops] = useState([]);
  const past   = useRef([]);  // arrays of previous states
  const future = useRef([]);  // arrays of undone states

  // ── History helpers ──────────────────────────────────────────────────────
  const snapshot = useCallback((prev) => {
    past.current = [...past.current.slice(-49), prev]; // keep last 50
    future.current = [];
  }, []);

  const applyStops = useCallback((prev, next) => {
    snapshot(prev);
    setStops(next);
  }, [snapshot]);

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const addStop = useCallback((lat, lng) => {
    setStops((prev) => {
      const next = [...prev, { id: newId(), lat, lng }];
      snapshot(prev);
      return next;
    });
  }, [snapshot]);

  const removeStop = useCallback((id) => {
    setStops((prev) => {
      const next = prev.filter((s) => s.id !== id);
      snapshot(prev);
      return next;
    });
  }, [snapshot]);

  const moveStop = useCallback((id, lat, lng) => {
    setStops((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, lat, lng } : s));
      snapshot(prev);
      return next;
    });
  }, [snapshot]);

  const clearStops = useCallback(() => {
    setStops((prev) => {
      snapshot(prev);
      return [];
    });
  }, [snapshot]);

  /**
   * Replace all stops from a CSV import.
   * Assigns fresh IDs so imported stops don't collide with existing ones.
   */
  const loadStops = useCallback((rawStops) => {
    setStops((prev) => {
      const next = rawStops.map((s) => ({
        id:  newId(),
        lat: Number(s.lat),
        lng: Number(s.lng),
        label: s.label || undefined,
      }));
      snapshot(prev);
      return next;
    });
  }, [snapshot]);

  // ── Undo / redo ───────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    if (!past.current.length) return;
    const prev = past.current[past.current.length - 1];
    past.current = past.current.slice(0, -1);
    setStops((current) => {
      future.current = [current, ...future.current.slice(0, 49)];
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    if (!future.current.length) return;
    const next = future.current[0];
    future.current = future.current.slice(1);
    setStops((current) => {
      past.current = [...past.current.slice(-49), current];
      return next;
    });
  }, []);

  return {
    stops,
    addStop,
    removeStop,
    moveStop,
    clearStops,
    loadStops,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}
