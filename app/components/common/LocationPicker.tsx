import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function LocationPicker({ onLocationSelect }) {
  const [region, setRegion] = useState(null);
  const [marker, setMarker] = useState(null);
  const [landmark, setLandmark] = useState("");

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      let loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  const handlePress = async (e) => {
    const coords = e.nativeEvent.coordinate;
    setMarker(coords);

    // 🔥 Reverse Geocoding (get landmark)
    const res = await Location.reverseGeocodeAsync(coords);
    if (res.length > 0) {
      const place = res[0];
      const name =
        place.name || place.street || place.city || "Unknown area";
      setLandmark(name);

      onLocationSelect({
        latitude: coords.latitude,
        longitude: coords.longitude,
        landmark: name,
      });
    }
  };

  if (!region) return <Text>Loading map...</Text>;

  return (
    <View>
      <MapView
        style={{ width: "100%", height: 300 }}
        region={region}
        onPress={handlePress}
      >
        {marker && <Marker coordinate={marker} />}
      </MapView>

      <Text>Selected Landmark: {landmark}</Text>
    </View>
  );
}