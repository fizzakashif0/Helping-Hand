import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getCurrentLocationWithAddress } from "../../lib/locationService";
import MapLocationPickerModal, { MapPickedLocation } from "./MapLocationPickerModal";

export type SelectedPickupLocation = {
  latitude: number;
  longitude: number;
  landmark: string;
  areaName: string;
  fullAddress: string;
};

type Props = {
  onLocationSelect: (loc: SelectedPickupLocation | null) => void;
};

export default function LocationPicker({ onLocationSelect }: Props) {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<SelectedPickupLocation | null>(null);
  const [error, setError] = useState("");
  const [mapOpen, setMapOpen] = useState(false);

  const applySelection = (loc: SelectedPickupLocation) => {
    setLocation(loc);
    onLocationSelect(loc);
  };

  const requestLocation = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getCurrentLocationWithAddress();
      if (!result) {
        setError("Failed to get location. Check permissions.");
        setLoading(false);
        return;
      }
      applySelection({
        latitude: result.coordinates.latitude,
        longitude: result.coordinates.longitude,
        landmark: result.geocode.landmark,
        areaName: result.geocode.areaName,
        fullAddress: result.geocode.fullAddress,
      });
    } catch (err) {
      setError("Failed to get location");
      console.error("Location error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapLocationPickerModal
        visible={mapOpen}
        onClose={() => setMapOpen(false)}
        onConfirm={applySelection}
        initialLatitude={location?.latitude}
        initialLongitude={location?.longitude}
      />

      <TouchableOpacity style={styles.button} onPress={() => setMapOpen(true)}>
        <Ionicons name="map" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Select location</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={requestLocation}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#1A5F7A" />
        ) : (
          <>
            <Ionicons name="locate" size={18} color="#1A5F7A" style={{ marginRight: 8 }} />
            <Text style={styles.secondaryButtonText}>Use my current location</Text>
          </>
        )}
      </TouchableOpacity>

      {location && (
        <View style={styles.locationInfo}>
          <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.locationLabel}>Recipients see: landmark + distance only</Text>
            <Text style={styles.locationAddress}>{location.landmark}</Text>
            {location.areaName && location.areaName !== location.landmark && (
              <Text style={styles.areaLine} numberOfLines={2}>
                Area: {location.areaName}
              </Text>
            )}
            {location.fullAddress && location.fullAddress !== location.landmark && (
              <Text style={styles.internalNote} numberOfLines={2}>
                Internal detail: {location.fullAddress}
              </Text>
            )}
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
  container: { width: "100%" },
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
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#1A5F7A",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  secondaryButtonText: { color: "#1A5F7A", fontWeight: "600", fontSize: 14 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  locationInfo: {
    backgroundColor: "#ecfdf5",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationLabel: { fontSize: 11, color: "#047857", marginBottom: 2 },
  locationAddress: { color: "#1f2937", fontWeight: "600", fontSize: 13 },
  areaLine: { color: "#374151", fontSize: 12, marginTop: 4 },
  internalNote: { color: "#6b7280", fontSize: 11, marginTop: 4 },
  errorContainer: {
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: { color: "#dc2626", fontSize: 12, marginLeft: 8 },
});