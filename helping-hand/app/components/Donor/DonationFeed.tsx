import {
    ArrowLeft,
    Clock,
    Filter,
    Heart,
    MapPin,
} from "lucide-react-native";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface DonationFeedProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

const mockRequests = [
  {
    id: "1",
    type: "Food",
    title: "Food for 20 homeless families",
    description: "Need non-perishable food items and fresh produce",
    location: "Downtown Shelter",
    distance: "2.3 km",
    timeAgo: "5 min ago",
    urgency: "high",
    requester: "Hope Foundation",
  },
  {
    id: "2",
    type: "Clothes",
    title: "Winter clothes for children",
    description: "Collecting warm clothes, jackets, and blankets",
    location: "Community Center",
    distance: "3.5 km",
    timeAgo: "1 hour ago",
    urgency: "medium",
    requester: "Kids Care NGO",
  },
  {
    id: "3",
    type: "Blood",
    title: "O+ Blood urgently needed",
    description: "Patient undergoing emergency surgery",
    location: "City Hospital",
    distance: "1.2 km",
    timeAgo: "10 min ago",
    urgency: "high",
    requester: "City Hospital",
  },
  {
    id: "4",
    type: "Financial",
    title: "Education fund for orphans",
    description: "Help 15 children continue their studies",
    location: "Bright Future Orphanage",
    distance: "5.8 km",
    timeAgo: "3 hours ago",
    urgency: "low",
    requester: "Bright Future Trust",
  },
];

export default function DonationFeed({ onNavigate, onBack }: DonationFeedProps) {
  const [selectedFilter, setSelectedFilter] = useState("all");

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

  const filteredRequests = mockRequests.filter(
    (req) => selectedFilter === "all" || req.type === selectedFilter
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
        {filteredRequests.map((request) => (
          <TouchableOpacity
            key={request.id}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() =>
              onNavigate(`donation-details-${request.id}`)
            }
          >
            {/* Badges */}
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
            <Text style={styles.cardRequester}>
              by {request.requester}
            </Text>

            {/* Location + Time */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MapPin size={14} color="#6B7280" />
                <Text style={styles.metaText}>
                  {request.location} • {request.distance}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Clock size={14} color="#6B7280" />
                <Text style={styles.metaText}>
                  {request.timeAgo}
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
        ))}

        {filteredRequests.length === 0 && (
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
