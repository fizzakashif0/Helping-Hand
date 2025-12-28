import React, { useState } from "react";
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
  Download,
} from "lucide-react-native";

export default function AnalyticsReportsScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");

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
    monthlyStats: [
      { month: "Jan", donations: 4200, users: 120 },
      { month: "Feb", donations: 4800, users: 145 },
      { month: "Mar", donations: 5200, users: 160 },
      { month: "Apr", donations: 4900, users: 155 },
      { month: "May", donations: 5600, users: 180 },
      { month: "Jun", donations: 6100, users: 195 },
    ],
    topNGOs: [
      { name: "Green Earth Foundation", events: 12, beneficiaries: 2500 },
      { name: "Helping Hands NGO", events: 10, beneficiaries: 2200 },
      { name: "Community Aid Network", events: 8, beneficiaries: 1800 },
      { name: "Local Charity Org", events: 7, beneficiaries: 1600 },
    ],
  };

  const handleExportReport = () => {
    // In a real app, this would generate and download a report
    console.log("Exporting report...");
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
        <Text style={styles.headerTitle}>Analytics & Reports</Text>
        <TouchableOpacity
          onPress={handleExportReport}
          style={styles.exportButton}
        >
          <Download size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(["week", "month", "year"] as const).map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Cards */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewCard}>
              <Users size={24} color="#e60000" />
              <Text style={styles.overviewValue}>{analyticsData.overview.totalUsers}</Text>
              <Text style={styles.overviewLabel}>Total Users</Text>
              <Text style={styles.growthText}>+{analyticsData.trends.userGrowth}</Text>
            </View>
            <View style={styles.overviewCard}>
              <Package size={24} color="#e60000" />
              <Text style={styles.overviewValue}>{analyticsData.overview.totalDonations}</Text>
              <Text style={styles.overviewLabel}>Total Donations</Text>
              <Text style={styles.growthText}>+{analyticsData.trends.donationGrowth}</Text>
            </View>
            <View style={styles.overviewCard}>
              <Calendar size={24} color="#e60000" />
              <Text style={styles.overviewValue}>{analyticsData.overview.totalEvents}</Text>
              <Text style={styles.overviewLabel}>Total Events</Text>
              <Text style={styles.growthText}>+{analyticsData.trends.eventGrowth}</Text>
            </View>
            <View style={styles.overviewCard}>
              <TrendingUp size={24} color="#e60000" />
              <Text style={styles.overviewValue}>{analyticsData.overview.activeUsers}</Text>
              <Text style={styles.overviewLabel}>Active Users</Text>
              <Text style={styles.growthText}>This {selectedPeriod}</Text>
            </View>
          </View>
        </View>

        {/* Donation Types Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Donation Types Distribution</Text>
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
                      { backgroundColor: ["#e60000", "#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6"][index] },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Monthly Trends */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Monthly Trends</Text>
          <View style={styles.chartCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.trendLabel}>Month</Text>
              <Text style={styles.trendLabel}>Donations</Text>
              <Text style={styles.trendLabel}>New Users</Text>
            </View>
            {analyticsData.monthlyStats.map((stat) => (
              <View key={stat.month} style={styles.trendRow}>
                <Text style={styles.trendMonth}>{stat.month}</Text>
                <Text style={styles.trendValue}>{stat.donations}</Text>
                <Text style={styles.trendValue}>{stat.users}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top NGOs */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Top Performing NGOs</Text>
          <View style={styles.chartCard}>
            {analyticsData.topNGOs.map((ngo, index) => (
              <View key={ngo.name} style={styles.ngoItem}>
                <View style={styles.ngoRank}>
                  <Text style={styles.ngoRankText}>{index + 1}</Text>
                </View>
                <View style={styles.ngoInfo}>
                  <Text style={styles.ngoName}>{ngo.name}</Text>
                  <Text style={styles.ngoStats}>
                    {ngo.events} events • {ngo.beneficiaries} beneficiaries
                  </Text>
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
              <BarChart3 size={20} color="#e60000" />
              <Text style={styles.insightText}>
                Food donations have increased by 25% this quarter
              </Text>
            </View>
            <View style={styles.insightItem}>
              <PieChart size={20} color="#e60000" />
              <Text style={styles.insightText}>
                User engagement is highest on weekends
              </Text>
            </View>
            <View style={styles.insightItem}>
              <TrendingUp size={20} color="#e60000" />
              <Text style={styles.insightText}>
                NGO participation has grown by 40% year-over-year
              </Text>
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
    backgroundColor: "#e60000",
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
  exportButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: "#e60000",
  },
  periodButtonText: {
    fontSize: 14,
    color: "#6b7280",
  },
  periodButtonTextActive: {
    color: "#fff",
  },
  overviewSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  overviewCard: {
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
  overviewValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 8,
  },
  overviewLabel: {
    fontSize: 12,
    color: "#6b7280",
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
    backgroundColor: "#fff",
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
    color: "#1f2937",
  },
  chartItemValue: {
    fontSize: 14,
    color: "#6b7280",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  trendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 12,
  },
  trendLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    width: "30%",
    textAlign: "center",
  },
  trendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  trendMonth: {
    fontSize: 14,
    color: "#1f2937",
    width: "30%",
    textAlign: "center",
  },
  trendValue: {
    fontSize: 14,
    color: "#6b7280",
    width: "30%",
    textAlign: "center",
  },
  ngoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  ngoRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e60000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  ngoRankText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  ngoInfo: {
    flex: 1,
  },
  ngoName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  ngoStats: {
    fontSize: 12,
    color: "#6b7280",
  },
  insightsSection: {
    marginBottom: 20,
  },
  insightsCard: {
    backgroundColor: "#fff",
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
    color: "#4b5563",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});
