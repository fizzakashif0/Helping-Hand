import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Search,
  Package,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
} from "lucide-react-native";

export default function DonationMonitoringScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed" | "flagged">("all");

  // Mock data for donations
  const donations = [
    {
      id: 1,
      title: "Winter Clothing Drive",
      donor: "John Doe",
      recipient: "Community Shelter",
      type: "clothes",
      amount: "50 items",
      status: "active",
      date: "2024-01-15",
      location: "Downtown Area",
    },
    {
      id: 2,
      title: "Food Package Distribution",
      donor: "Jane Smith",
      recipient: "Local NGO",
      type: "food",
      amount: "100 packages",
      status: "completed",
      date: "2024-01-10",
      location: "North District",
    },
    {
      id: 3,
      title: "Medical Supplies",
      donor: "Green Earth Foundation",
      recipient: "City Hospital",
      type: "financial",
      amount: "$2500",
      status: "flagged",
      date: "2024-01-12",
      location: "Medical Center",
    },
    {
      id: 4,
      title: "Educational Materials",
      donor: "Mike Johnson",
      recipient: "School District",
      type: "financial",
      amount: "$1500",
      status: "active",
      date: "2024-01-14",
      location: "Education Zone",
    },
  ];

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         donation.donor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         donation.recipient.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || donation.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "#22c55e";
      case "completed": return "#3b82f6";
      case "flagged": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "clothes": return "#3b82f6";
      case "food": return "#22c55e";
      case "financial": return "#f59e0b";
      case "blood": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const handleViewDetails = (donationId: number) => {
    // In a real app, this would navigate to donation details
    console.log("View donation details:", donationId);
  };

  const handleFlagDonation = (donationId: number) => {
    // In a real app, this would flag the donation for review
    console.log("Flag donation:", donationId);
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
        <Text style={styles.headerTitle}>Donation Monitoring</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Search and Filter */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search donations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.filterButtons}>
            {(["all", "active", "completed", "flagged"] as const).map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  filterStatus === status && styles.filterButtonActive,
                ]}
                onPress={() => setFilterStatus(status)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filterStatus === status && styles.filterButtonTextActive,
                  ]}
                >
                  {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Package size={20} color="#e60000" />
            <Text style={styles.statValue}>{donations.length}</Text>
            <Text style={styles.statLabel}>Total Donations</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle size={20} color="#22c55e" />
            <Text style={styles.statValue}>
              {donations.filter(d => d.status === "completed").length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={20} color="#f59e0b" />
            <Text style={styles.statValue}>
              {donations.filter(d => d.status === "active").length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <AlertTriangle size={20} color="#ef4444" />
            <Text style={styles.statValue}>
              {donations.filter(d => d.status === "flagged").length}
            </Text>
            <Text style={styles.statLabel}>Flagged</Text>
          </View>
        </View>

        {/* Donations List */}
        <View style={styles.donationsSection}>
          <Text style={styles.sectionTitle}>
            Donations ({filteredDonations.length})
          </Text>
          {filteredDonations.map((donation) => (
            <View key={donation.id} style={styles.donationCard}>
              <View style={styles.donationHeader}>
                <View style={styles.donationInfo}>
                  <Text style={styles.donationTitle}>{donation.title}</Text>
                  <Text style={styles.donationSubtitle}>
                    {donation.donor} → {donation.recipient}
                  </Text>
                </View>
                <View style={styles.donationBadges}>
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: getTypeColor(donation.type) },
                    ]}
                  >
                    <Text style={styles.typeText}>
                      {donation.type.charAt(0).toUpperCase() + donation.type.slice(1)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(donation.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.donationDetails}>
                <View style={styles.detailRow}>
                  <Package size={14} color="#6b7280" />
                  <Text style={styles.detailText}>Amount: {donation.amount}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailText}>{donation.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location:</Text>
                  <Text style={styles.detailText}>{donation.location}</Text>
                </View>
              </View>

              <View style={styles.donationActions}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => handleViewDetails(donation.id)}
                >
                  <Eye size={16} color="#e60000" />
                  <Text style={styles.viewButtonText}>View Details</Text>
                </TouchableOpacity>
                {donation.status !== "flagged" && (
                  <TouchableOpacity
                    style={styles.flagButton}
                    onPress={() => handleFlagDonation(donation.id)}
                  >
                    <AlertTriangle size={16} color="#ef4444" />
                    <Text style={styles.flagButtonText}>Flag</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
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
  content: {
    padding: 20,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  filterButtonActive: {
    backgroundColor: "#e60000",
    borderColor: "#e60000",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#6b7280",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "23%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  donationsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  donationCard: {
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
  donationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  donationInfo: {
    flex: 1,
  },
  donationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  donationSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  donationBadges: {
    flexDirection: "row",
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
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
  donationDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    width: 60,
  },
  detailText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
  },
  donationActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e60000",
    backgroundColor: "#fff",
  },
  viewButtonText: {
    color: "#e60000",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  flagButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#fef2f2",
  },
  flagButtonText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
});
