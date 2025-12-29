import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  Calendar,
  ArrowLeft,
} from "lucide-react-native";

export default function NGOReportsScreen() {
  const router = useRouter();

  // Mock data for reports
  const reportData = {
    totalEvents: 12,
    totalParticipants: 2450,
    totalDonations: 15600,
    impactScore: 8.7,
    recentEvents: [
      {
        id: 1,
        name: "Winter Relief Drive",
        participants: 450,
        donations: 3200,
        status: "Completed",
      },
      {
        id: 2,
        name: "Food Distribution",
        participants: 320,
        donations: 1800,
        status: "Completed",
      },
      {
        id: 3,
        name: "Medical Aid Camp",
        participants: 280,
        donations: 1500,
        status: "Ongoing",
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NGO Reports</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Calendar size={24} color="#1A5F7A" />
            <Text style={styles.statValue}>{reportData.totalEvents}</Text>
            <Text style={styles.statLabel}>Total Events</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={24} color="#1A5F7A" />
            <Text style={styles.statValue}>{reportData.totalParticipants}</Text>
            <Text style={styles.statLabel}>Participants</Text>
          </View>
          <View style={styles.statCard}>
            <Package size={24} color="#1A5F7A" />
            <Text style={styles.statValue}>{reportData.totalDonations}</Text>
            <Text style={styles.statLabel}>Donations</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#1A5F7A" />
            <Text style={styles.statValue}>{reportData.impactScore}</Text>
            <Text style={styles.statLabel}>Impact Score</Text>
          </View>
        </View>

        {/* Recent Events Report */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Events Performance</Text>
          {reportData.recentEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventName}>{event.name}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        event.status === "Completed" ? "#22c55e" : "#eab308",
                    },
                  ]}
                >
                  <Text style={styles.statusText}>{event.status}</Text>
                </View>
              </View>
              <View style={styles.eventStats}>
                <View style={styles.eventStat}>
                  <Users size={16} color="#6b7280" />
                  <Text style={styles.eventStatText}>
                    {event.participants} participants
                  </Text>
                </View>
                <View style={styles.eventStat}>
                  <Package size={16} color="#6b7280" />
                  <Text style={styles.eventStatText}>
                    ${event.donations} donated
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Analytics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics Overview</Text>
          <View style={styles.analyticsCard}>
            <BarChart3 size={48} color="#1A5F7A" />
            <Text style={styles.analyticsText}>
              Detailed analytics and charts will be displayed here. This includes
              donation trends, participant demographics, and event success metrics.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
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
    marginBottom: 12,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
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
    justifyContent: "space-between",
  },
  eventStat: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventStatText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 6,
  },
  analyticsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 20,
  },
});
