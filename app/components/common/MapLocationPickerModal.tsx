import { MapPin, Search, X } from "lucide-react-native";
import { lazy, Suspense, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { reverseGeocodeNominatim } from "../../lib/locationService";

const WebLeafletMap = lazy(() => import("./WebLeafletMap.web"));

// Only import MapView on native platforms
let MapView: any = null;
let Marker: any = null;
let UrlTile: any = null;
let mapAvailable = false;

if (Platform.OS !== "web") {
  try {
    const maps = require("react-native-maps");
    MapView = maps.default;
    Marker = maps.Marker;
    UrlTile = maps.UrlTile;
    mapAvailable = true;
    console.log("react-native-maps loaded successfully", {
      MapViewExists: !!MapView,
      MarkerExists: !!Marker,
      UrlTileExists: !!UrlTile,
    });
  } catch (e) {
    console.error("react-native-maps import failed:", e);
    mapAvailable = false;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [region, setRegion] = useState({
    latitude: initialLatitude || 31.5204,
    longitude: initialLongitude || 74.3587,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (initialLatitude != null && initialLongitude != null) {
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

  const searchNominatim = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&limit=5`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchResultSelect = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    setSelectedLocation({ latitude: lat, longitude: lon });
    setRegion({
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
    setSearchResults([]);
    setSearchQuery("");
  };

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
        fullAddress: geocode?.fullAddress || "Unknown Location",
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
        fullAddress: "Unknown Location",
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

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search places, areas, streets..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              searchNominatim(text);
            }}
            placeholderTextColor="#999"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => {
              setSearchQuery("");
              setSearchResults([]);
            }}>
              <X size={20} color="#666" />
            </TouchableOpacity>
          ) : searching ? (
            <ActivityIndicator size="small" color="#666" />
          ) : null}
        </View>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <View style={styles.searchResultsContainer}>
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => `${item.place_id}_${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => handleSearchResultSelect(item)}
                >
                  <MapPin size={16} color="#1A5F7A" style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.searchResultName} numberOfLines={1}>
                      {item.name || item.display_name}
                    </Text>
                    <Text style={styles.searchResultDetails} numberOfLines={1}>
                      {item.display_name}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              scrollEnabled={false}
              nestedScrollEnabled={true}
            />
          </View>
        )}

        {/* Map or Fallback */}
        {(() => {
          const debugInfo = {
            mapAvailable,
            MapViewExists: !!MapView,
            UrlTileExists: !!UrlTile,
            platform: Platform.OS,
            platformCheck: Platform.OS !== "web",
          };
          console.log("MapPicker render check:", debugInfo);
          
          // Try to render map if MapView is available (don't require UrlTile)
          const shouldRenderMap = mapAvailable && MapView && Platform.OS !== "web";
          console.log(`shouldRenderMap: ${shouldRenderMap}`);

          if (Platform.OS === "web") {
            return (
              <Suspense fallback={<View style={styles.map} />}>
                <WebLeafletMap
                  region={region}
                  selectedLocation={selectedLocation}
                  onSelectLocation={setSelectedLocation}
                  onRegionChange={(next) =>
                    setRegion((prev) => ({
                      ...prev,
                      latitude: next.latitude,
                      longitude: next.longitude,
                    }))
                  }
                />
              </Suspense>
            );
          }
          
          if (shouldRenderMap) {
            try {
              return (
                <>
                  <MapView
                    style={styles.map}
                    region={region}
                    onRegionChange={setRegion}
                    onPress={handleMapPress}
                    zoomEnabled={true}
                    scrollEnabled={true}
                  >
                    {/* OpenStreetMap tiles layer */}
                    {UrlTile && (
                      <UrlTile
                        urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maximumZ={19}
                      />
                    )}
                    
                    {selectedLocation && (
                      <Marker
                        coordinate={{
                          latitude: selectedLocation.latitude,
                          longitude: selectedLocation.longitude,
                        }}
                        title="Selected Location"
                        description="Tap to move or drag marker"
                        draggable={true}
                        onDragEnd={(e:any) => {
                          const { latitude, longitude } = e.nativeEvent.coordinate;
                          setSelectedLocation({ latitude, longitude });
                        }}
                      />
                    )}
                  </MapView>

                  {/* Center Marker Icon */}
                  <View style={styles.centerMarker}>
                    <MapPin size={32} color="#1A5F7A" fill="#1A5F7A" />
                  </View>
                </>
              );
            } catch (renderError) {
              console.error("MapView render error:", renderError);
              // Fall through to fallback UI
            }
          }
          
          // Fallback UI
          return (
            <View style={[styles.map, styles.fallback]}>
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}>
                <MapPin size={48} color="#ccc" style={{ marginBottom: 16 }} />
                <Text style={styles.fallbackText}>Map Not Available</Text>
                
                {/* Debug Information */}
                <Text style={[styles.fallbackSubText, { marginTop: 16, fontSize: 12, fontFamily: 'monospace' }]}>
                  Debug Info:
                </Text>
                <Text style={[styles.fallbackSubText, { fontSize: 11, fontFamily: 'monospace' }]}>
                  Platform: {Platform.OS}
                </Text>
                <Text style={[styles.fallbackSubText, { fontSize: 11, fontFamily: 'monospace' }]}>
                  MapView: {MapView ? '✓ loaded' : '✗ not loaded'}
                </Text>
                <Text style={[styles.fallbackSubText, { fontSize: 11, fontFamily: 'monospace' }]}>
                  UrlTile: {UrlTile ? '✓ loaded' : '✗ not loaded'}
                </Text>
                <Text style={[styles.fallbackSubText, { fontSize: 11, fontFamily: 'monospace' }]}>
                  mapAvailable: {mapAvailable ? 'true' : 'false'}
                </Text>
                
                {/* Helpful Messages */}
                {!mapAvailable && (
                  <>
                    <Text style={[styles.fallbackSubText, { marginTop: 16, fontWeight: '600' }]}>
                      ⚠️ react-native-maps failed to load
                    </Text>
                    <Text style={styles.fallbackSubText}>
                      Check console for error details
                    </Text>
                  </>
                )}
                
                {mapAvailable && !MapView && (
                  <>
                    <Text style={[styles.fallbackSubText, { marginTop: 16, fontWeight: '600' }]}>
                      ⚠️ MapView import failed
                    </Text>
                    <Text style={styles.fallbackSubText}>
                      Module loaded but MapView not found
                    </Text>
                  </>
                )}
                
                {Platform.OS === "windows" && (
                  <>
                    <Text style={[styles.fallbackSubText, { marginTop: 16, fontWeight: '600' }]}>
                      ⚠️ Web platform detected
                    </Text>
                    <Text style={styles.fallbackSubText}>
                      Maps only work on native (iOS/Android)
                    </Text>
                  </>
                )}
                
                {/* General Instructions */}
                <Text style={[styles.fallbackSubText, { marginTop: 16 }]}>
                  Use the search bar above to find a location
                </Text>
                <Text style={styles.fallbackSubText}>
                  or manually enter coordinates
                </Text>
                {searchResults.length === 0 && searchQuery ? (
                  <Text style={styles.fallbackSubText}>
                    Searching "{searchQuery}"...
                  </Text>
                ) : null}
              </ScrollView>
            </View>
          );
        })()}

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
  searchContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
  },
  searchResultsContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A5F7A",
  },
  searchResultDetails: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
});
