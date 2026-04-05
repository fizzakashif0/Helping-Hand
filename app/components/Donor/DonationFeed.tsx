import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Clock,
  Filter,
  Heart,
  MapPin,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RequestRecord, fetchNearbyRequests } from "../../store/requestStore";

interface DonationFeedProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

export default function DonationFeed({ onNavigate, onBack }: DonationFeedProps) {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [requests, setRequests] = useState<RequestRecord[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await fetchNearbyRequests(31.5497, 74.3436, 50);
      setRequests(data);
    } catch (error) {
      console.error("Failed to load nearby requests:", error);
    }
  };

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
      case "food":
        return styles.typeFood;
      case "clothes":
        return styles.typeClothes;
      case "blood":
        return styles.typeBlood;
      case "financial":
        return styles.typeFinancial;
      default:
        return styles.typeDefault;
    }
  };

  const filteredRequests = requests.filter(
    (request) => selectedFilter === "all" || request.type === selectedFilter
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>

          <View style={styles.flexOne}>
            <Text style={styles.headerTitle}>Nearby Requests</Text>
            <Text style={styles.headerSubtitle}>
              Based on a 50 km radius
            </Text>
          </View>

          <TouchableOpacity>
            <Filter color="white" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          {["all", "food", "clothes", "blood", "financial"].map((filter) => (
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

      <ScrollView contentContainerStyle={styles.feed}>
        {filteredRequests.map((request) => (
          <TouchableOpacity
            key={request.id}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => {
              router.push({
                pathname: "/post",
                params: {
                  requestId: request.id,
                  type: request.type,
                  title: request.title,
                  description: request.description,
                  location: request.location,
                  timeAgo: request.date,
                  urgency: request.urgency,
                },
              });
            }}
          >
            <View style={styles.badgeRow}>
              <View style={[styles.badge, getTypeStyle(request.type)]}>
                <Text style={styles.badgeText}>{request.type}</Text>
              </View>

              <View style={[styles.badge, getUrgencyStyle(request.urgency)]}>
                <Text style={styles.badgeText}>
                  {request.urgency === "high"
                    ? "Urgent"
                    : request.urgency === "medium"
                    ? "Medium"
                    : "Low"}
                </Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>{request.title}</Text>
            <Text style={styles.cardDesc}>{request.description}</Text>
            <Text style={styles.cardRequester}>by {request.requesterName}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MapPin size={14} color="#6B7280" />
                <Text style={styles.metaText}>
                  {request.location}
                  {request.distanceKm !== undefined ? ` • ${request.distanceKm} km` : ""}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Clock size={14} color="#6B7280" />
                <Text style={styles.metaText}>{request.date}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => onNavigate(`donation-details-${request.id}`)}
            >
              <Heart size={16} color="white" />
              <Text style={styles.helpButtonText}>Help Now</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {filteredRequests.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No nearby requests found</Text>
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
  flexOne: {
    flex: 1,
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
