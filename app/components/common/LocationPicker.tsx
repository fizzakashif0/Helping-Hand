import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function LocationPicker({ onLocationSelect }) {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [error, setError] = useState("");

  const requestLocation = async () => {
    setLoading(true);
    setError("");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const coords = currentLocation.coords;

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      const address =
        reverseGeocode[0]?.name || reverseGeocode[0]?.street || "Current Location";

      const locationData = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        address,
      };

      setLocation(locationData);
      onLocationSelect(locationData);
    } catch (err) {
      setError("Failed to get location");
      console.error("Location error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={requestLocation}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="locate" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>
              {location ? "Update Location" : "Get My Location"}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {location && (
        <View style={styles.locationInfo}>
          <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.locationAddress}>{location.address}</Text>
            <Text style={styles.locationCoords}>
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          </View>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  button: {
    backgroundColor: "#1A5F7A",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  locationInfo: {
    backgroundColor: "#ecfdf5",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationAddress: {
    color: "#1f2937",
    fontWeight: "600",
    fontSize: 13,
  },
  locationCoords: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 2,
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    marginLeft: 8,
  },
});