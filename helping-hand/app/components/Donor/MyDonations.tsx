import {
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  TrendingUp
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { DonationRecord, getDonations, subscribe } from "../../store/donationStore";
import BottomNav, { NavItem } from "../Navbar";

const typeConfig = {
  clothes: { label: "Clothes", color: "#3B82F6" },
  food: { label: "Food", color: "#22C55E" },
  blood: { label: "Blood", color: "#B91C1C" },
  financial: { label: "Financial", color: "#F59E0B" }
};

const statusConfig = {
  completed: { label: "Completed", color: "#16A34A", icon: CheckCircle },
  pending: { label: "Pending", color: "#FACC15", icon: Clock },
  "in-progress": { label: "In Progress", color: "#2563EB", icon: TrendingUp }
};

function DonationHistoryItem({ donation }: { donation: DonationRecord }) {
  const StatusIcon = statusConfig[donation.status].icon;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                { backgroundColor: typeConfig[donation.type].color }
              ]}
            >
              <Text style={styles.badgeText}>
                {typeConfig[donation.type].label}
              </Text>
            </View>

            <View
              style={[
                styles.badge,
                { backgroundColor: statusConfig[donation.status].color }
              ]}
            >
              <StatusIcon size={12} color="#fff" />
              <Text style={styles.badgeText}>
                {" "}{statusConfig[donation.status].label}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{donation.title}</Text>
          <Text style={styles.subText}>
            To: {donation.recipientName}
          </Text>
        </View>

        {donation.amount && (
          <Text style={styles.amount}>{donation.amount}</Text>
        )}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Calendar size={14} color="#6B7280" />
          <Text style={styles.metaText}>{donation.date}</Text>
        </View>

        <View style={styles.metaItem}>
          <MapPin size={14} color="#6B7280" />
          <Text style={styles.metaText}>{donation.location}</Text>
        </View>
      </View>
    </View>
  );
}

export function MyDonations() {
  const [filterTab, setFilterTab] = useState<"all" | "completed" | "pending">("all");
  const [navTab, setNavTab] = useState<NavItem>("donations");
  const [donationHistory, setDonationHistory] = useState<DonationRecord[]>(() => getDonations());

  useEffect(() => {
    const unsubscribe = subscribe(setDonationHistory);
    return unsubscribe;
  }, []);

  const completed = donationHistory.filter(d => d.status === "completed");
  const pending = donationHistory.filter(
    d => d.status === "pending" || d.status === "in-progress"
  );

  const data =
    filterTab === "all"
      ? donationHistory
      : filterTab === "completed"
      ? completed
      : pending;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Donations</Text>
        <Text style={styles.headerSubtitle}>
          Track your contribution impact
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Donations</Text>
          <Text style={styles.statValue}>{donationHistory.length}</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={styles.statValue}>{completed.length}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TabButton
          label={`All (${donationHistory.length})`}
          active={filterTab === "all"}
          onPress={() => setFilterTab("all")}
        />
        <TabButton
          label={`Completed (${completed.length})`}
          active={filterTab === "completed"}
          onPress={() => setFilterTab("completed")}
        />
        <TabButton
          label={`Pending (${pending.length})`}
          active={filterTab === "pending"}
          onPress={() => setFilterTab("pending")}
        />
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.list}>
        {data.length > 0 ? (
          data.map(donation => (
            <DonationHistoryItem
              key={donation.id}
              donation={donation}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No donations found</Text>
        )}
      </ScrollView>
      <BottomNav activeTab={navTab} onTabChange={setNavTab} />
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.tabButton,
        active && styles.tabButtonActive
      ]}
    >
      <Text
        style={[
          styles.tabText,
          active && styles.tabTextActive
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB"
  },

  header: {
    backgroundColor: "#0E4A61",
    padding: 20
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600"
  },

  headerSubtitle: {
    color: "#FEE2E2",
    fontSize: 13
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    padding: 16
  },

  statBox: {
    flex: 1,
    backgroundColor: "#0E4A61",
    borderRadius: 12,
    padding: 14
  },

  statLabel: {
    color: "#FEE2E2",
    fontSize: 12
  },

  statValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600"
  },

  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#fff"
  },

  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center"
  },

  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#DC2626"
  },

  tabText: {
    fontSize: 13,
    color: "#6B7280"
  },

  tabTextActive: {
    color: "#DC2626",
    fontWeight: "600"
  },

  list: {
    padding: 16
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16
  },

  badgeText: {
    color: "#fff",
    fontSize: 11
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827"
  },

  subText: {
    fontSize: 13,
    color: "#6B7280"
  },

  amount: {
    color: "#DC2626",
    fontWeight: "600"
  },

  metaRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 8
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },

  metaText: {
    fontSize: 12,
    color: "#6B7280"
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#6B7280"
  }
});
export default MyDonations; 