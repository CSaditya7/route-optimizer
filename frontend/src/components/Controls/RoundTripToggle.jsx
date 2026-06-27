/**
 * Props:
 *   value    – boolean
 *   onChange – (bool) → void
 */
export default function RoundTripToggle({ value, onChange }) {
  return (
    <label className="toggle-wrap" onClick={() => onChange(!value)}>
      <div className={`toggle-track ${value ? "on" : ""}`}>
        <div className="toggle-thumb" />
      </div>
      <span>Round trip <span style={{ color: "var(--text-dim)", fontSize: 11 }}>(return to depot)</span></span>
    </label>
  );
}
