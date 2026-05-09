import type * as Location from "expo-location";

/** Full address for internal / donor use only (not shown to recipients). */
export function fullAddressFromGeocode(
  place: Location.LocationGeocodedAddress | null | undefined
): string {
  if (!place) return "";
  return [
    place.streetNumber,
    place.street,
    place.district,
    place.city,
    place.region,
    place.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export type LocationLabels = {
  /** Short label safe for recipients (e.g. POI, street block, neighborhood). */
  landmark: string;
  /** Broader area (district / city) — stored in DB; recipients typically only see `landmark` + distance. */
  areaName: string;
  fullAddress: string;
};

/**
 * Derive landmark + area from reverse-geocode (Expo / platform geocoding).
 * Coordinates are saved separately; this only fills human-readable fields.
 */
export function buildLocationLabelsFromGeocode(
  place: Location.LocationGeocodedAddress | null | undefined
): LocationLabels {
  if (!place) {
    return { landmark: "Selected area", areaName: "", fullAddress: "" };
  }

  const fullAddress = fullAddressFromGeocode(place);

  const areaParts = [place.district, place.subregion, place.city, place.region].filter(
    Boolean
  ) as string[];
  const areaName = [...new Set(areaParts)].slice(0, 3).join(", ") || "";

  let landmark = "";
  if (place.name && place.name !== place.street && place.name !== place.district) {
    landmark = place.name;
  } else if (place.street) {
    landmark = [place.street, place.district || place.city].filter(Boolean).join(", ");
  } else {
    landmark = areaName || place.region || "Selected area";
  }

  landmark = landmark.trim() || areaName || "Selected area";

  return { landmark, areaName: areaName || landmark, fullAddress };
}

/** @deprecated use buildLocationLabelsFromGeocode */
export function landmarkFromGeocode(
  place: Location.LocationGeocodedAddress | null | undefined
): string {
  return buildLocationLabelsFromGeocode(place).landmark;
}
