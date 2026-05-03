import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DEMO_REQUESTER_ID } from "../../lib/donations";
import {
  RequestRecord,
  fetchMyRequests,
  getRequests,
  subscribeRequests,
} from "../../store/requestStore";

interface MyRequestsProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

export default function MyRequests({ onNavigate, onBack }: MyRequestsProps) {
  const [filter, setFilter] =
    useState<"all" | "active" | "matched" | "fulfilled">("all");
  const [requests, setRequests] = useState<RequestRecord[]>(() => getRequests());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRequests();
    return subscribeRequests(setRequests);
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      await fetchMyRequests(DEMO_REQUESTER_ID);
    } catch (error) {
      console.error("Failed to load requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((request) => {
          if (filter === "active") {
            return request.status === "pending";
          }

          if (filter === "matched") {
            return request.status === "approved";
          }

          if (filter === "fulfilled") {
            return request.status === "completed";
          }

          return true;
        });

  const stats = {
    total: requests.length,
    active: requests.filter((request) => request.status === "pending").length,
    matched: requests.filter((request) => request.status === "approved").length,
    fulfilled: requests.filter((request) => request.status === "completed").length,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backRow} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Requests</Text>
        <Text style={styles.headerSubtitle}>Track your help requests</Text>
      </View>

      <ScrollView>
        <View style={styles.statsCard}>
          {[
            { label: "Total", value: stats.total },
            { label: "Active", value: stats.active, color: "#2563eb" },
            { label: "Matched", value: stats.matched, color: "#16a34a" },
            { label: "Fulfilled", value: stats.fulfilled, color: "#6b7280" },
          ].map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={[styles.statValue, { color: stat.color || "#111" }]}>
                {stat.value}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {["all", "active", "matched", "fulfilled"].map((value) => (
            <TouchableOpacity
              key={value}
              style={[styles.filterBtn, filter === value && styles.filterActive]}
              onPress={() => setFilter(value as any)}
            >
              <Text
                style={[styles.filterText, filter === value && styles.filterTextActive]}
              >
                {value === "all"
                  ? "All Requests"
                  : value.charAt(0).toUpperCase() + value.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyText}>Loading your requests...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredRequests}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyText}>No requests found</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => onNavigate(`request-details-${item.id}`)}
              >
                <View style={styles.badgeRow}>
                  <Text style={[styles.statusBadge, statusStyle(item.status)]}>
                    {item.status.toUpperCase()}
                  </Text>
                  <Text style={styles.urgencyBadge}>{item.urgency.toUpperCase()}</Text>
                </View>

                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.desc} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.row}>
                  <Ionicons name="time-outline" size={14} />
                  <Text style={styles.meta}>{item.date}</Text>
                </View>

                <View style={styles.row}>
                  <Ionicons name="location-outline" size={14} />
                  <Text style={styles.meta}>{item.location}</Text>
                </View>

                {(item.status === "approved" || item.status === "completed") && (
                  <View style={styles.matchBox}>
                    <Ionicons name="checkmark-circle" size={16} color="green" />
                    <Text style={styles.matchText}>
                      {item.status === "completed" ? "Fulfilled by" : "Matched with"} a donor
                    </Text>
                  </View>
                )}

                <View style={styles.footer}>
                  <View style={styles.footerStats}>
                    <Text style={styles.meta}>Type: {item.type}</Text>
                    <Text style={styles.meta}>Qty: {item.quantity || "Not specified"}</Text>
                  </View>

                  {item.status === "approved" && (
                    <TouchableOpacity
                      style={styles.chatBtn}
                      onPress={() => onNavigate("chat")}
                    >
                      <Text style={styles.chatText}>Chat</Text>
                    </TouchableOpacity>
                  )}

                  {item.status === "pending" && (
                    <TouchableOpacity style={styles.editBtn}>
                      <Text>Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>

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
    status === "pending"
      ? "#f59e0b"
      : status === "approved"
      ? "#22c55e"
      : status === "completed"
      ? "#6b7280"
      : "#ef4444",
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
  listContent: { padding: 16 },
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
  emptyStateContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
  },
});
