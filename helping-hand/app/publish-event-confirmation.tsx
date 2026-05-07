import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  CheckCircle,
  Calendar,
  MapPin,
  Users,
  Package,
  Clock,
  AlertTriangle,
} from "lucide-react-native";

export default function PublishEventConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const handlePublish = () => {
    Alert.alert(
      "Event Published",
      "Your event has been successfully published and is now live!",
      [
        {
          text: "OK",
          onPress: () => router.push("/ngo-home"),
        },
      ]
    );
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
        <Text style={styles.headerTitle}>Confirm & Publish</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <CheckCircle size={64} color="#22c55e" />
        </View>

        {/* Event Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Event Summary</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Event Name:</Text>
            <Text style={styles.detailValue}>{params.name}</Text>
          </View>

          <View style={styles.detailRow}>
            <MapPin size={16} color="#6b7280" />
            <Text style={styles.detailValue}>{params.location}</Text>
          </View>

          <View style={styles.detailRow}>
            <Calendar size={16} color="#6b7280" />
            <Text style={styles.detailValue}>{params.date}</Text>
          </View>

          <View style={styles.detailRow}>
            <Clock size={16} color="#6b7280" />
            <Text style={styles.detailValue}>{params.duration}</Text>
          </View>

          <View style={styles.detailRow}>
            <Users size={16} color="#6b7280" />
            <Text style={styles.detailValue}>
              Target: {params.targetParticipants} participants
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Package size={16} color="#6b7280" />
            <Text style={styles.detailValue}>
              Donation Type: {params.donationType}
            </Text>
          </View>

          {params.targetAmount && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Target Amount:</Text>
              <Text style={styles.detailValue}>${params.targetAmount}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Urgency:</Text>
            <View
              style={[
                styles.urgencyBadge,
                {
                  backgroundColor:
                    params.urgencyLevel === "High" || params.urgencyLevel === "Critical"
                      ? "#ef4444"
                      : params.urgencyLevel === "Medium"
                      ? "#f59e0b"
                      : "#22c55e",
                },
              ]}
            >
              <Text style={styles.urgencyText}>{params.urgencyLevel}</Text>
            </View>
          </View>

          {params.specialInstructions && (
            <View style={styles.instructionsSection}>
              <Text style={styles.detailLabel}>Special Instructions:</Text>
              <Text style={styles.instructionsText}>
                {params.specialInstructions}
              </Text>
            </View>
          )}
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <AlertTriangle size={20} color="#f59e0b" />
          <Text style={styles.warningText}>
            Once published, the event will be visible to all users. You can still edit some details later, but major changes may require republishing.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.back()}
          >
            <Text style={styles.editButtonText}>Edit Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.publishButton}
            onPress={handlePublish}
          >
            <Text style={styles.publishButtonText}>Publish Event</Text>
          </TouchableOpacity>
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
  successIcon: {
    alignItems: "center",
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: "#6b7280",
    flex: 1,
    marginLeft: 8,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  instructionsSection: {
    marginTop: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: "#fef3c7",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: "#92400e",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e60000",
  },
  editButtonText: {
    color: "#e60000",
    fontSize: 16,
    fontWeight: "600",
  },
  publishButton: {
    flex: 1,
    backgroundColor: "#e60000",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  publishButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
