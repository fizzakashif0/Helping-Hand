import {
  Calendar,
  CheckCircle,
  Gift,
  MessageCircle,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DEMO_REQUESTER_ID } from "../../lib/donations";
import { timeAgo } from "../../lib/timeAgo";
import {
  AppNotification,
  fetchNotifications,
  markNotificationRead,
} from "../../store/notificationStore";

interface RecipientNotificationsProps {
  onNavigate: (screen: string) => void;
}

function iconMetaForType(type: string) {
  if (type === "DONATION_REQUEST") {
    return { Icon: Gift, color: "#16a34a", bgColor: "#dcfce7" };
  }
  if (type === "DONATION_REQUEST_STATUS") {
    return { Icon: CheckCircle, color: "#2563eb", bgColor: "#dbeafe" };
  }
  return { Icon: MessageCircle, color: "#7c3aed", bgColor: "#ede9fe" };
}

export function RecipientNotifications({
  onNavigate,
}: RecipientNotificationsProps) {
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications(DEMO_REQUESTER_ID);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unreadCount = items.filter((n) => !n.isRead).length;

  const openNotification = async (n: AppNotification) => {
    try {
      await markNotificationRead(DEMO_REQUESTER_ID, n._id);
      setItems((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x))
      );
    } catch {
      /* ignore */
    }

    if (n.relatedDonationId) {
      router.push(`/recipient-donation/${n.relatedDonationId}`);
      return;
    }
    if (n.type === "DONATION_REQUEST_STATUS") {
      router.push("/my-requests");
      return;
    }
    onNavigate("browse-donations");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount} new</Text>
            </View>
          )}
        </View>
        <Text style={styles.headerSub}>Stay updated with available help</Text>
      </View>

      <View style={styles.list}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#1A5F7A" />
          </View>
        ) : items.length === 0 ? (
          <Text style={styles.empty}>No notifications yet.</Text>
        ) : (
          items.map((item) => {
            const { Icon, color, bgColor } = iconMetaForType(item.type);
            return (
              <TouchableOpacity
                key={item._id}
                style={[styles.card, !item.isRead && styles.unreadCard]}
                onPress={() => openNotification(item)}
              >
                <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
                  <Icon size={22} color={color} />
                </View>

                <View style={styles.content}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>{item.title}</Text>
                    {!item.isRead && <View style={styles.dot} />}
                  </View>

                  <Text style={styles.message} numberOfLines={2}>
                    {item.message}
                  </Text>
                  <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <View style={styles.quick}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push("/browse-donations")}
          >
            <Gift size={28} color="#1A5F7A" />
            <Text style={styles.quickTitle}>Browse Help</Text>
            <Text style={styles.quickSub}>Find donations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => onNavigate("ngo-events")}
          >
            <Calendar size={28} color="#1A5F7A" />
            <Text style={styles.quickTitle}>NGO Events</Text>
            <Text style={styles.quickSub}>View campaigns</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#1A5F7A",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
  },
  headerSub: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 6,
  },
  badge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  loading: {
    padding: 24,
    alignItems: "center",
  },
  empty: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  unreadCard: {
    borderColor: "#1A5F7A",
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1A5F7A",
    marginTop: 6,
  },
  message: {
    color: "#4b5563",
    marginTop: 4,
  },
  time: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 6,
  },
  quick: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  quickCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  quickTitle: {
    fontWeight: "600",
    marginTop: 8,
  },
  quickSub: {
    fontSize: 12,
    color: "#6b7280",
  },
});
