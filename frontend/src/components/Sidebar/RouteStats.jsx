/**
 * Displays the optimisation result: totals, savings %, and a per-leg table.
 *
 * Props:
 *   result – the full JSON response from POST /api/optimize
 */
export default function RouteStats({ result }) {
  if (!result) return null;

  const { total_duration_s, total_distance_m, savings_pct, legs, num_stops } = result;

  const fmtTime = (s) => {
    const m = Math.round(s / 60);
    if (m < 60) return `${m} min`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  };
  const fmtDist = (m) => `${(m / 1000).toFixed(1)} km`;

  return (
    <div className="card col" style={{ gap: 10 }}>
      <div className="card-title">Optimised route</div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Stat label="Total time"     value={fmtTime(total_duration_s)} color="var(--accent)" />
        <Stat label="Total distance" value={fmtDist(total_distance_m)} color="var(--accent2)" />
        <Stat label="Stops"          value={num_stops}                  color="var(--text)" />
        <Stat label="Time saved"     value={`${savings_pct}%`}          color="var(--amber)" />
      </div>

      {/* Per-leg breakdown */}
      {legs?.length > 0 && (
        <>
          <div className="card-title" style={{ marginBottom: 0, marginTop: 4 }}>Legs</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ color: "var(--text-dim)" }}>
                  <th style={thStyle}>From → To</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Time</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Dist</th>
                </tr>
              </thead>
              <tbody>
                {legs.map((leg, i) => {
                  const fromLabel = leg.from === 0 ? "Depot" : `Stop ${leg.from}`;
                  const toLabel   = leg.to   === 0 ? "Depot" : `Stop ${leg.to}`;
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={tdStyle}>{fromLabel} → {toLabel}</td>
                      <td style={{ ...tdStyle, textAlign: "right", color: "var(--accent)" }}>
                        {fmtTime(leg.duration_s)}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right", color: "var(--accent2)" }}>
                        {fmtDist(leg.distance_m)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "8px 10px" }}>
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

const thStyle = { padding: "4px 6px", fontWeight: 600, textAlign: "left", borderBottom: "1px solid var(--border)" };
const tdStyle = { padding: "5px 6px", color: "var(--text-muted)" };
