import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";

import { useStops } from "./hooks/useStops.js";
import { optimizeRoute } from "./services/api.js";
import MapView from "./components/Map/MapView.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";

export default function App() {
  const {
    stops, addStop, removeStop, moveStop,
    clearStops, loadStops,
    undo, redo, canUndo, canRedo,
  } = useStops();

  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [roundTrip,   setRoundTrip]   = useState(true);
  const [numVehicles, setNumVehicles] = useState(1);

  // Clear result whenever stops change so the stale route doesn't linger
  // (the map effect in MapView handles clearing the polyline)
  const clearResult = useCallback(() => setResult(null), []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "z") { e.preventDefault(); undo(); clearResult(); }
      if (ctrl && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault(); redo(); clearResult();
      }
      if (ctrl && e.key === "Enter") {
        if (stops.length >= 2 && !loading) handleOptimize();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops, loading, undo, redo]);

  // ── Map click → add stop ──────────────────────────────────────────────────
  const handleMapClick = useCallback(
    (lat, lng) => {
      addStop(lat, lng);
      clearResult();
    },
    [addStop, clearResult]
  );

  // ── Marker drag → move stop ───────────────────────────────────────────────
  const handleMarkerDragEnd = useCallback(
    (id, lat, lng) => {
      moveStop(id, lat, lng);
      clearResult();
    },
    [moveStop, clearResult]
  );

  // ── Remove stop ───────────────────────────────────────────────────────────
  const handleRemoveStop = useCallback(
    (id) => {
      removeStop(id);
      clearResult();
    },
    [removeStop, clearResult]
  );

  // ── Clear all ─────────────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    clearStops();
    clearResult();
  }, [clearStops, clearResult]);

  // ── Add random stops centered on current map view ─────────────────────────
  const handleAddRandom = useCallback(() => {
    // Use first stop as center if we have one, else a neutral default
    const base = stops[0] ?? { lat: 28.6139, lng: 77.209 };
    for (let i = 0; i < 10; i++) {
      const lat = base.lat + (Math.random() - 0.5) * 0.12;
      const lng = base.lng + (Math.random() - 0.5) * 0.12;
      addStop(lat, lng);
    }
    clearResult();
  }, [stops, addStop, clearResult]);

  // ── Optimize ──────────────────────────────────────────────────────────────
  const handleOptimize = useCallback(async () => {
    if (stops.length < 2) return;
    setLoading(true);
    setResult(null);

    const toastId = toast.loading("Building distance matrix & solving…");
    try {
      const data = await optimizeRoute({
        stops: stops.map((s) => ({ id: s.id, lat: s.lat, lng: s.lng })),
        round_trip:    roundTrip,
        num_vehicles:  numVehicles,
      });
      setResult(data);
      toast.success(
        `Done! Saved ${data.savings_pct}% vs sequential order.`,
        { id: toastId }
      );
    } catch (err) {
      toast.error(err.message || "Optimization failed.", { id: toastId });
    } finally {
      setLoading(false);
    }
  }, [stops, roundTrip, numVehicles]);

  // ── CSV import ────────────────────────────────────────────────────────────
  const handleLoadStops = useCallback(
    (parsed) => {
      loadStops(parsed);
      clearResult();
    },
    [loadStops, clearResult]
  );

  return (
    <div className="app-shell">
      <Sidebar
        stops={stops}
        result={result}
        loading={loading}
        roundTrip={roundTrip}
        numVehicles={numVehicles}
        onOptimize={handleOptimize}
        onRemoveStop={handleRemoveStop}
        onClearStops={handleClear}
        onAddRandom={handleAddRandom}
        onRoundTripChange={setRoundTrip}
        onNumVehiclesChange={setNumVehicles}
        onUndo={() => { undo(); clearResult(); }}
        onRedo={() => { redo(); clearResult(); }}
        canUndo={canUndo}
        canRedo={canRedo}
        onLoadStops={handleLoadStops}
      />

      <MapView
        stops={stops}
        result={result}
        onMapClick={handleMapClick}
        onMarkerDragEnd={handleMarkerDragEnd}
      />
    </div>
  );
}
