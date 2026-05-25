import { MapPin, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { reverseGeocodeNominatim } from "../../lib/locationService";

// Only import MapView on native platforms
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== "web") {
  try {
    const maps = require("react-native-maps");
    MapView = maps.default;
    Marker = maps.Marker;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  } catch (e) {
    console.warn("react-native-maps not available");
  }
}

export type MapPickedLocation = {
  latitude: number;
  longitude: number;
  landmark: string;
  areaName: string;
  fullAddress: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (location: MapPickedLocation) => void;
  initialLatitude?: number;
  initialLongitude?: number;
};

export default function MapLocationPickerModal({
  visible,
  onClose,
  onConfirm,
  initialLatitude,
  initialLongitude,
}: Props) {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState({
    latitude: initialLatitude || 31.5204,
    longitude: initialLongitude || 74.3587,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (initialLatitude && initialLongitude) {
      setRegion({
        latitude: initialLatitude,
        longitude: initialLongitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setSelectedLocation({
        latitude: initialLatitude,
        longitude: initialLongitude,
      });
    }
  }, [initialLatitude, initialLongitude, visible]);

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleConfirm = async () => {
    if (!selectedLocation) return;

    setLoading(true);
    try {
      const geocode = await reverseGeocodeNominatim(
        selectedLocation.latitude,
        selectedLocation.longitude
      );

      const locationData: MapPickedLocation = {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        landmark: geocode?.landmark || "Selected Location",
        areaName: geocode?.areaName || "Selected Area",
        fullAddress: geocode?.fullAddress || `${selectedLocation.latitude}, ${selectedLocation.longitude}`,
      };

      onConfirm(locationData);
      onClose();
    } catch (error) {
      console.error("Error geocoding location:", error);
      // Still confirm even if geocoding fails
      const locationData: MapPickedLocation = {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        landmark: "Selected Location",
        areaName: "Selected Area",
        fullAddress: `${selectedLocation.latitude}, ${selectedLocation.longitude}`,
      };
      onConfirm(locationData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Location</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Map or Fallback */}
        {MapView && Platform.OS !== "web" ? (
          <>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              region={region}
              onRegionChange={setRegion}
              onPress={handleMapPress}
            >
              {selectedLocation && (
                <Marker
                  coordinate={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  }}
                  title="Selected Location"
                  description="Your pickup location"
                />
              )}
            </MapView>

            {/* Center Marker Icon */}
            <View style={styles.centerMarker}>
              <MapPin size={32} color="#1A5F7A" fill="#1A5F7A" />
            </View>
          </>
        ) : (
          <View style={[styles.map, styles.fallback]}>
            <Text style={styles.fallbackText}>Map not available</Text>
            <Text style={styles.fallbackSubText}>
              Using GPS location or manual entry
            </Text>
          </View>
        )}

        {/* Bottom Action Panel */}
        <View style={styles.actionPanel}>
          {selectedLocation && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>
                {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
              </Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!selectedLocation || loading) && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!selectedLocation || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Location</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#1A5F7A",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  map: {
    flex: 1,
  },
  centerMarker: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -16,
    marginTop: -32,
  },
  actionPanel: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  locationInfo: {
    backgroundColor: "#F0F0F0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  locationLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontFamily: "monospace",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#1A1A1A",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#1A5F7A",
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#CCC",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  fallback: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  fallbackText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  fallbackSubText: {
    fontSize: 14,
    color: "#666",
  },
});
