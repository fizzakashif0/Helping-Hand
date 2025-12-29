import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Eye, MessageSquare } from "lucide-react-native";

export default function ReportHandlingScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");

  // Mock reports data
  const reports = [
    {
      id: 1,
      type: "Suspicious Activity",
      description: "User reported unusual donation patterns from this account",
      reporter: "john.doe@email.com",
      reportedUser: "suspicious.user@email.com",
      status: "pending",
      priority: "high",
      date: "2024-01-15",
    },
    {
      id: 2,
      type: "Inappropriate Content",
      description: "Event description contains inappropriate language",
      reporter: "moderator@helpinghand.org",
      reportedUser: "ngo@badcontent.org",
      status: "pending",
      priority: "medium",
      date: "2024-01-14",
    },
    {
      id: 3,
      type: "Fraud Report",
      description: "NGO claiming to be affiliated with government but no verification",
      reporter: "citizen@email.com",
      reportedUser: "fraudulent.ngo@email.com",
      status: "resolved",
      priority: "high",
      date: "2024-01-10",
    },
    {
      id: 4,
      type: "Harassment",
      description: "User receiving threatening messages from another user",
      reporter: "victim@email.com",
      reportedUser: "harasser@email.com",
      status: "resolved",
      priority: "high",
      date: "2024-01-12",
    },
  ];

  const filteredReports = reports.filter(report => {
    if (filter === "all") return true;
    return report.status === filter;
  });

  const handleAction = (reportId: number, action: "resolve" | "dismiss") => {
    const actionText = action === "resolve" ? "resolve" : "dismiss";
    Alert.alert(
      "Confirm Action",
      `Are you sure you want to ${actionText} this report?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            // In a real app, this would update the backend
            Alert.alert("Success", `Report ${action}d successfully`);
          },
        },
      ]
    );
  };

  const renderReport = ({ item }: { item: typeof reports[0] }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <Text style={styles.reportType}>{item.type}</Text>
          <View style={[styles.priorityBadge, {
            backgroundColor: item.priority === "high" ? "#fee2e2" : "#fef3c7"
          }]}>
            <Text style={[styles.priorityText, {
              color: item.priority === "high" ? "#991b1b" : "#92400e"
            }]}>
              {item.priority}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, {
          backgroundColor: item.status === "resolved" ? "#dcfce7" : "#fef3c7"
        }]}>
          <Text style={[styles.statusText, {
            color: item.status === "resolved" ? "#166534" : "#92400e"
          }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.reportDescription}>{item.description}</Text>

      <View style={styles.reportDetails}>
        <Text style={styles.detailText}>Reporter: {item.reporter}</Text>
        <Text style={styles.detailText}>Reported: {item.reportedUser}</Text>
        <Text style={styles.reportDate}>{item.date}</Text>
      </View>

      {item.status === "pending" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => Alert.alert("View Details", "Detailed report view would open here")}
          >
            <Eye size={16} color="#fff" />
            <Text style={styles.actionButtonText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.resolveButton]}
            onPress={() => handleAction(item.id, "resolve")}
          >
            <CheckCircle size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Resolve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.dismissButton]}
            onPress={() => handleAction(item.id, "dismiss")}
          >
            <XCircle size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

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
        <Text style={styles.headerTitle}>Report Handling</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === "all" && styles.activeFilterTab]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterTabText, filter === "all" && styles.activeFilterTabText]}>
            All ({reports.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === "pending" && styles.activeFilterTab]}
          onPress={() => setFilter("pending")}
        >
          <Text style={[styles.filterTabText, filter === "pending" && styles.activeFilterTabText]}>
            Pending ({reports.filter(r => r.status === "pending").length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === "resolved" && styles.activeFilterTab]}
          onPress={() => setFilter("resolved")}
        >
          <Text style={[styles.filterTabText, filter === "resolved" && styles.activeFilterTabText]}>
            Resolved ({reports.filter(r => r.status === "resolved").length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reports List */}
      <FlatList
        data={filteredReports}
        renderItem={renderReport}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
    fontSize: 24,
    fontWeight: "bold",
  },
  filterContainer: {
    flexDirection: "row",
    padding: 20,
    paddingBottom: 10,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeFilterTab: {
    backgroundColor: "#e60000",
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  activeFilterTabText: {
    color: "#fff",
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  reportCard: {
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
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportType: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "500",
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
  reportDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
    lineHeight: 20,
  },
  reportDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  viewButton: {
    backgroundColor: "#6b7280",
  },
  resolveButton: {
    backgroundColor: "#22c55e",
  },
  dismissButton: {
    backgroundColor: "#ef4444",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
});
