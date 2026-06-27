/**
 * Props:
 *   value    – number (1-5)
 *   onChange – (number) → void
 */
export default function VehicleSelector({ value, onChange }) {
  return (
    <div className="row" style={{ fontSize: 13, color: "var(--text-muted)" }}>
      <span style={{ flexShrink: 0 }}>Vehicles</span>
      <div className="row ml-auto" style={{ gap: 4 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{
              width: 30,
              height: 30,
              borderRadius: "var(--radius-sm)",
              background: value === n ? "var(--accent)" : "var(--panel)",
              color: value === n ? "#04141f" : "var(--text-muted)",
              border: `1px solid ${value === n ? "var(--accent)" : "var(--border)"}`,
              fontWeight: value === n ? 700 : 400,
              fontSize: 13,
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
