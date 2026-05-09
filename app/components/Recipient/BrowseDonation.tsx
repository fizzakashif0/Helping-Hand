import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  fetchBrowseDonationsDetached,
  fetchAvailableDonationsDetached,
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

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1A5F7A" />
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
              <View style={styles.cardHeader}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
                ) : (
                  <Text style={styles.emoji}>{typeEmoji[item.type] || "📦"}</Text>
                )}

                <View style={{ flex: 1 }}>
                  <View style={styles.badgeRow}>
                    <Text style={styles.badge}>{typeLabel(item.type)}</Text>
                  </View>

                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.shortDescription || item.title}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color="#1A5F7A" />
                <Text style={styles.infoText}>
                  {item.location}
                  {item.distanceKm != null ? ` · ${item.distanceKm} km` : ""}
                </Text>
              </View>

              <View style={styles.infoBetween}>
                <Text style={styles.label}>Quantity</Text>
                <Text>{item.amount || "—"}</Text>
              </View>

              <View style={styles.infoBetween}>
                <Text style={styles.label}>Posted</Text>
                <Text style={{ color: "green" }}>
                  {timeAgo(item.postedAtIso || item.date)}
                </Text>
              </View>

              <View style={styles.footer}>
                <Text style={styles.donor}>Nearby listing</Text>
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
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#1A5F7A",
    padding: 20,
    paddingTop: 50,
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
    backgroundColor: "#ffffff20",
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
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
  },
  categoryActive: {
    backgroundColor: "#1A5F7A",
  },
  categoryText: {
    color: "#555",
  },
  categoryTextActive: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 12,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  emoji: {
    fontSize: 36,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  badge: {
    backgroundColor: "#e0f2f1",
    color: "#00695c",
    paddingHorizontal: 8,
    borderRadius: 6,
    fontSize: 12,
  },
  verified: {
    color: "green",
    fontSize: 12,
  },
  cardTitle: {
    fontWeight: "600",
    marginBottom: 2,
  },
  cardDesc: {
    color: "#666",
    fontSize: 13,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  infoText: {
    color: "#555",
    fontSize: 13,
  },
  infoBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  label: {
    color: "#888",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  donor: {
    color: "#555",
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
  loadingBox: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
  emptyList: {
    textAlign: "center",
    color: "#888",
    marginTop: 24,
  },
});
