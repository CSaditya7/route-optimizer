import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import { createMarkerEl } from "./markers.js";

const STYLE_URL =
  "https://tiles.openfreemap.org/styles/liberty";
  // Free OpenStreetMap vector tile style — no API key required.
  // Alternative: "https://demotiles.maplibre.org/style.json" (grayscale)

/**
 * Initialises a MapLibre GL map and exposes imperative helpers for:
 *   - adding / removing / updating draggable markers
 *   - drawing / clearing the optimised route polyline
 *   - fitting the map to the current stops
 *
 * @param {React.RefObject<HTMLDivElement>} containerRef
 * @param {{ onMapClick, onMarkerDragEnd }} callbacks
 */
export function useMapLibre(containerRef, { onMapClick, onMarkerDragEnd }) {
  const mapRef     = useRef(null);
  const markersRef = useRef({}); // id → maplibregl.Marker

  // ── Initialise map ────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [77.209, 28.6139], // default: Delhi; recentres on first click
      zoom: 11,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right"
    );
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
        showUserHeading: false,
      }),
      "top-right"
    );

    map.on("load", () => {
      // Route line source & layer (initially empty)
      map.addSource("route", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Glow / halo layer (drawn first, wider)
      map.addLayer({
        id: "route-glow",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#22c55e",
          "line-width": 10,
          "line-opacity": 0.25,
        },
      });

      // Main route line
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#22c55e",
          "line-width": 4,
          "line-opacity": 0.9,
        },
      });
    });

    // Click to add stop
    map.on("click", (e) => {
      onMapClick(e.lngLat.lat, e.lngLat.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync markers with stops array ─────────────────────────────────────────
  const syncMarkers = useCallback(
    (stops, routeOrder) => {
      const map = mapRef.current;
      if (!map) return;

      const currentIds = new Set(Object.keys(markersRef.current).map(Number));
      const newIds     = new Set(stops.map((s) => s.id));

      // Remove markers for deleted stops
      for (const id of currentIds) {
        if (!newIds.has(id)) {
          markersRef.current[id].remove();
          delete markersRef.current[id];
        }
      }

      // Add / update markers
      stops.forEach((stop, idx) => {
        const isDepot   = idx === 0;
        const visitPos  = routeOrder ? routeOrder.indexOf(idx) : -1;
        const label     = isDepot ? "D" : visitPos >= 0 ? visitPos : idx;
        const type      = isDepot ? "depot" : routeOrder ? "optimized" : "stop";

        if (markersRef.current[stop.id]) {
          // Update position
          markersRef.current[stop.id].setLngLat([stop.lng, stop.lat]);
          // Update appearance
          const el = markersRef.current[stop.id].getElement();
          const newEl = createMarkerEl(label, type);
          el.style.cssText = newEl.style.cssText;
          el.textContent = newEl.textContent;
        } else {
          // Create new marker
          const el = createMarkerEl(label, type);
          const marker = new maplibregl.Marker({
            element: el,
            draggable: true,
            anchor: "center",
          })
            .setLngLat([stop.lng, stop.lat])
            .addTo(map);

          marker.on("dragend", () => {
            const { lat, lng } = marker.getLngLat();
            onMarkerDragEnd(stop.id, lat, lng);
          });

          markersRef.current[stop.id] = marker;
        }
      });
    },
    [onMarkerDragEnd]
  );

  // ── Draw optimised route polyline ─────────────────────────────────────────
  const drawRoute = useCallback((path) => {
    const map = mapRef.current;
    if (!map || !map.getSource("route")) return;

    const geojson = {
      type: "Feature",
      geometry: {
        type: "LineString",
        // path is [[lat,lng]…] from backend — MapLibre needs [lng,lat]
        coordinates: path.map(([lat, lng]) => [lng, lat]),
      },
    };
    map.getSource("route").setData(geojson);

    // Fit map to route bounds with padding
    const coords = geojson.geometry.coordinates;
    if (coords.length > 1) {
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 900 });
    }
  }, []);

  // ── Clear route ───────────────────────────────────────────────────────────
  const clearRoute = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.getSource("route")) return;
    map.getSource("route").setData({ type: "FeatureCollection", features: [] });
  }, []);

  // ── Fit map to all markers ────────────────────────────────────────────────
  const fitToStops = useCallback((stops) => {
    const map = mapRef.current;
    if (!map || !stops.length) return;
    if (stops.length === 1) {
      map.flyTo({ center: [stops[0].lng, stops[0].lat], zoom: 13 });
      return;
    }
    const bounds = stops.reduce(
      (b, s) => b.extend([s.lng, s.lat]),
      new maplibregl.LngLatBounds([stops[0].lng, stops[0].lat], [stops[0].lng, stops[0].lat])
    );
    map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 600 });
  }, []);

  return { syncMarkers, drawRoute, clearRoute, fitToStops };
}
