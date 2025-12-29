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
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  Settings,
  BarChart3,
  Shield,
  LogOut,
} from "lucide-react-native";

export default function AdminDashboardScreen() {
  const router = useRouter();

  // Mock data for admin dashboard
  const dashboardData = {
    totalUsers: 1250,
    totalDonations: 45600,
    totalNGOs: 45,
    pendingReports: 8,
    recentActivity: [
      {
        id: 1,
        type: "New NGO Registration",
        description: "Green Earth Foundation registered",
        time: "2 hours ago",
        status: "pending",
      },
      {
        id: 2,
        type: "Donation Alert",
        description: "Large donation of $5000 received",
        time: "4 hours ago",
        status: "completed",
      },
      {
        id: 3,
        type: "Report Filed",
        description: "User reported suspicious activity",
        time: "6 hours ago",
        status: "pending",
      },
    ],
  };

  const handleLogout = () => {
    // In a real app, this would clear authentication tokens
    router.push("/");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Welcome Message */}
        <View style={styles.welcomeCard}>
          <Shield size={32} color="#8B5CF6" />
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>Welcome back, Admin</Text>
            <Text style={styles.welcomeSubtitle}>
              Monitor and manage the Helping-Hand platform
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Users size={24} color="#e60000" />
            <Text style={styles.statValue}>{dashboardData.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Package size={24} color="#e60000" />
            <Text style={styles.statValue}>{dashboardData.totalDonations}</Text>
            <Text style={styles.statLabel}>Total Donations</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#e60000" />
            <Text style={styles.statValue}>{dashboardData.totalNGOs}</Text>
            <Text style={styles.statLabel}>Registered NGOs</Text>
          </View>
          <View style={styles.statCard}>
            <AlertTriangle size={24} color="#e60000" />
            <Text style={styles.statValue}>{dashboardData.pendingReports}</Text>
            <Text style={styles.statLabel}>Pending Reports</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => (router.push as any)("/user-management")}
            >
              <Users size={24} color="#8B5CF6" />
              <Text style={styles.actionText}>User Management</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => (router.push as any)("/donation-monitoring")}
            >
              <Package size={24} color="#8B5CF6" />
              <Text style={styles.actionText}>Donation Monitoring</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => (router.push as any)("/report-handling")}
            >
              <AlertTriangle size={24} color="#8B5CF6" />
              <Text style={styles.actionText}>Handle Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => (router.push as any)("/analytics-reports")}
            >
              <BarChart3 size={24} color="#8B5CF6" />
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {dashboardData.recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityType}>{activity.type}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        activity.status === "completed" ? "#dcfce7" : "#fef3c7",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          activity.status === "completed"
                            ? "#166534"
                            : "#92400e",
                      },
                    ]}
                  >
                    {activity.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.activityDescription}>
                {activity.description}
              </Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          ))}
        </View>

        {/* System Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: "#22c55e" }]} />
              <Text style={styles.statusText}>Server Status: Online</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: "#22c55e" }]} />
              <Text style={styles.statusText}>Database: Connected</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: "#f59e0b" }]} />
              <Text style={styles.statusText}>Backup: In Progress</Text>
            </View>
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
    backgroundColor: "#8B5CF6",
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
  logoutButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
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
    color: "#1f2937",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
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
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  activityCard: {
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
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  activityType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  activityDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: "#9ca3af",
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
});
