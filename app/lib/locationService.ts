import * as Location from "expo-location";
import { buildLocationLabelsFromGeocode } from "./locationFormat";

export type LocationCoordinates = {
  latitude: number;
  longitude: number;
};

export type ReverseGeocodeResult = {
  landmark: string;
  areaName: string;
  fullAddress: string;
};

/**
 * Request location permission from the user
 * @returns "granted" | "denied" | null
 */
export async function requestLocationPermission(): Promise<
  "granted" | "denied" | null
> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      return "granted";
    }
    return "denied";
  } catch (error) {
    console.error("Error requesting location permission:", error);
    return null;
  }
}

/**
 * Get current device location using GPS
 * Requires location permission to be granted first
 */
export async function getCurrentLocation(): Promise<LocationCoordinates | null> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
      const newStatus = await requestLocationPermission();
      if (newStatus !== "granted") {
        throw new Error("Location permission not granted");
      }
    }

    const currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    };
  } catch (error) {
    console.error("Error getting current location:", error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to address using Nominatim (OpenStreetMap)
 * No API key needed - Nominatim is open-source
 */
export async function reverseGeocodeNominatim(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();

    // Parse Nominatim response to our location format
    const address = data.address || {};
    const geolocation = {
      city: address.city || address.town || address.village || null,
      district: address.district || address.county || null,
      street: address.road || null,
      name: data.name || null,
      region: address.state || null,
      country: address.country || null,
      postalCode: address.postcode || null,
      streetNumber: address.house_number || null,
    };

    // Use existing location label builder to maintain consistency
    const labels = buildLocationLabelsFromGeocode(geolocation);

    return {
      landmark: labels.landmark,
      areaName: labels.areaName,
      fullAddress: labels.fullAddress,
    };
  } catch (error) {
    console.error("Error reverse geocoding with Nominatim:", error);
    // Return fallback with just coordinates
    return {
      landmark: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      areaName: `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
      fullAddress: `${latitude}, ${longitude}`,
    };
  }
}

/**
 * Combined: Get current location and reverse geocode it
 * Used for "Use my current location" button
 */
export async function getCurrentLocationWithAddress(): Promise<{
  coordinates: LocationCoordinates;
  geocode: ReverseGeocodeResult;
} | null> {
  try {
    const coords = await getCurrentLocation();
    if (!coords) return null;

    const geocode = await reverseGeocodeNominatim(
      coords.latitude,
      coords.longitude
    );
    if (!geocode) return null;

    return {
      coordinates: coords,
      geocode,
    };
  } catch (error) {
    console.error("Error in getCurrentLocationWithAddress:", error);
    return null;
  }
}
