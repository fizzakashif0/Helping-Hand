import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { timeAgo } from "../../lib/timeAgo";
import {
  DonationRecord,
  fetchAvailableDonationsDetached,
  fetchBrowseDonationsDetached,
} from "../../store/donationStore";

interface BrowseDonationsProps {
  onBack: () => void;
}

const typeEmoji: Record<string, string> = {
  food: "🍽️",
  clothes: "👕",
  blood: "🩸",
  financial: "💰",
};

function categoryMatches(selected: string, item: DonationRecord) {
  if (selected === "All") return true;
  if (selected === "Financial") return item.type === "financial";
  return selected.toLowerCase() === item.type;
}

export default function BrowseDonations({ onBack }: BrowseDonationsProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [list, setList] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [locNote, setLocNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLocNote("");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocNote("Location off — showing all available listings.");
        const all = await fetchAvailableDonationsDetached();
        setList(all);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const rows = await fetchBrowseDonationsDetached(
        pos.coords.latitude,
        pos.coords.longitude,
        50
      );
      setList(rows);
    } catch (e) {
      console.error(e);
      try {
        const all = await fetchAvailableDonationsDetached();
        setList(all);
      } catch {
        setList([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categories = ["All", "Food", "Clothes", "Financial", "Blood"];

  const filteredDonations = list.filter(
    (d) =>
      categoryMatches(selectedCategory, d) &&
      (d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.shortDescription || "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const typeLabel = (t: string) =>
    t === "financial" ? "Financial" : t.charAt(0).toUpperCase() + t.slice(1);

  const handleContactDonor = async (item: DonationRecord) => {
    try {
      const donorId =
        (item as any).donorId || (item as any).donor?._id || "000000000000000000000001";
      const recipientId = "000000000000000000000002";
      const donationId = item.id;

      const response = await fetch("http://localhost:5000/api/chat-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ donorId, recipientId, donationId }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Failed to send request");
      }

      Alert.alert("Success", "Request sent to donor");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to send request");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Browse Available Help</Text>
        <Text style={styles.subtitle}>Find donations near you</Text>
        {locNote ? <Text style={styles.locNote}>{locNote}</Text> : null}

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#ccc" />
          <TextInput
            placeholder="Search donations..."
            placeholderTextColor="#ccc"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Finding help near you…</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDonations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={styles.emptyList}>No donations match your filters.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/recipient-donation/${item.id}`)}
            >
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.badge,
                    item.type === "food"
                      ? styles.typeFood
                      : item.type === "clothes"
                      ? styles.typeClothes
                      : item.type === "blood"
                      ? styles.typeBlood
                      : styles.typeFinancial,
                  ]}
                >
                  <Text style={styles.badgeText}>{typeLabel(item.type)}</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.shortDescription || item.title}
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>{item.location}</Text>
                </View>

                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>
                    {timeAgo(item.postedAtIso || item.date)}
                  </Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <Text style={styles.distanceText}>
                  {item.distanceKm != null ? `${item.distanceKm.toFixed(1)} km away` : ""}
                </Text>
                <TouchableOpacity
                  style={styles.contactBtn}
                  onPress={() => handleContactDonor(item)}
                >
                  <Text style={styles.contactText}>Contact Donor</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.requestBtn}
                  onPress={() => router.push(`/recipient-donation/${item.id}`)}
                >
                  <Text style={styles.requestText}>Request</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E4A61",
  },
  header: {
    backgroundColor: "#1A5F7A",
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backText: {
    color: "#fff",
    marginLeft: 6,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  subtitle: {
    color: "#d0e4ee",
    marginBottom: 12,
  },
  locNote: {
    color: "#fde68a",
    fontSize: 12,
    marginBottom: 8,
  },
  searchBox: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  searchInput: {
    color: "#fff",
    marginLeft: 8,
    flex: 1,
  },
  categories: {
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginRight: 8,
  },
  categoryActive: {
    backgroundColor: "#fff",
  },
  categoryText: {
    color: "#fff",
  },
  categoryTextActive: {
    color: "#1A5F7A",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 3,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: "#374151",
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 10,
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
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
  },
  distanceText: {
    color: "#6B7280",
    fontSize: 12,
  },
  requestBtn: {
    backgroundColor: "#1A5F7A",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  requestText: {
    color: "#fff",
  },
  contactBtn: {
    backgroundColor: "#0F766E",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  contactText: {
    color: "#fff",
  },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
  },
  emptyList: {
    textAlign: "center",
    color: "#fff",
    marginTop: 24,
  },
  typeFood: { backgroundColor: "#22C55E" },
  typeClothes: { backgroundColor: "#3B82F6" },
  typeBlood: { backgroundColor: "#B91C1C" },
  typeFinancial: { backgroundColor: "#F59E0B" },
});
