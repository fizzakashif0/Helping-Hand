import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { buildLocationLabelsFromGeocode } from "../../lib/locationFormat";

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
  onConfirm: (loc: MapPickedLocation) => void;
  initialLatitude?: number;
  initialLongitude?: number;
};

function WebGeocodePicker({
  onConfirm,
  onClose,
}: {
  onConfirm: (loc: MapPickedLocation) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async () => {
    setError("");
    setLoading(true);
    try {
      const results = await Location.geocodeAsync(query.trim());
      if (!results?.length) {
        setError("No results. Try a broader area or landmark name.");
        return;
      }
      const r = results[0];
      const [place] = await Location.reverseGeocodeAsync({
        latitude: r.latitude,
        longitude: r.longitude,
      });
      const labels = buildLocationLabelsFromGeocode(place);
      onConfirm({
        latitude: r.latitude,
        longitude: r.longitude,
        landmark: labels.landmark,
        areaName: labels.areaName,
        fullAddress: labels.fullAddress || query.trim(),
      });
    } catch {
      setError("Could not find that location.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={webStyles.box}>
      <Text style={webStyles.hint}>
        Search for an area or landmark. Tap Save on device to store the exact point; recipients
        only see the landmark and distance.
      </Text>
      <TextInput
        style={webStyles.input}
        placeholder="e.g. Gulberg Lahore, near Liberty Market"
        value={query}
        onChangeText={setQuery}
      />
      {error ? <Text style={webStyles.err}>{error}</Text> : null}
      <View style={webStyles.row}>
        <TouchableOpacity style={webStyles.secondary} onPress={onClose}>
          <Text style={webStyles.secondaryText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={webStyles.primary} onPress={search} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={webStyles.primaryText}>Save location</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const webStyles = StyleSheet.create({
  box: { padding: 8 },
  hint: { fontSize: 13, color: "#4b5563", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  err: { color: "#b91c1c", marginBottom: 8, fontSize: 12 },
  row: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  secondary: { paddingVertical: 10, paddingHorizontal: 14 },
  secondaryText: { color: "#6b7280" },
  primary: {
    backgroundColor: "#1A5F7A",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  primaryText: { color: "#fff", fontWeight: "600" },
});

export default function MapLocationPickerModal({
  visible,
  onClose,
  onConfirm,
  initialLatitude,
  initialLongitude,
}: Props) {
  const mapRef = useRef<any>(null);
  const [lat, setLat] = useState(31.52);
  const [lng, setLng] = useState(74.35);
  const [loading, setLoading] = useState(false);
  const [MapViewCmp, setMapViewCmp] = useState<any>(null);
  const [MarkerCmp, setMarkerCmp] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;
    try {
      const maps = require("react-native-maps");
      setMapViewCmp(() => maps.default);
      setMarkerCmp(() => maps.Marker);
    } catch {
      setMapViewCmp(null);
    }
  }, []);

  useEffect(() => {
    if (initialLatitude != null && initialLongitude != null) {
      setLat(initialLatitude);
      setLng(initialLongitude);
    }
  }, [initialLatitude, initialLongitude, visible]);

  const animateTo = useCallback((latitude: number, longitude: number) => {
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      250
    );
  }, []);

  const confirmNative = useCallback(async () => {
    setLoading(true);
    try {
      const [place] = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      const labels = buildLocationLabelsFromGeocode(place);
      onConfirm({
        latitude: lat,
        longitude: lng,
        landmark: labels.landmark,
        areaName: labels.areaName,
        fullAddress: labels.fullAddress,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  }, [lat, lng, onClose, onConfirm]);

  const onWebConfirm = useCallback(
    (loc: MapPickedLocation) => {
      onConfirm(loc);
      onClose();
    },
    [onConfirm, onClose]
  );

  const setPin = (latitude: number, longitude: number) => {
    setLat(latitude);
    setLng(longitude);
    animateTo(latitude, longitude);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.wrap}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Ionicons name="close" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.title}>Select location</Text>
          <View style={{ width: 40 }} />
        </View>

        {Platform.OS === "web" || !MapViewCmp ? (
          <WebGeocodePicker onConfirm={onWebConfirm} onClose={onClose} />
        ) : (
          <>
            <MapViewCmp
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
              }}
              onPress={(e: any) => {
                const c = e.nativeEvent.coordinate;
                setPin(c.latitude, c.longitude);
              }}
            >
              {MarkerCmp ? (
                <MarkerCmp
                  coordinate={{ latitude: lat, longitude: lng }}
                  draggable
                  onDragEnd={(e: any) => {
                    const c = e.nativeEvent.coordinate;
                    setLat(c.latitude);
                    setLng(c.longitude);
                  }}
                />
              ) : null}
            </MapViewCmp>
            <Text style={styles.coords}>
              {lat.toFixed(5)}, {lng.toFixed(5)} · saved on confirm (private)
            </Text>
            <Text style={styles.help}>
              Tap the map or drag the pin, then Save. We store latitude & longitude and resolve
              landmark & area via geocoding. Recipients only see landmark and distance.
            </Text>
            <TouchableOpacity
              style={styles.confirm}
              onPress={confirmNative}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmText}>Save location</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#fff", paddingTop: 48 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  iconBtn: { padding: 8 },
  title: { fontSize: 16, fontWeight: "600", color: "#111" },
  map: { flex: 1, width: "100%" },
  coords: {
    paddingHorizontal: 16,
    paddingTop: 6,
    fontSize: 11,
    color: "#9ca3af",
  },
  help: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
    color: "#6b7280",
  },
  confirm: {
    margin: 16,
    backgroundColor: "#1A5F7A",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmText: { color: "#fff", fontWeight: "600" },
});
