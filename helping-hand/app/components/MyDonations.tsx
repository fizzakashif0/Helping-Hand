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
import styles from "../styles/MyDonationStyle";
import BottomNav, { NavItem } from "./Navbar";

/* ================= TYPES ================= */

export interface DonationRecord {
  id: string;
  type: "clothes" | "food" | "blood" | "financial";
  title: string;
  recipientName: string;
  amount?: string;
  date: string;
  location: string;
  status: "completed" | "pending" | "in-progress";
}

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

/* ================= MOCK DATA ================= */

const myDonationHistory: DonationRecord[] = [
  {
    id: "1",
    type: "blood",
    title: "Blood Donation - O+",
    recipientName: "City Hospital",
    amount: "1 unit",
    date: "Dec 10, 2024",
    location: "City Hospital, Downtown",
    status: "completed",
  },
  {
    id: "2",
    type: "financial",
    title: "Medical Fund Contribution",
    recipientName: "Sarah's Cancer Treatment",
    amount: "$250",
    date: "Dec 8, 2024",
    location: "Memorial Hospital",
    status: "completed",
  },
  {
    id: "3",
    type: "clothes",
    title: "Winter Clothes Donation",
    recipientName: "Kids Care NGO",
    amount: "5 items",
    date: "Dec 5, 2024",
    location: "Community Center, North",
    status: "completed",
  },
  {
    id: "4",
    type: "food",
    title: "Food Package",
    recipientName: "Hope Shelter",
    amount: "10 kg",
    date: "Dec 3, 2024",
    location: "Hope Shelter, East Side",
    status: "completed",
  },
  {
    id: "5",
    type: "financial",
    title: "Education Fund",
    recipientName: "Bright Future Orphanage",
    amount: "$100",
    date: "Dec 1, 2024",
    location: "Bright Future Orphanage",
    status: "completed",
  },
  {
    id: "6",
    type: "food",
    title: "Meal Delivery",
    recipientName: "Sunshine Care Home",
    amount: "20 meals",
    date: "Nov 28, 2024",
    location: "Sunshine Care Home",
    status: "in-progress",
  },
  {
    id: "7",
    type: "clothes",
    title: "Professional Attire",
    recipientName: "Employment Aid",
    amount: "3 suits",
    date: "Nov 25, 2024",
    location: "Career Center, West",
    status: "pending",
  },
];


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

  const completed = myDonationHistory.filter(d => d.status === "completed");
  const pending = myDonationHistory.filter(
    d => d.status === "pending" || d.status === "in-progress"
  );

  const data =
    activeTab === "completed"
      ? completed
      : activeTab === "pending"
      ? pending
      : myDonationHistory;

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
