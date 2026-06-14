import { useRouter } from "expo-router";
import { CheckCircle, MessageCircle, XCircle } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { buildApiUrl } from "./lib/api";
import { timeAgo } from "./lib/timeAgo";
import { getToken } from "./lib/token";

interface UnifiedNotification {
  _id: string;
  kind: "actionable" | "info";
  postTitle: string;
  senderUsername: string;
  message: string;
  status: "pending" | "accepted" | "declined" | "rejected";
  type: string;
  createdAt: string;
  isRead?: boolean;
}

function iconMetaForNotification(item: UnifiedNotification) {
  if (item.kind === "actionable") {
    return { Icon: CheckCircle, color: "#2563eb", bgColor: "#dbeafe" };
  }
  if (item.type === "request_accepted") {
    return { Icon: CheckCircle, color: "#16a34a", bgColor: "#dcfce7" };
  }
  if (item.type === "request_declined") {
    return { Icon: XCircle, color: "#dc2626", bgColor: "#fee2e2" };
  }
  return { Icon: MessageCircle, color: "#7c3aed", bgColor: "#ede9fe" };
}

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<UnifiedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) { setItems([]); setLoading(false); return; }

      // Fetch both endpoints in parallel
      const [chatRequestsRes, notificationsRes] = await Promise.all([
        fetch(buildApiUrl("/api/chat-requests/pending"), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(buildApiUrl("/api/notifications"), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      let allItems: UnifiedNotification[] = [];

      // Process chat requests (actionable)
      if (chatRequestsRes.ok) {
        const chatRequests = await chatRequestsRes.json();
        if (Array.isArray(chatRequests)) {
          const actionable = chatRequests.map((item: any) => ({
            _id: item._id,
            kind: "actionable" as const,
            postTitle: item.postTitle || "Donation Request",
            senderUsername: item.senderUsername || "Someone",
            message: item.type === "donor_to_recipient"
              ? `${item.senderUsername || "Someone"} wants to help`
              : `${item.senderUsername || "Someone"} wants this donation`,
            status: item.status,
            type: item.type,
            createdAt: item.createdAt,
            isRead: false,
          }));
          allItems = allItems.concat(actionable);
        }
      }

      // Process notifications (info)
      if (notificationsRes.ok) {
        const notifications = await notificationsRes.json();
        if (Array.isArray(notifications)) {
          const infoCards = notifications.map((item: any) => ({
            _id: item._id,
            kind: "info" as const,
            postTitle: item.title || "Notification",
            senderUsername: item.senderName || "System",
            message: item.message || item.title || "You have a new notification",
            status: "pending" as const,
            type: item.type,
            createdAt: item.createdAt,
            isRead: item.isRead || false,
          }));
          allItems = allItems.concat(infoCards);
        }
      }

      // Sort by createdAt descending
      allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setItems(allItems);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAccept = async (id: string) => {
    if (actioningId) return;
    setActioningId(id);
    try {
      const token = await getToken();
      if (!token) { Alert.alert("Error", "Not authenticated"); return; }

      const response = await fetch(
        buildApiUrl(`/api/chat-requests/${id}/accept`),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data?.message || "Failed to accept");
        return;
      }

      const threadId = data.threadId;
      Alert.alert("Success", "Request accepted!");

      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: "accepted" as const } : item
        )
      );

      if (threadId) router.push(`/chat/${threadId}`);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to accept");
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (actioningId) return;
    setActioningId(id);
    try {
      const token = await getToken();
      if (!token) { Alert.alert("Error", "Not authenticated"); return; }

      const response = await fetch(
        buildApiUrl(`/api/chat-requests/${id}/decline`),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) { Alert.alert("Error", "Failed to reject"); return; }

      setItems((prev) => prev.filter((item) => item._id !== id));
      Alert.alert("Rejected", "Request rejected");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to reject");
    } finally {
      setActioningId(null);
    }
  };

  const pendingCount = items.filter((n) => n.status === "pending").length;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          {pendingCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingCount} new</Text>
            </View>
          )}
        </View>
        <Text style={styles.headerSub}>Your match requests</Text>
      </View>

      {/* List */}
      <View style={styles.list}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#1A5F7A" />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyBox}>
            <MessageCircle size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySub}>
              Match requests will appear here
            </Text>
          </View>
        ) : (
          items.map((item) => {
            const { Icon, color, bgColor } = iconMetaForNotification(item);
            const isPending = item.status === "pending";
            const isActionable = item.kind === "actionable";
            const isInfoAccepted = item.kind === "info" && item.type === "request_accepted";
            const isInfoDeclined = item.kind === "info" && item.type === "request_declined";
            
            return (
              <View
                key={item._id}
                style={[
                  styles.card,
                  isPending && isActionable && styles.unreadCard,
                  isInfoAccepted && styles.acceptedInfoCard,
                  isInfoDeclined && styles.declinedInfoCard,
                ]}
              >
                <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
                  <Icon size={22} color={color} />
                </View>

                <View style={styles.content}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.postTitle || "Notification"}
                    </Text>
                    {isPending && isActionable && <View style={styles.dot} />}
                  </View>
                  <Text style={styles.message}>
                    {item.message}
                  </Text>
                  <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>

                  {/* Action buttons - only for actionable pending requests */}
                  {isActionable && isPending && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.btn, styles.acceptBtn]}
                        onPress={() => handleAccept(item._id)}
                        disabled={actioningId === item._id}
                      >
                        {actioningId === item._id ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.btnText}>Accept</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.btn, styles.rejectBtn]}
                        onPress={() => handleReject(item._id)}
                        disabled={actioningId === item._id}
                      >
                        {actioningId === item._id ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.btnText}>Reject</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Status tags - for accepted/declined actionable cards */}
                  {isActionable && item.status === "accepted" && (
                    <Text style={styles.acceptedTag}>✓ Accepted</Text>
                  )}
                  {isActionable && item.status === "declined" && (
                    <Text style={styles.declinedTag}>✗ Declined</Text>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#1A5F7A",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: { marginRight: 4 },
  backText: { color: "#fff", fontSize: 16 },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  headerSub: { color: "rgba(255,255,255,0.7)", marginTop: 6, fontSize: 13 },
  list: { padding: 16, gap: 12 },
  loadingBox: { padding: 40, alignItems: "center" },
  emptyBox: {
    padding: 40,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 12,
  },
  emptySub: { fontSize: 13, color: "#9ca3af" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  unreadCard: {
    borderColor: "#1A5F7A",
    backgroundColor: "#f0f7fb",
  },
  acceptedInfoCard: {
    borderColor: "#16a34a",
    backgroundColor: "#f0fdf4",
  },
  declinedInfoCard: {
    borderColor: "#dc2626",
    backgroundColor: "#fef2f2",
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    fontSize: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1A5F7A",
  },
  message: { color: "#4b5563", marginTop: 4, fontSize: 13 },
  time: { color: "#9ca3af", fontSize: 12, marginTop: 4 },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: "center",
  },
  acceptBtn: { backgroundColor: "#22c55e" },
  rejectBtn: { backgroundColor: "#ef4444" },
  btnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  acceptedTag: {
    marginTop: 8,
    color: "#16a34a",
    fontSize: 13,
    fontWeight: "600",
  },
  declinedTag: {
    marginTop: 8,
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "600",
  },
  infoAcceptedText: {
    marginTop: 8,
    color: "#16a34a",
    fontSize: 13,
    fontWeight: "600",
  },
  infoDeclinedText: {
    marginTop: 8,
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "600",
  },
});