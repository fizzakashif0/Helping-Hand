import {
    Calendar,
    CheckCircle,
    Clock,
    MapPin,
    TrendingUp,
} from "lucide-react-native";
import { useState } from "react";

import {
    ScrollView,
    Text,
    View,
} from "react-native";
import { getDonations, DonationRecord as StoreDonationRecord, subscribe } from "../store/donationStore";
import styles from "../styles/MyDonationStyle";
import BottomNav, { NavItem } from "./Navbar";

/* ================= TYPES ================= */

export type DonationRecord = StoreDonationRecord;

type TabType = "all" | "completed" | "pending";

/* ================= CONFIG ================= */

const typeConfig = {
  clothes: { label: "Clothes", color: "#3b82f6" },
  food: { label: "Food", color: "#22c55e" },
  blood: { label: "Blood", color: "#b91c1c" },
  financial: { label: "Financial", color: "#f59e0b" },
};

const statusConfig = {
  completed: { label: "Completed", color: "#16a34a", icon: CheckCircle },
  pending: { label: "Pending", color: "#eab308", icon: Clock },
  "in-progress": { label: "In Progress", color: "#2563eb", icon: TrendingUp },
};

/* data comes from shared store */


function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

function DonationHistoryItem({ donation }: { donation: DonationRecord }) {
  const StatusIcon = statusConfig[donation.status].icon;

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <View style={styles.badgeRow}>
            <Badge
              label={typeConfig[donation.type].label}
              color={typeConfig[donation.type].color}
            />
            <Badge
              label={statusConfig[donation.status].label}
              color={statusConfig[donation.status].color}
            />
          </View>

          <Text style={styles.cardTitle}>{donation.title}</Text>
          <Text style={styles.cardSubtitle}>
            To: {donation.recipientName}
          </Text>
        </View>

        {donation.amount && (
          <Text style={styles.amount}>{donation.amount}</Text>
        )}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Calendar size={12} color="#6b7280" />
          <Text style={styles.metaText}>{donation.date}</Text>
        </View>
        <View style={styles.metaItem}>
          <MapPin size={12} color="#6b7280" />
          <Text style={styles.metaText}>{donation.location}</Text>
        </View>
      </View>
    </View>
  );
}

/* ================= MAIN SCREEN ================= */

export default function MyDonations() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [navActive, setNavActive] = useState<NavItem>("donations");
  const [myDonationHistory, setMyDonationHistory] = useState<DonationRecord[]>(() => getDonations());

  // subscribe to store updates
  useState(() => {
    const unsub = subscribe((items) => {
      setMyDonationHistory(items);
    });
    return unsub;
  });

  const completed = myDonationHistory.filter((d) => d.status === "completed");
  const pending = myDonationHistory.filter(
    (d) => d.status === "pending" || d.status === "in-progress"
  );

  const data =
    activeTab === "completed" ? completed : activeTab === "pending" ? pending : myDonationHistory;

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
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Donations</Text>
          <Text style={styles.statValue}>{myDonationHistory.length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={styles.statValue}>{completed.length}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {(["all", "completed", "pending"] as TabType[]).map(tab => (
          <Text
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
          >
            {tab === "all"
              ? `All (${myDonationHistory.length})`
              : tab === "completed"
              ? `Completed (${completed.length})`
              : `Pending (${pending.length})`}
          </Text>
        ))}
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.list}>
        {data.length > 0 ? (
          data.map(d => (
            <DonationHistoryItem key={d.id} donation={d} />
          ))
        ) : (
          <Text style={styles.emptyText}>No donations found</Text>
        )}
      </ScrollView>
      <BottomNav activeTab={navActive} onTabChange={setNavActive} />
    </View>
  );
}
