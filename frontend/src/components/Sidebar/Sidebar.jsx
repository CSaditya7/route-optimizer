import StopList from "./StopList.jsx";
import RouteStats from "./RouteStats.jsx";
import OptimizeButton from "../Controls/OptimizeButton.jsx";
import RoundTripToggle from "../Controls/RoundTripToggle.jsx";
import VehicleSelector from "../Controls/VehicleSelector.jsx";
import ImportExport from "../Controls/ImportExport.jsx";

/**
 * Left sidebar — header, action controls, stop list, and result stats.
 */
export default function Sidebar({
  stops,
  result,
  loading,
  roundTrip,
  numVehicles,
  onOptimize,
  onRemoveStop,
  onClearStops,
  onAddRandom,
  onRoundTripChange,
  onNumVehiclesChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onLoadStops,
}) {
  return (
    <aside className="sidebar">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="sidebar-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}>
              🚚 <span style={{ color: "var(--accent)" }}>Route</span> Optimizer
            </h1>
            <p style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 2 }}>
              Real roads · OR-Tools TSP · OSRM routing
            </p>
          </div>

          {/* Undo / redo */}
          <div className="row" style={{ gap: 4 }}>
            <button className="btn-icon" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">↩</button>
            <button className="btn-icon" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">↪</button>
          </div>
        </div>
      </div>

      {/* ── Scrollable body ───────────────────────────────────────────────── */}
      <div className="sidebar-scroll">

        {/* Quick-add + clear */}
        <div className="card col" style={{ gap: 8 }}>
          <div className="row">
            <button className="btn-secondary grow" onClick={onAddRandom} style={{ fontSize: 12.5 }}>
              + 10 random stops
            </button>
            <button className="btn-secondary" onClick={onClearStops} style={{ color: "var(--danger)", borderColor: "var(--danger-dim)" }}>
              Clear
            </button>
          </div>
          <p style={{ fontSize: 11.5, color: "var(--text-dim)", lineHeight: 1.4 }}>
            Click the map to add stops · Drag pins to move · First pin (orange) = depot
          </p>
        </div>

        {/* Route options */}
        <div className="card col" style={{ gap: 10 }}>
          <div className="card-title">Options</div>
          <RoundTripToggle value={roundTrip} onChange={onRoundTripChange} />
          <VehicleSelector value={numVehicles} onChange={onNumVehiclesChange} />
        </div>

        {/* Import / export */}
        <ImportExport stops={stops} result={result} onLoadStops={onLoadStops} />

        {/* Optimize CTA */}
        <OptimizeButton
          onClick={onOptimize}
          loading={loading}
          disabled={stops.length < 2 || loading}
          stopCount={stops.length}
        />

        {/* Stop list */}
        <div className="card">
          <div className="card-title">
            Stops
            <span style={{ color: "var(--accent)", marginLeft: 6 }}>{stops.length}</span>
          </div>
          <StopList stops={stops} result={result} onRemove={onRemoveStop} />
        </div>

        {/* Route stats (only after optimize) */}
        {result && <RouteStats result={result} />}
      </div>
    </aside>
  );
}
