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
  Calendar,
  Users,
  Package,
  TrendingUp,
  Plus,
  Eye,
  Settings,
} from "lucide-react-native";

export default function NGOHomeScreen() {
  const router = useRouter();

  // Mock data for NGO dashboard
  const dashboardData = {
    totalEvents: 12,
    activeEvents: 3,
    totalParticipants: 2450,
    totalDonations: 15600,
    recentEvents: [
      {
        id: 1,
        name: "Winter Relief Drive",
        participants: 450,
        status: "Active",
        date: "2024-01-15",
      },
      {
        id: 2,
        name: "Food Distribution",
        participants: 320,
        status: "Completed",
        date: "2024-01-10",
      },
      {
        id: 3,
        name: "Medical Aid Camp",
        participants: 280,
        status: "Active",
        date: "2024-01-20",
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NGO Dashboard</Text>
        <TouchableOpacity
          onPress={() => (router.push as any)("/ngo-profile")}
          style={styles.settingsButton}
        >
          <Settings size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Calendar size={24} color="#1A5F7A" />
            <Text style={styles.statValue}>{dashboardData.totalEvents}</Text>
            <Text style={styles.statLabel}>Total Events</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={24} color="#1A5F7A" />
            <Text style={styles.statValue}>{dashboardData.totalParticipants}</Text>
            <Text style={styles.statLabel}>Participants</Text>
          </View>
          <View style={styles.statCard}>
            <Package size={24} color="#1A5F7A" />
            <Text style={styles.statValue}>{dashboardData.totalDonations}</Text>
            <Text style={styles.statLabel}>Donations</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#1A5F7A" />
            <Text style={styles.statValue}>{dashboardData.activeEvents}</Text>
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
              onPress={() => (router.push as any)("/ngo-reports")}
            >
              <TrendingUp size={24} color="#e60000" />
              <Text style={styles.actionText}>View Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Events</Text>
          {dashboardData.recentEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => (router.push as any)(`/event-details/${event.id}`)}
            >
              <View style={styles.eventHeader}>
                <Text style={styles.eventName}>{event.name}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        event.status === "Active" ? "#22c55e" : "#6b7280",
                    },
                  ]}
                >
                  <Text style={styles.statusText}>{event.status}</Text>
                </View>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventParticipants}>
                  {event.participants} participants
                </Text>
                <Text style={styles.eventDate}>{event.date}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
    justifyContent: "space-between",
  },
  actionButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 8,
  },
  section: {
    marginBottom: 30,
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
    justifyContent: "space-between",
  },
  eventParticipants: {
    fontSize: 14,
    color: "#6b7280",
  },
  eventDate: {
    fontSize: 14,
    color: "#6b7280",
  },
});
