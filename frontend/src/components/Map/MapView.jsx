import { useRef, useEffect } from "react";
import { useMapLibre } from "./useMapLibre.js";

/**
 * Full-bleed map panel. Owns the MapLibre DOM element and delegates all
 * imperative map work to the useMapLibre hook.
 *
 * Props:
 *   stops       – current stops array
 *   result      – optimize result (null when no route)
 *   onMapClick  – (lat, lng) → void
 *   onMarkerDragEnd – (id, lat, lng) → void
 */
export default function MapView({ stops, result, onMapClick, onMarkerDragEnd }) {
  const containerRef = useRef(null);

  const { syncMarkers, drawRoute, clearRoute, fitToStops } = useMapLibre(
    containerRef,
    { onMapClick, onMarkerDragEnd }
  );

  // Sync markers whenever stops or optimised order changes
  useEffect(() => {
    syncMarkers(stops, result?.order ?? null);
  }, [stops, result, syncMarkers]);

  // Draw / clear route when result changes
  useEffect(() => {
    if (result?.path?.length) {
      drawRoute(result.path);
    } else {
      clearRoute();
    }
  }, [result, drawRoute, clearRoute]);

  // When stops go from 0→1, fly to that location
  useEffect(() => {
    if (stops.length === 1) fitToStops(stops);
  }, [stops.length, stops, fitToStops]);

  return (
    <div className="map-area">
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Overlay hint when map is empty */}
      {stops.length === 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(11,17,32,0.85)",
            border: "1px solid var(--border)",
            backdropFilter: "blur(8px)",
            color: "var(--text-muted)",
            fontSize: 13,
            padding: "10px 18px",
            borderRadius: 10,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          🗺️ Click anywhere on the map to add a stop
        </div>
      )}
    </div>
  );
}
