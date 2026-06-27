/**
 * A single row in the stop list.
 *
 * Props:
 *   stop    – { id, lat, lng, label? }
 *   index   – position in the stops array (0 = depot)
 *   visitPos – position in the optimised visit order (null if not yet optimised)
 *   onRemove – (id) → void
 */
export default function StopCard({ stop, index, visitPos, onRemove }) {
  const isDepot = index === 0;
  const badgeLabel = isDepot ? "D" : visitPos != null ? visitPos : index;
  const badgeColor = isDepot
    ? { bg: "#f59e0b", text: "#2a1700" }
    : visitPos != null
    ? { bg: "#22c55e", text: "#052e16" }
    : { bg: "#38bdf8", text: "#04141f" };

  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        fontSize: 13,
      }}
    >
      {/* Badge */}
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: badgeColor.bg,
          color: badgeColor.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 11,
          flexShrink: 0,
        }}
      >
        {badgeLabel}
      </span>

      {/* Label + coords */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {stop.label || (isDepot ? "Depot / Start" : `Stop ${index}`)}
        </div>
        <div className="mono" style={{ color: "var(--text-dim)", marginTop: 1 }}>
          {stop.lat.toFixed(5)}, {stop.lng.toFixed(5)}
        </div>
      </div>

      {/* Delete button */}
      <button
        className="btn-danger ml-auto"
        onClick={() => onRemove(stop.id)}
        title="Remove stop"
        aria-label="Remove stop"
      >
        ✕
      </button>
    </li>
  );
}
