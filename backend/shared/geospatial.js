/**
 * Shared geospatial utility functions for location-based queries
 * Used by donations and requests modules
 */

const DEFAULT_BROWSE_RADIUS_KM = 50;

/**
 * Convert radians to degrees for distance calculation
 */
function toRadians(value) {
  return (value * Math.PI) / 180;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistanceKm(fromLat, fromLng, toLat, toLng) {
  const earthRadiusKm = 6371;
  const latDistance = toRadians(toLat - fromLat);
  const lngDistance = toRadians(toLng - fromLng);

  const a =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(lngDistance / 2) *
      Math.sin(lngDistance / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

/**
 * Convert location object with {lat, lng} to GeoJSON Point format
 * GeoJSON requires [longitude, latitude] order (reversed from typical lat/lng)
 * Returns undefined if coordinates are invalid
 */
function setLocationGeoFromBody(location) {
  if (!location || !location.coordinates) return undefined;
  
  const lat = location.coordinates.lat;
  const lng = location.coordinates.lng;
  
  if (typeof lat !== "number" || typeof lng !== "number") return undefined;
  if (Number.isNaN(lat) || Number.isNaN(lng)) return undefined;
  
  return {
    type: "Point",
    coordinates: [lng, lat],  // GeoJSON: [longitude, latitude]
  };
}

module.exports = {
  DEFAULT_BROWSE_RADIUS_KM,
  calculateDistanceKm,
  setLocationGeoFromBody,
  toRadians,
};
