import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Package,
  Users,
  Plus,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  TrendingUp,
} from "lucide-react-native";

export default function EventDistributionTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const eventId = params.id as string;

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [distributionData, setDistributionData] = useState({
    beneficiaryName: "",
    itemsDistributed: "",
    quantity: "",
    location: "",
    date: new Date().toISOString().split('T')[0],
  });

  // Mock event data
  const eventData = {
    id: eventId,
    name: "Winter Relief Drive",
    totalItems: 2500,
    distributedItems: 1850,
    totalBeneficiaries: 450,
    reachedBeneficiaries: 320,
    targetCompletion: "75%",
  };

  // Mock distribution records
  const [distributionRecords, setDistributionRecords] = useState([
    {
      id: 1,
      beneficiaryName: "Maria Rodriguez",
      itemsDistributed: "Winter Jackets",
      quantity: "5",
      location: "Downtown Shelter",
      date: "2024-01-10",
      status: "Completed",
    },
    {
      id: 2,
      beneficiaryName: "John Smith Family",
      itemsDistributed: "Food Packages",
      quantity: "3",
      location: "Community Center",
      date: "2024-01-09",
      status: "Completed",
    },
    {
      id: 3,
      beneficiaryName: "Sarah Johnson",
      itemsDistributed: "Blankets",
      quantity: "10",
      location: "North District",
      date: "2024-01-08",
      status: "Completed",
    },
  ]);

  const handleAddDistribution = () => {
    if (!distributionData.beneficiaryName || !distributionData.itemsDistributed || !distributionData.quantity) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const newRecord = {
      id: distributionRecords.length + 1,
      ...distributionData,
      status: "Completed",
    };

    setDistributionRecords([newRecord, ...distributionRecords]);
    setDistributionData({
      beneficiaryName: "",
      itemsDistributed: "",
      quantity: "",
      location: "",
      date: new Date().toISOString().split('T')[0],
    });
    setIsAddModalVisible(false);
    Alert.alert("Success", "Distribution record added successfully!");
  };

  const handleInputChange = (field: string, value: string) => {
    setDistributionData({ ...distributionData, [field]: value });
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
        <Text style={styles.headerTitle}>Distribution Tracking</Text>
        <TouchableOpacity
          onPress={() => setIsAddModalVisible(true)}
          style={styles.addButton}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Event Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{eventData.name}</Text>
          <Text style={styles.eventSubtitle}>Distribution Progress</Text>
        </View>

        {/* Progress Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Package size={24} color="#e60000" />
            <Text style={styles.statValue}>
              {eventData.distributedItems}/{eventData.totalItems}
            </Text>
            <Text style={styles.statLabel}>Items Distributed</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(eventData.distributedItems / eventData.totalItems) * 100}%` }
                ]}
              />
            </View>
          </View>
          <View style={styles.statCard}>
            <Users size={24} color="#e60000" />
            <Text style={styles.statValue}>
              {eventData.reachedBeneficiaries}/{eventData.totalBeneficiaries}
            </Text>
            <Text style={styles.statLabel}>Beneficiaries Reached</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(eventData.reachedBeneficiaries / eventData.totalBeneficiaries) * 100}%` }
                ]}
              />
            </View>
          </View>
        </View>

        {/* Target Completion */}
        <View style={styles.completionCard}>
          <TrendingUp size={20} color="#22c55e" />
          <Text style={styles.completionText}>
            Target Completion: {eventData.targetCompletion}
          </Text>
        </View>

        {/* Distribution Records */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribution Records</Text>

          {distributionRecords.map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordTitle}>{record.beneficiaryName}</Text>
                <View style={[styles.statusBadge, {
                  backgroundColor: record.status === "Completed" ? "#dcfce7" : "#fef3c7"
                }]}>
                  <CheckCircle size={12} color={record.status === "Completed" ? "#166534" : "#92400e"} />
                  <Text style={[styles.statusText, {
                    color: record.status === "Completed" ? "#166534" : "#92400e"
                  }]}>
                    {record.status}
                  </Text>
                </View>
              </View>

              <View style={styles.recordDetails}>
                <View style={styles.detailRow}>
                  <Package size={16} color="#6b7280" />
                  <Text style={styles.detailText}>
                    {record.itemsDistributed} ({record.quantity} items)
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <MapPin size={16} color="#6b7280" />
                  <Text style={styles.detailText}>{record.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Calendar size={16} color="#6b7280" />
                  <Text style={styles.detailText}>{record.date}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Distribution Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Distribution Record</Text>

            <TextInput
              style={styles.input}
              placeholder="Beneficiary Name"
              value={distributionData.beneficiaryName}
              onChangeText={(text) => handleInputChange("beneficiaryName", text)}
            />

            <TextInput
              style={styles.input}
              placeholder="Items Distributed"
              value={distributionData.itemsDistributed}
              onChangeText={(text) => handleInputChange("itemsDistributed", text)}
            />

            <TextInput
              style={styles.input}
              placeholder="Quantity"
              value={distributionData.quantity}
              onChangeText={(text) => handleInputChange("quantity", text)}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Location"
              value={distributionData.location}
              onChangeText={(text) => handleInputChange("location", text)}
            />

            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              value={distributionData.date}
              onChangeText={(text) => handleInputChange("date", text)}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsAddModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddDistribution}
              >
                <Text style={styles.saveButtonText}>Add Record</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  addButton: {
    padding: 8,
    backgroundColor: "#1A5F7A",
    borderRadius: 8,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  eventSubtitle: {
    fontSize: 14,
    color: "#fff",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
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
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 12,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#e60000",
    borderRadius: 2,
  },
  completionCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  completionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#166534",
    marginLeft: 8,
  },
  recordCard: {
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
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  recordDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 14,
    color: "#1f2937",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#1A5F7A",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
