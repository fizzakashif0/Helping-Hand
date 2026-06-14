import React, { useEffect, useState } from "react";
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
  BarChart3,
  TrendingUp,
  Users,
  Package,
  CheckCircle,
  ArrowLeft,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

interface ReportStats {
  totalDonations: number;
  completedDonations: number;
  donationsPosted: number;
  donationsReceived: number;
  totalParticipants: number;
  totalEvents: number;
  activeEvents: number;
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

const DEFAULT_STATS: ReportStats = {
  totalDonations: 0,
  completedDonations: 0,
  donationsPosted: 0,
  donationsReceived: 0,
  totalParticipants: 0,
  totalEvents: 0,
  activeEvents: 0,
};

export default function NGOReportsScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<ReportStats>(DEFAULT_STATS);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports(isRefresh = false) {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/ngos/me/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.message || "Failed to load reports");
        return;
      }

      const data = await res.json();
      setStats(data.stats ?? DEFAULT_STATS);
      setRecentEvents(data.recentEvents ?? []);
    } catch (_) {
      setError("Network error. Pull down to retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NGO Reports</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadReports(true)}
            tintColor="#fff"
            colors={["#fff"]}
          />
        }
      >
        {/* Error banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Overview Stats — 6 cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Package size={24} color="#fff" />
            <Text style={styles.statValue}>{stats.totalDonations}</Text>
            <Text style={styles.statLabel}>Total Donations</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle size={24} color="#fff" />
            <Text style={styles.statValue}>{stats.completedDonations}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <ArrowUpCircle size={24} color="#fff" />
            <Text style={styles.statValue}>{stats.donationsPosted}</Text>
            <Text style={styles.statLabel}>We Donated</Text>
          </View>
          <View style={styles.statCard}>
            <ArrowDownCircle size={24} color="#fff" />
            <Text style={styles.statValue}>{stats.donationsReceived}</Text>
            <Text style={styles.statLabel}>We Received</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={24} color="#fff" />
            <Text style={styles.statValue}>{stats.totalParticipants}</Text>
            <Text style={styles.statLabel}>Participants</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#fff" />
            <Text style={styles.statValue}>{stats.totalEvents}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
        </View>

        {/* Recent Donation Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Donation Activity</Text>

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
                <View style={styles.eventStats}>
                  <View style={styles.eventStat}>
                    <Users size={16} color="#ffffffaa" />
                    <Text style={styles.eventStatText}>
                      {event.participants} applicants
                    </Text>
                  </View>
                  <View style={[
                    styles.roleBadge,
                    { backgroundColor: event.role === "donor" ? "#1A5F7A" : "#7C3AED" },
                  ]}>
                    <Text style={styles.roleText}>
                      {event.role === "donor" ? "We donated" : "We received"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.eventDate}>{event.date}</Text>
              </View>
            ))
          )}
        </View>

        {/* Analytics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics Overview</Text>
          <TouchableOpacity
            style={styles.analyticsCard}
            onPress={() => (router.push as any)("/analytics-overview")}
          >
            <BarChart3 size={48} color="#fff" />
            <Text style={styles.analyticsText}>
              Detailed analytics and charts will be available here once event
              tracking is enabled. This will include donation trends, participant
              demographics, and event success metrics.
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E4A61",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0E4A61",
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  errorBanner: {
    backgroundColor: "#EF444433",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: "#ffffff22",
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
    color: "white",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#ffffffaa",
    marginTop: 4,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
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
    color: "#ffffffaa",
  },
  emptyLink: {
    fontSize: 14,
    color: "#B2D8E8",
    fontWeight: "600",
  },
  eventCard: {
    backgroundColor: "#ffffff22",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  eventName: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
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
  eventStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  eventStat: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventStatText: {
    fontSize: 13,
    color: "#ffffffaa",
    marginLeft: 6,
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
    fontSize: 12,
    color: "#ffffff66",
    marginTop: 4,
  },
  analyticsCard: {
    backgroundColor: "#ffffff22",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  analyticsText: {
    fontSize: 14,
    color: "#ffffffaa",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 20,
  },
});