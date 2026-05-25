import { useRouter } from "expo-router";
import * as Location from "expo-location";
import {
  ArrowLeft,
  Clock,
  Filter,
  Heart,
  MapPin,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  DonationRecord,
  fetchAvailableDonationsDetached,
  fetchBrowseDonationsDetached,
} from "../../store/donationStore";

interface DonationFeedProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

export default function DonationFeed({ onNavigate, onBack }: DonationFeedProps) {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [requests, setRequests] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status === "granted") {
        const pos = await Location.getCurrentPositionAsync({});
        const result = await fetchBrowseDonationsDetached(
          pos.coords.latitude,
          pos.coords.longitude,
          50
        );
        setRequests(result);
      } else {
        const fallback = await fetchAvailableDonationsDetached();
        setRequests(fallback);
      }
    } catch (error) {
      console.error("Failed to load donation requests:", error);
      try {
        const fallback = await fetchAvailableDonationsDetached();
        setRequests(fallback);
      } catch (fallbackError) {
        console.error("Fallback donation fetch failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const getUrgencyStyle = (urgency: string) => {
    switch (urgency) {
      case "high":
        return styles.urgentHigh;
      case "medium":
        return styles.urgentMedium;
      default:
        return styles.urgentLow;
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "Food":
        return styles.typeFood;
      case "Clothes":
        return styles.typeClothes;
      case "Blood":
        return styles.typeBlood;
      case "Financial":
        return styles.typeFinancial;
      default:
        return styles.typeDefault;
    }
  };

  const filteredRequests = requests.filter(
    (req) =>
      selectedFilter === "all" ||
      req.type === selectedFilter.toLowerCase()
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Nearby Requests</Text>
            <Text style={styles.headerSubtitle}>
              Based on your location
            </Text>
          </View>

          <TouchableOpacity>
            <Filter color="white" size={24} />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          {["all", "Food", "Clothes", "Blood", "Financial"].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Feed */}
      <ScrollView contentContainerStyle={styles.feed}>
        {loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading requests...</Text>
          </View>
        )}

        {!loading && filteredRequests.map((request) => {
          const type = request.type.charAt(0).toUpperCase() + request.type.slice(1);
          const distance =
            typeof request.distanceKm === "number"
              ? `${request.distanceKm.toFixed(1)} km`
              : "";
          const postedAtMs = request.postedAtIso
            ? new Date(request.postedAtIso).getTime()
            : 0;
          const diffMinutes = postedAtMs
            ? Math.max(1, Math.floor((Date.now() - postedAtMs) / 60000))
            : 0;
          const timeAgo = !postedAtMs
            ? ""
            : diffMinutes < 60
            ? `${diffMinutes} min ago`
            : `${Math.floor(diffMinutes / 60)} hour${Math.floor(diffMinutes / 60) === 1 ? "" : "s"} ago`;
          const urgency =
            request.status === "pending"
              ? "high"
              : request.status === "in-progress"
              ? "medium"
              : "low";

          return (
            <TouchableOpacity
              key={request.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => {
                router.push({
                  pathname: "/post",
                  params: {
                    type: request.type,
                    title: request.title,
                    description: request.shortDescription || "",
                    location: request.location,
                    timeAgo,
                    urgency,
                  },
                });
              }}
            >
              {/* Badges */}
              <View style={styles.badgeRow}>
                <View style={[styles.badge, getTypeStyle(type)]}>
                  <Text style={styles.badgeText}>{type}</Text>
                </View>

                <View style={[styles.badge, getUrgencyStyle(urgency)]}>
                  <Text style={styles.badgeText}>
                    {urgency === "high"
                      ? "Urgent"
                      : urgency === "medium"
                      ? "Medium"
                      : "Low"}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{request.title}</Text>
              <Text style={styles.cardDesc}>{request.shortDescription || ""}</Text>
              <Text style={styles.cardRequester}>
                by {request.recipientName}
              </Text>

              {/* Location + Time */}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MapPin size={14} color="#6B7280" />
                  <Text style={styles.metaText}>
                    {distance ? `${request.location} - ${distance}` : request.location}
                  </Text>
                </View>

                <View style={styles.metaItem}>
                  <Clock size={14} color="#6B7280" />
                  <Text style={styles.metaText}>
                    {timeAgo}
                  </Text>
                </View>
              </View>

              {/* Action */}
              <TouchableOpacity
                style={styles.helpButton}
                onPress={() =>
                  onNavigate(`donation-details-${request.id}`)
                }
              >
                <Heart size={16} color="white" />
                <Text style={styles.helpButtonText}>Help Now</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}

        {!loading && filteredRequests.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No requests found in this category
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E4A61",
  },

  header: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#1A5F7A",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },

  filterRow: {
    marginTop: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "white",
  },
  filterText: {
    color: "white",
    fontSize: 13,
  },
  filterTextActive: {
    color: "#1A5F7A",
  },

  feed: {
    padding: 20,
    paddingBottom: 100,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },

  typeFood: { backgroundColor: "#DCFCE7" },
  typeClothes: { backgroundColor: "#F3E8FF" },
  typeBlood: { backgroundColor: "#FEE2E2" },
  typeFinancial: { backgroundColor: "#DBEAFE" },
  typeDefault: { backgroundColor: "#E5E7EB" },

  urgentHigh: { backgroundColor: "#EF4444" },
  urgentMedium: { backgroundColor: "#F59E0B" },
  urgentLow: { backgroundColor: "#3B82F6" },

  cardTitle: {
    color: "#1A5F7A",
    fontSize: 16,
    marginBottom: 4,
  },
  cardDesc: {
    color: "#4B5563",
    fontSize: 13,
    marginBottom: 6,
  },
  cardRequester: {
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 10,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
  },

  helpButton: {
    backgroundColor: "#1A5F7A",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  helpButtonText: {
    color: "white",
    fontSize: 14,
  },

  emptyState: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "white",
  },
});
