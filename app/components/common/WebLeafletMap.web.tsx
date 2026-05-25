import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

type Coordinate = {
  latitude: number;
  longitude: number;
};

type Region = {
  latitude: number;
  longitude: number;
};

type Props = {
  region: Region;
  selectedLocation: Coordinate | null;
  onSelectLocation: (location: Coordinate) => void;
  onRegionChange: (region: Region) => void;
};

export default function WebLeafletMap({
  region,
  selectedLocation,
  onSelectLocation,
  onRegionChange,
}: Props) {
  const [cssLoaded, setCssLoaded] = useState(false);
  const [leaflet, setLeaflet] = useState<any>(null);
  const [reactLeaflet, setReactLeaflet] = useState<any>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const styleId = "leaflet-runtime-css";
    const existing = document.getElementById(styleId);

    if (!existing) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = '@import url("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");';
      document.head.appendChild(style);
    }

    setCssLoaded(true);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadModules = async () => {
      const L = await import("leaflet");
      const RL = await import("react-leaflet");

      delete (L.default.Icon.Default.prototype as any)._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
        iconUrl: require("leaflet/dist/images/marker-icon.png"),
        shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
      });

      if (mounted) {
        setLeaflet(L.default);
        setReactLeaflet(RL);
      }
    };

    loadModules();

    return () => {
      mounted = false;
    };
  }, []);

  const markerPosition = useMemo(
    () => selectedLocation ?? { latitude: region.latitude, longitude: region.longitude },
    [selectedLocation, region.latitude, region.longitude]
  );

  if (!cssLoaded || !leaflet || !reactLeaflet) {
    return <View style={styles.mapContainer} />;
  }

  const { MapContainer, Marker, TileLayer, useMap, useMapEvents } = reactLeaflet;

  function MapClickHandler() {
    useMapEvents({
      click(event: any) {
        const location = {
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
        };
        onSelectLocation(location);
        onRegionChange(location);
      },
      moveend(event: any) {
        const center = event.target.getCenter();
        onRegionChange({
          latitude: center.lat,
          longitude: center.lng,
        });
      },
    });

    return null;
  }

  function RecenterMap() {
    const map = useMap();

    useEffect(() => {
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 100);

      return () => clearTimeout(timer);
    }, [map]);

    useEffect(() => {
      map.setView([region.latitude, region.longitude]);
    }, [map, region.latitude, region.longitude]);

    return null;
  }

  return (
    <View style={styles.mapContainer}>
      <MapContainer
        center={[region.latitude, region.longitude]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <MapClickHandler />
        <RecenterMap />
        <Marker
          position={[markerPosition.latitude, markerPosition.longitude]}
          draggable={true}
          eventHandlers={{
            dragend: (event: any) => {
              const point = event.target.getLatLng();
              const location = { latitude: point.lat, longitude: point.lng };
              onSelectLocation(location);
              onRegionChange(location);
            },
          }}
        />
      </MapContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    height: "100%",
    minHeight: 300,
  },
  leafletMap: {
    height: "100%",
    width: "100%",
  } as any,
});
