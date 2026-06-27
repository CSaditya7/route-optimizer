/**
 * Decode a Google-encoded polyline string into an array of [lat, lng] pairs.
 *
 * Supports both precision-5 (standard) and precision-6 (OSRM default) encodings.
 *
 * @param {string} encoded  - encoded polyline string
 * @param {number} precision - 5 or 6 (default 6 for OSRM)
 * @returns {[number, number][]} array of [lat, lng]
 */
export function decodePolyline(encoded, precision = 6) {
  const factor = Math.pow(10, precision);
  const result = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result_bits = 0;
    let byte;

    // Decode latitude delta
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result_bits |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dlat = result_bits & 1 ? ~(result_bits >> 1) : result_bits >> 1;
    lat += dlat;

    // Reset for longitude
    shift = 0;
    result_bits = 0;

    // Decode longitude delta
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result_bits |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dlng = result_bits & 1 ? ~(result_bits >> 1) : result_bits >> 1;
    lng += dlng;

    result.push([lat / factor, lng / factor]);
  }

  return result;
}

/**
 * Compute the Haversine great-circle distance between two points (meters).
 * Used only as a fallback / sanity check — all real distances come from OSRM.
 *
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} distance in meters
 */
export function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6_371_000; // Earth radius in metres
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

/**
 * Format seconds into a human-readable string ("12 min", "1h 5m").
 * Shared between backend log output and tests.
 */
export function fmtDuration(seconds) {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

/**
 * Format meters into kilometres with one decimal place.
 */
export function fmtDistance(meters) {
  return `${(meters / 1000).toFixed(1)} km`;
}
