import StopCard from "./StopCard.jsx";

/**
 * Props:
 *   stops    – current stops array
 *   result   – optimize result (for visit-position badges)
 *   onRemove – (id) → void
 */
export default function StopList({ stops, result, onRemove }) {
  if (!stops.length) {
    return (
      <p style={{ fontSize: 12.5, color: "var(--text-dim)", textAlign: "center", padding: "12px 0" }}>
        No stops yet — click the map or add random ones.
      </p>
    );
  }

  // Build a map from original stop index → visit position in optimised order
  const visitPosMap = {};
  if (result?.order) {
    result.order.forEach((origIdx, visitPos) => {
      visitPosMap[origIdx] = visitPos;
    });
  }

  return (
    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
      {stops.map((stop, idx) => (
        <StopCard
          key={stop.id}
          stop={stop}
          index={idx}
          visitPos={result ? visitPosMap[idx] ?? null : null}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}
