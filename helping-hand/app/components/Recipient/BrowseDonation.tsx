import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface BrowseDonationsProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

const mockDonations = [
  {
    id: "1",
    type: "Food",
    title: "Fresh groceries and canned goods",
    description: "Rice, pasta, canned vegetables, and fresh produce available",
    location: "1.2",
    donor: "Sarah Johnson",
    image: "🥘",
    availability: "Available now",
    quantity: "Enough for 4-5 people",
    verified: true,
  },
  {
    id: "2",
    type: "Clothes",
    title: "Winter clothing collection",
    description: "Jackets, sweaters, warm clothes",
    location: "2.5",
    donor: "Community Helper",
    image: "👕",
    availability: "Available today",
    quantity: "Multiple items",
    verified: true,
  },
];

export default function BrowseDonations({
  onNavigate,
  onBack,
}: BrowseDonationsProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Food", "Clothes", "Financial", "Blood"];

  const filteredDonations = mockDonations.filter(
    (d) =>
      (selectedCategory === "All" || d.type === selectedCategory) &&
      (d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Browse Available Help</Text>
        <Text style={styles.subtitle}>Find donations near you</Text>

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

      {/* Categories */}
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

      {/* Donation List */}
      <FlatList
        data={filteredDonations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              onNavigate(`recipient-donation-details-${item.id}`)
            }
          >
            <View style={styles.cardHeader}>
              <Text style={styles.emoji}>{item.image}</Text>

              <View style={{ flex: 1 }}>
                <View style={styles.badgeRow}>
                  <Text style={styles.badge}>{item.type}</Text>
                  {item.verified && (
                    <Text style={styles.verified}>✓ Verified</Text>
                  )}
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="#1A5F7A" />
              <Text style={styles.infoText}>{item.location} km away</Text>
            </View>

            <View style={styles.infoBetween}>
              <Text style={styles.label}>Quantity</Text>
              <Text>{item.quantity}</Text>
            </View>

            <View style={styles.infoBetween}>
              <Text style={styles.label}>Availability</Text>
              <Text style={{ color: "green" }}>{item.availability}</Text>
            </View>

            <View style={styles.footer}>
              <Text style={styles.donor}>{item.donor}</Text>
              <TouchableOpacity
                style={styles.requestBtn}
                onPress={() => onNavigate("request-donation")}
              >
                <Text style={styles.requestText}>Request</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
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
});
