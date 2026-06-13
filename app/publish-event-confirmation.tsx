import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  CheckCircle,
  Calendar,
  MapPin,
  Users,
} from "lucide-react-native";

export default function PublishEventConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    targetParticipants?: string;
  }>();

  function goToDashboard() {
    router.replace("/ngo-home");
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <CheckCircle size={64} color="#22c55e" />
          <Text style={styles.successTitle}>Event Created!</Text>
          <Text style={styles.successSubtitle}>
            Your event is live and visible on your dashboard.
          </Text>
        </View>

        {/* Event Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{params.name || "Untitled Event"}</Text>

          {!!params.location && (
            <View style={styles.detailRow}>
              <MapPin size={16} color="#6b7280" />
              <Text style={styles.detailValue}>{params.location}</Text>
            </View>
          )}

          {!!params.startDate && (
            <View style={styles.detailRow}>
              <Calendar size={16} color="#6b7280" />
              <Text style={styles.detailValue}>
                {params.endDate
                  ? `${params.startDate} → ${params.endDate}`
                  : params.startDate}
              </Text>
            </View>
          )}

          {!!params.targetParticipants && Number(params.targetParticipants) > 0 && (
            <View style={styles.detailRow}>
              <Users size={16} color="#6b7280" />
              <Text style={styles.detailValue}>
                Target: {params.targetParticipants} participants
              </Text>
            </View>
          )}

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Status: Upcoming</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.doneButton} onPress={goToDashboard}>
          <Text style={styles.doneButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A5F7A",
  },
  content: {
    padding: 20,
    paddingTop: 60,
    flexGrow: 1,
    justifyContent: "center",
  },
  successIcon: {
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#B2D8E8",
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  detailValue: {
    fontSize: 14,
    color: "#6b7280",
    flex: 1,
  },
  statusBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#eab308",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  doneButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#1A5F7A",
    fontSize: 16,
    fontWeight: "bold",
  },
});