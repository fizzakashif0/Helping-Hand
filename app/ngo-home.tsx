import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { getToken } from "./lib/token";
import {
  Calendar,
  Users,
  Package,
  TrendingUp,
  Plus,
  Settings,
  CheckCircle,
  ListChecks,
} from "lucide-react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

interface Stats {
  totalEvents: number;
  activeEvents: number;
  totalDonations: number;
  completedDonations: number;
  donationsPosted: number;
  donationsReceived: number;
  totalParticipants: number;
}

interface RecentEvent {
  _id: string;
  name: string;
  participants: number;
  donations: number;
  status: string;
  date: string;
  role: "donor" | "recipient";
}

const DEFAULT_STATS: Stats = {
  totalEvents: 0,
  activeEvents: 0,
  totalDonations: 0,
  completedDonations: 0,
  donationsPosted: 0,
  donationsReceived: 0,
  totalParticipants: 0,
};

export default function NGOHomeScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [ngoName, setNgoName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard(isRefresh = false) {
  try {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const token = await getToken(); 
    if (!token) {
      router.replace("/login");
      return;
    }

    const [statsRes, profileRes] = await Promise.all([
      fetch(`${API_URL}/api/ngos/me/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_URL}/api/ngos/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (statsRes.ok) {
      const data = await statsRes.json();
      setStats(data.stats ?? DEFAULT_STATS);
      setRecentEvents(data.recentEvents ?? []);
    }

    if (profileRes.ok) {
      const data = await profileRes.json();
      setNgoName(data.ngo?.organizationName || "");
    }
  } catch (_) {
    // keep showing last known data on network error
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>NGO Dashboard</Text>
          {ngoName ? (
            <Text style={styles.headerSubtitle}>{ngoName}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={() => (router.push as any)("/ngo-profile")}
          style={styles.settingsButton}
        >
          <Settings size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboard(true)}
            tintColor="#fff"
            colors={["#fff"]}
          />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Package size={24} color="#1A5F7A" />
            <Text style={styles.statValue}>{stats.totalDonations}</Text>
            <Text style={styles.statLabel}>Total Donations</Text>
          </View>

          <View style={styles.statCard}>
            <CheckCircle size={24} color="#1A5F7A" />
            <Text style={styles.statValue}>{stats.completedDonations}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>

          <View style={styles.statCard}>
            <TrendingUp size={24} color="#1A5F7A" />
            <Text style={styles.statValue}>{stats.donationsPosted}</Text>
            <Text style={styles.statLabel}>Posted</Text>
          </View>

          <View style={styles.statCard}>
            <Users size={24} color="#1A5F7A" />
            <Text style={styles.statValue}>{stats.donationsReceived}</Text>
            <Text style={styles.statLabel}>Received</Text>
          </View>

          <View style={styles.statCard}>
            <Calendar size={24} color="#1A5F7A" />
            <Text style={styles.statValue}>{stats.totalEvents}</Text>
            <Text style={styles.statLabel}>Total Events</Text>
          </View>

          <View style={styles.statCard}>
            <ListChecks size={24} color="#1A5F7A" />
            <Text style={styles.statValue}>{stats.activeEvents}</Text>
            <Text style={styles.statLabel}>Active Events</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => (router.push as any)("/create-event")}
            >
              <Plus size={24} color="#e60000" />
              <Text style={styles.actionText}>Create Event</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => (router.push as any)("/ngo-events")}
            >
              <ListChecks size={24} color="#e60000" />
              <Text style={styles.actionText}>My Events</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => (router.push as any)("/ngo-reports")}
            >
              <TrendingUp size={24} color="#e60000" />
              <Text style={styles.actionText}>View Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Donations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>

          {recentEvents.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No donation activity yet.</Text>
              <TouchableOpacity
                onPress={() => (router.push as any)("/create-event")}
              >
                <Text style={styles.emptyLink}>Post your first donation →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentEvents.map((event) => (
              <View key={event._id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventName} numberOfLines={1}>
                    {event.name}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: event.status === "Completed" ? "#22c55e" : "#eab308" },
                  ]}>
                    <Text style={styles.statusText}>{event.status}</Text>
                  </View>
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventParticipants}>
                    {event.participants} applicants
                  </Text>
                  <View style={[
                    styles.roleBadge,
                    { backgroundColor: event.role === "donor" ? "#1A5F7A" : "#7C3AED" },
                  ]}>
                    <Text style={styles.roleText}>
                      {event.role === "donor" ? "We donated" : "We received"}
                    </Text>
                  </View>
                  <Text style={styles.eventDate}>{event.date}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A5F7A",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#1A5F7A",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
  },
  header: {
    backgroundColor: "#1A5F7A",
    padding: 20,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#B2D8E8",
    fontSize: 13,
    marginTop: 2,
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    width: "48%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  actionsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    width: "31%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 8,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  emptyCard: {
    backgroundColor: "#ffffff22",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#ffffffcc",
  },
  emptyLink: {
    fontSize: 14,
    color: "#B2D8E8",
    fontWeight: "600",
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  eventDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
  },
  eventParticipants: {
    fontSize: 13,
    color: "#6b7280",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  roleText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  eventDate: {
    fontSize: 13,
    color: "#6b7280",
  },
});