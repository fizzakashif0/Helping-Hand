import * as Location from "expo-location";

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

    // Extract Nominatim's detailed address components
    const address = data.address || {};
    const displayName = data.display_name || "";

    // Build readable landmark (closest named place)
    const landmark = 
      data.name ||
      address.road ||
      address.neighbourhood ||
      address.suburb ||
      address.city ||
      address.town ||
      address.village ||
      "Selected Location";

    // Build readable area name (neighborhood/suburb/city)
    const areaName = 
      address.neighbourhood ||
      address.suburb ||
      address.city ||
      address.town ||
      address.village ||
      address.district ||
      landmark;

    // Build full readable address from key Nominatim fields.
    const addressParts = [];
    
    if (address.road && address.house_number) {
      addressParts.push(`${address.house_number} ${address.road}`);
    } else if (address.road) {
      addressParts.push(address.road);
    }
    
    if (address.suburb) addressParts.push(address.suburb);
    if (address.neighbourhood && address.neighbourhood !== address.suburb) {
      addressParts.push(address.neighbourhood);
    }
    if (address.city) addressParts.push(address.city);
    else if (address.town) addressParts.push(address.town);
    else if (address.village) addressParts.push(address.village);
    
    if (address.postcode) addressParts.push(address.postcode);
    if (address.state) addressParts.push(address.state);

    const structuredAddress = addressParts.filter(Boolean).join(", ");
    const readableFallback = [
      address.road,
      address.suburb,
      address.city || address.town || address.village,
      address.state,
    ]
      .filter(Boolean)
      .join(", ");
    const fullAddress = displayName || structuredAddress || readableFallback || "Unknown Location";

    console.log("🌍 Nominatim Geocoding Result:", {
      landmark,
      areaName,
      fullAddress,
      displayName,
    });

    return {
      landmark,
      areaName,
      fullAddress,
    };
  } catch (error) {
    console.error("Error reverse geocoding with Nominatim:", error);
    // Return fallback with generic message, not coordinates
    return {
      landmark: "Selected Location",
      areaName: "Selected Area",
      fullAddress: "Unknown Location",
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
