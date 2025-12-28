import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface MyRequestsProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

const mockRequests = [
  {
    id: "1",
    type: "Food",
    title: "Groceries for family of 4",
    description:
      "Need basic groceries to last through the month. Rice, lentils, vegetables preferred.",
    status: "matched",
    urgency: "Medium",
    location: "Brooklyn, NY",
    postedDate: "2 days ago",
    matchedWith: "Sarah Johnson",
    responses: 3,
    views: 12,
  },
  {
    id: "2",
    type: "Clothes",
    title: "Winter clothes for children",
    description: "Winter jackets, warm clothes for two children",
    status: "active",
    urgency: "High",
    location: "Queens, NY",
    postedDate: "1 day ago",
    responses: 5,
    views: 24,
  },
  {
    id: "3",
    type: "Financial",
    title: "Utility bill assistance",
    description: "Need help with electricity bill payment this month",
    status: "fulfilled",
    urgency: "High",
    location: "Brooklyn, NY",
    postedDate: "5 days ago",
    matchedWith: "Community Fund",
    completedDate: "Yesterday",
    responses: 2,
    views: 8,
  },
];

export default function MyRequests({ onNavigate, onBack }: MyRequestsProps) {
  const [filter, setFilter] =
    useState<"all" | "active" | "matched" | "fulfilled">("all");

  const filteredRequests =
    filter === "all"
      ? mockRequests
      : mockRequests.filter((r) => r.status === filter);

  const stats = {
    total: mockRequests.length,
    active: mockRequests.filter(
      (r) => r.status === "active" || r.status === "pending"
    ).length,
    matched: mockRequests.filter((r) => r.status === "matched").length,
    fulfilled: mockRequests.filter((r) => r.status === "fulfilled").length,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backRow} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Requests</Text>
        <Text style={styles.headerSubtitle}>Track your help requests</Text>
      </View>

      <ScrollView>
        {/* Stats */}
        <View style={styles.statsCard}>
          {[
            { label: "Total", value: stats.total },
            { label: "Active", value: stats.active, color: "#2563eb" },
            { label: "Matched", value: stats.matched, color: "#16a34a" },
            { label: "Fulfilled", value: stats.fulfilled, color: "#6b7280" },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={[styles.statValue, { color: s.color || "#111" }]}>
                {s.value}
              </Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {["all", "active", "matched", "fulfilled"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn,
                filter === f && styles.filterActive,
              ]}
              onPress={() => setFilter(f as any)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextActive,
                ]}
              >
                {f === "all"
                  ? "All Requests"
                  : f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Requests List */}
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => onNavigate(`request-details-${item.id}`)}
            >
              {/* Badges */}
              <View style={styles.badgeRow}>
                <Text style={[styles.statusBadge, statusStyle(item.status)]}>
                  {item.status.toUpperCase()}
                </Text>
                <Text style={[styles.urgencyBadge]}>
                  {item.urgency}
                </Text>
              </View>

              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.row}>
                <Ionicons name="time-outline" size={14} />
                <Text style={styles.meta}>{item.postedDate}</Text>
              </View>

              <View style={styles.row}>
                <Ionicons name="location-outline" size={14} />
                <Text style={styles.meta}>{item.location}</Text>
              </View>

              {(item.status === "matched" || item.status === "fulfilled") &&
                item.matchedWith && (
                  <View style={styles.matchBox}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="green"
                    />
                    <Text style={styles.matchText}>
                      {item.status === "fulfilled"
                        ? "Fulfilled by"
                        : "Matched with"}{" "}
                      {item.matchedWith}
                    </Text>
                  </View>
                )}

              {/* Footer */}
              <View style={styles.footer}>
                <View style={styles.footerStats}>
                  <Text style={styles.meta}>
                    👁 {item.views}
                  </Text>
                  <Text style={styles.meta}>
                    💬 {item.responses}
                  </Text>
                </View>

                {item.status === "matched" && (
                  <TouchableOpacity
                    style={styles.chatBtn}
                    onPress={() => onNavigate("chat")}
                  >
                    <Text style={styles.chatText}>Chat</Text>
                  </TouchableOpacity>
                )}

                {item.status === "active" && (
                  <TouchableOpacity style={styles.editBtn}>
                    <Text>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => onNavigate("create-help-request")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
const statusStyle = (status: string) => ({
  backgroundColor:
    status === "active"
      ? "#3b82f6"
      : status === "matched"
      ? "#22c55e"
      : status === "fulfilled"
      ? "#6b7280"
      : "#f59e0b",
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  header: {
    backgroundColor: "#1A5F7A",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  backText: { color: "#fff" },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "600" },
  headerSubtitle: { color: "#cfe4ef" },

  statsCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
  },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "600" },
  statLabel: { fontSize: 12, color: "#666" },

  filterRow: { paddingHorizontal: 16 },
  filterBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterActive: { backgroundColor: "#1A5F7A" },
  filterText: { color: "#555" },
  filterTextActive: { color: "#fff" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },

  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  statusBadge: {
    color: "#fff",
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgencyBadge: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  title: { fontWeight: "600", marginBottom: 4 },
  desc: { color: "#666", fontSize: 13 },

  row: { flexDirection: "row", gap: 4, marginTop: 6 },
  meta: { fontSize: 12, color: "#555" },

  matchBox: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    backgroundColor: "#ecfdf5",
    padding: 8,
    borderRadius: 8,
  },
  matchText: { fontSize: 12, color: "#065f46" },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  footerStats: { flexDirection: "row", gap: 12 },

  chatBtn: {
    backgroundColor: "#1A5F7A",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chatText: { color: "#fff" },

  editBtn: {
    backgroundColor: "#eee",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#1A5F7A",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: { color: "#fff", fontSize: 28 },
});

