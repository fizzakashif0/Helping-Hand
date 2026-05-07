import {
    Calendar,
    CheckCircle,
    Gift,
    MessageCircle,
    TrendingUp
} from "lucide-react-native";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface RecipientNotificationsProps {
  onNavigate: (screen: string) => void;
}

const mockNotifications = [
  {
    id: "1",
    title: "New Donation Match!",
    message: "A donor has groceries available near you (1.2 km away)",
    time: "5 min ago",
    icon: Gift,
    color: "#16a34a",
    bgColor: "#dcfce7",
    read: false,
    action: "browse-donations",
  },
  {
    id: "2",
    title: "Message from Sarah Johnson",
    message:
      "Hi! I can provide the winter clothes you requested. Let's coordinate pickup.",
    time: "1 hour ago",
    icon: MessageCircle,
    color: "#2563eb",
    bgColor: "#dbeafe",
    read: false,
    action: "chat",
  },
  {
    id: "3",
    title: "Request Fulfilled",
    message:
      "Your groceries request has been marked as fulfilled. Thank you!",
    time: "3 hours ago",
    icon: CheckCircle,
    color: "#16a34a",
    bgColor: "#dcfce7",
    read: true,
    action: "recipient-my-requests",
  },
  {
    id: "4",
    title: "New NGO Campaign",
    message:
      "Winter Relief Drive 2024 is now active. 266 items available.",
    time: "Yesterday",
    icon: Calendar,
    color: "#7c3aed",
    bgColor: "#ede9fe",
    read: true,
    action: "ngo-events",
  },
  {
    id: "5",
    title: "Fresh Donations Nearby",
    message: "3 new food donations added within 2 km",
    time: "2 days ago",
    icon: TrendingUp,
    color: "#d97706",
    bgColor: "#fef3c7",
    read: true,
    action: "browse-donations",
  },
];

export function RecipientNotifications({
  onNavigate,
}: RecipientNotificationsProps) {
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount} new</Text>
            </View>
          )}
        </View>
        <Text style={styles.headerSub}>
          Stay updated with available help
        </Text>
      </View>

      {/* Notifications */}
      <View style={styles.list}>
        {mockNotifications.map(item => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                !item.read && styles.unreadCard,
              ]}
              onPress={() => onNavigate(item.action)}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: item.bgColor },
                ]}
              >
                <Icon size={22} color={item.color} />
              </View>

              <View style={styles.content}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{item.title}</Text>
                  {!item.read && <View style={styles.dot} />}
                </View>

                <Text style={styles.message} numberOfLines={2}>
                  {item.message}
                </Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Actions */}
      <View style={styles.quick}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => onNavigate("browse-donations")}
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
