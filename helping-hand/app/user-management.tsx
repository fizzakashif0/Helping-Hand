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
import { ArrowLeft, User, Building, CheckCircle, XCircle, Search } from "lucide-react-native";

export default function UserManagementScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "users" | "ngos">("all");

  // Mock user and NGO data
  const users = [
    {
      id: 1,
      type: "user",
      name: "John Doe",
      email: "john.doe@email.com",
      status: "active",
      joinDate: "2024-01-10",
    },
    {
      id: 2,
      type: "user",
      name: "Jane Smith",
      email: "jane.smith@email.com",
      status: "active",
      joinDate: "2024-01-11",
    },
    {
      id: 3,
      type: "ngo",
      name: "Green Earth Foundation",
      email: "contact@greenearth.org",
      status: "pending",
      joinDate: "2024-01-12",
    },
    {
      id: 4,
      type: "ngo",
      name: "Helping Hands NGO",
      email: "info@helpinghands.org",
      status: "active",
      joinDate: "2024-01-08",
    },
    {
      id: 5,
      type: "user",
      name: "Mike Johnson",
      email: "mike.johnson@email.com",
      status: "suspended",
      joinDate: "2024-01-09",
    },
  ];

  const filteredUsers = users.filter(user => {
    if (filter === "all") return true;
    return user.type === filter.slice(0, -1); // "users" -> "user", "ngos" -> "ngo"
  });

  const handleStatusChange = (userId: number, newStatus: string) => {
    Alert.alert(
      "Confirm Action",
      `Are you sure you want to ${newStatus === "active" ? "activate" : newStatus === "suspended" ? "suspend" : "approve"} this ${users.find(u => u.id === userId)?.type}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            // In a real app, this would update the backend
            Alert.alert("Success", `User status updated to ${newStatus}`);
          },
        },
      ]
    );
  };

  const renderUser = ({ item }: { item: typeof users[0] }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            {item.type === "user" ? (
              <User size={20} color="#e60000" />
            ) : (
              <Building size={20} color="#e60000" />
            )}
            <Text style={styles.userName}>{item.name}</Text>
          </View>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        <View style={[styles.statusBadge, {
          backgroundColor: item.status === "active" ? "#dcfce7" :
                          item.status === "pending" ? "#fef3c7" : "#fee2e2"
        }]}>
          <Text style={[styles.statusText, {
            color: item.status === "active" ? "#166534" :
                   item.status === "pending" ? "#92400e" : "#991b1b"
          }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.userDetails}>
        <Text style={styles.joinDate}>Joined: {item.joinDate}</Text>
        <View style={styles.actionButtons}>
          {item.status === "pending" && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleStatusChange(item.id, "active")}
              >
                <CheckCircle size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleStatusChange(item.id, "suspended")}
              >
                <XCircle size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
            </>
          )}
          {item.status === "active" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.suspendButton]}
              onPress={() => handleStatusChange(item.id, "suspended")}
            >
              <XCircle size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Suspend</Text>
            </TouchableOpacity>
          )}
          {item.status === "suspended" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.activateButton]}
              onPress={() => handleStatusChange(item.id, "active")}
            >
              <CheckCircle size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Activate</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
        <Text style={styles.headerTitle}>User Management</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === "all" && styles.activeFilterTab]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterTabText, filter === "all" && styles.activeFilterTabText]}>
            All ({users.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === "users" && styles.activeFilterTab]}
          onPress={() => setFilter("users")}
        >
          <Text style={[styles.filterTabText, filter === "users" && styles.activeFilterTabText]}>
            Users ({users.filter(u => u.type === "user").length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === "ngos" && styles.activeFilterTab]}
          onPress={() => setFilter("ngos")}
        >
          <Text style={[styles.filterTabText, filter === "ngos" && styles.activeFilterTabText]}>
            NGOs ({users.filter(u => u.type === "ngo").length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
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
  userCard: {
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
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginLeft: 8,
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 28,
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
  userDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  joinDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  approveButton: {
    backgroundColor: "#22c55e",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  suspendButton: {
    backgroundColor: "#f59e0b",
  },
  activateButton: {
    backgroundColor: "#22c55e",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
});
