
export type GeocodeLocation = {
  city?: string | null;
  district?: string | null;
  street?: string | null;
  name?: string | null;
  region?: string | null;
  country?: string | null;
  postalCode?: string | null;
  streetNumber?: string | null;
};

export function buildLocationLabelsFromGeocode(place: GeocodeLocation) {
  // Build landmark (closest street/intersection name)
  const landmark =
    place.name ||
    place.street ||
    place.district ||
    place.city ||
    "Current Location";

  // Build area name (broader area)
  const areaName = [place.city, place.district, place.region]
    .filter(Boolean)
    .join(", ");

  // Build full address
  const fullAddress = [
    place.streetNumber ? `${place.streetNumber} ${place.street}` : place.street,
    place.district,
    place.city,
    place.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    landmark,
    areaName: areaName || landmark,
    fullAddress: fullAddress || landmark,
  };
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Haversine formula to calculate distance in km
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
