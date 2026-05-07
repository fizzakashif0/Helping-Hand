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
  ArrowLeft,
  TrendingUp,
  Users,
  Package,
  Calendar,
  BarChart3,
  PieChart,
} from "lucide-react-native";

export default function AnalyticsOverviewScreen() {
  const router = useRouter();

  // Mock analytics data
  const analyticsData = {
    overview: {
      totalUsers: 1250,
      totalDonations: 45600,
      totalEvents: 89,
      activeUsers: 892,
    },
    trends: {
      userGrowth: "+12%",
      donationGrowth: "+8%",
      eventGrowth: "+15%",
    },
    donationTypes: [
      { type: "Food", count: 245, percentage: 35 },
      { type: "Clothes", count: 189, percentage: 27 },
      { type: "Financial", count: 156, percentage: 22 },
      { type: "Blood", count: 78, percentage: 11 },
      { type: "Other", count: 32, percentage: 5 },
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
        <Text style={styles.headerTitle}>Analytics Overview</Text>
        <TouchableOpacity
          onPress={() => (router.push as any)("/analytics-reports")}
          style={styles.detailsButton}
        >
          <BarChart3 size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Overview Cards */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewCard}>
              <Users size={24} color="#1A5F7A" />
              <Text style={styles.overviewValue}>{analyticsData.overview.totalUsers}</Text>
              <Text style={styles.overviewLabel}>Total Users</Text>
              <Text style={styles.growthText}>+{analyticsData.trends.userGrowth}</Text>
            </View>
            <View style={styles.overviewCard}>
              <Package size={24} color="#1A5F7A" />
              <Text style={styles.overviewValue}>{analyticsData.overview.totalDonations}</Text>
              <Text style={styles.overviewLabel}>Total Donations</Text>
              <Text style={styles.growthText}>+{analyticsData.trends.donationGrowth}</Text>
            </View>
            <View style={styles.overviewCard}>
              <Calendar size={24} color="#1A5F7A" />
              <Text style={styles.overviewValue}>{analyticsData.overview.totalEvents}</Text>
              <Text style={styles.overviewLabel}>Total Events</Text>
              <Text style={styles.growthText}>+{analyticsData.trends.eventGrowth}</Text>
            </View>
            <View style={styles.overviewCard}>
              <TrendingUp size={24} color="#1A5F7A" />
              <Text style={styles.overviewValue}>{analyticsData.overview.activeUsers}</Text>
              <Text style={styles.overviewLabel}>Active Users</Text>
              <Text style={styles.growthText}>This month</Text>
            </View>
          </View>
        </View>

        {/* Donation Types Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Donation Types</Text>
          <View style={styles.chartCard}>
            {analyticsData.donationTypes.map((item, index) => (
              <View key={item.type} style={styles.chartItem}>
                <View style={styles.chartItemHeader}>
                  <Text style={styles.chartItemLabel}>{item.type}</Text>
                  <Text style={styles.chartItemValue}>
                    {item.count} ({item.percentage}%)
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${item.percentage}%` },
                      { backgroundColor: ["#8B5CF6", "#22c55e", "#3b82f6", "#f59e0b", "#ef4444"][index] },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Quick Insights</Text>
          <View style={styles.insightsCard}>
            <View style={styles.insightItem}>
              <BarChart3 size={20} color="#1A5F7A" />
              <Text style={styles.insightText}>
                Food donations have increased by 25% this quarter
              </Text>
            </View>
            <View style={styles.insightItem}>
              <PieChart size={20} color="#1A5F7A" />
              <Text style={styles.insightText}>
                User engagement is highest on weekends
              </Text>
            </View>
            <View style={styles.insightItem}>
              <TrendingUp size={20} color="#1A5F7A" />
              <Text style={styles.insightText}>
                NGO participation has grown by 40% year-over-year
              </Text>
            </View>
          </View>
        </View>

        {/* View Details Button */}
        <TouchableOpacity
          style={styles.detailsButtonCard}
          onPress={() => (router.push as any)("/analytics-reports")}
        >
          <BarChart3 size={24} color="#1A5F7A" />
          <Text style={styles.detailsButtonText}>View Detailed Analytics</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E4A61",
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
  detailsButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  overviewSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  overviewCard: {
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
  overviewValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginTop: 8,
  },
  overviewLabel: {
    fontSize: 12,
    color: "#ffffffaa",
    marginTop: 4,
  },
  growthText: {
    fontSize: 12,
    color: "#22c55e",
    fontWeight: "600",
    marginTop: 4,
  },
  chartSection: {
    marginBottom: 30,
  },
  chartCard: {
    backgroundColor: "#ffffff22",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartItem: {
    marginBottom: 16,
  },
  chartItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  chartItemLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  chartItemValue: {
    fontSize: 14,
    color: "#ffffffaa",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#ffffff44",
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  insightsSection: {
    marginBottom: 30,
  },
  insightsCard: {
    backgroundColor: "#ffffff22",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    color: "#ffffffaa",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  detailsButtonCard: {
    backgroundColor: "#ffffff22",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 12,
  },
});
