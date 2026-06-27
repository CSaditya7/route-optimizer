import { useRef } from "react";
import toast from "react-hot-toast";

/**
 * Props:
 *   stops       – current stops (for export)
 *   result      – optimize result (for export)
 *   onLoadStops – (parsedStops[]) → void
 */
export default function ImportExport({ stops, result, onLoadStops }) {
  const fileRef = useRef(null);

  // ── CSV import ────────────────────────────────────────────────────────────
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.trim().split(/\r?\n/);
        // Expect header: lat,lng[,label]
        const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
        const latIdx = header.indexOf("lat");
        const lngIdx = header.indexOf("lng");

        if (latIdx === -1 || lngIdx === -1) {
          throw new Error("CSV must have 'lat' and 'lng' columns.");
        }

        const labelIdx = header.indexOf("label");
        const parsed = lines.slice(1).map((line) => {
          const cols = line.split(",").map((c) => c.trim());
          const lat = parseFloat(cols[latIdx]);
          const lng = parseFloat(cols[lngIdx]);
          if (isNaN(lat) || isNaN(lng)) throw new Error(`Invalid row: ${line}`);
          return { lat, lng, label: labelIdx >= 0 ? cols[labelIdx] : undefined };
        });

        if (parsed.length < 2) throw new Error("Need at least 2 stops.");
        onLoadStops(parsed);
        toast.success(`Imported ${parsed.length} stops.`);
      } catch (err) {
        toast.error(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    // Reset so same file can be re-imported
    e.target.value = "";
  }

  // ── CSV export ────────────────────────────────────────────────────────────
  function handleExport() {
    if (!stops.length) return toast.error("No stops to export.");

    const orderMap = {};
    if (result?.order) {
      result.order.forEach((origIdx, visitPos) => {
        orderMap[origIdx] = visitPos;
      });
    }

    const rows = [["lat", "lng", "label", "visit_order", "role"]];
    stops.forEach((s, idx) => {
      rows.push([
        s.lat.toFixed(6),
        s.lng.toFixed(6),
        s.label || (idx === 0 ? "Depot" : `Stop ${idx}`),
        orderMap[idx] ?? "",
        idx === 0 ? "depot" : "stop",
      ]);
    });

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `route-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Route exported as CSV.");
  }

  return (
    <div className="card row" style={{ gap: 8 }}>
      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <button
        className="btn-secondary grow"
        style={{ fontSize: 12.5 }}
        onClick={() => fileRef.current?.click()}
        title="Import stops from a CSV with lat,lng columns"
      >
        📥 Import CSV
      </button>
      <button
        className="btn-secondary grow"
        style={{ fontSize: 12.5 }}
        onClick={handleExport}
        disabled={!stops.length}
        title="Export current stops and optimised order to CSV"
      >
        📤 Export
      </button>
    </div>
  );
}
