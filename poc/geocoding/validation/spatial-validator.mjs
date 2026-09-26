export const DISTANCE_BANDS_METERS = Object.freeze({
  rooftop: 30,
  building: 50,
  street: 150,
  locality: 1000,
  municipality: 5000
});

const EARTH_RADIUS_METERS = 6371008.8;

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

export function haversineDistanceMeters(a, b) {
  if (!a || !b) return null;
  const lat1 = Number(a.latitude);
  const lon1 = Number(a.longitude);
  const lat2 = Number(b.latitude);
  const lon2 = Number(b.longitude);

  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return null;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);

  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

export function classifyDistance(distanceMeters, bands = DISTANCE_BANDS_METERS) {
  if (!Number.isFinite(distanceMeters)) return "unknown";
  if (distanceMeters <= bands.rooftop) return "rooftop_or_nearby";
  if (distanceMeters <= bands.building) return "building_or_nearby";
  if (distanceMeters <= bands.street) return "street";
  if (distanceMeters <= bands.locality) return "locality";
  if (distanceMeters <= bands.municipality) return "municipality";
  return "province_or_worse";
}

export function validateSpatialMatch(reference, resultCoordinates, bands) {
  const distanceMeters = haversineDistanceMeters(reference, resultCoordinates);
  return {
    distance_meters: distanceMeters,
    distance_class: classifyDistance(distanceMeters, bands)
  };
}
