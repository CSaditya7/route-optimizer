/**
 * Props:
 *   onClick    – () → void
 *   loading    – bool
 *   disabled   – bool
 *   stopCount  – number (shown in label)
 */
export default function OptimizeButton({ onClick, loading, disabled, stopCount }) {
  return (
    <button
      className="btn-primary row"
      style={{ justifyContent: "center", gap: 10, position: "relative" }}
      onClick={onClick}
      disabled={disabled}
    >
      {loading ? (
        <>
          <span className="spinner" style={{ borderTopColor: "#04141f" }} />
          Optimising route…
        </>
      ) : (
        <>
          ⚡ Optimize {stopCount > 2 ? `${stopCount} stops` : "route"}
        </>
      )}
    </button>
  );
}
