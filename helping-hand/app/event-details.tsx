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
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Package,
  Clock,
  Target,
  AlertTriangle,
} from "lucide-react-native";

export default function EventDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const eventId = params.id as string;

  // Mock event data - in a real app, this would be fetched based on eventId
  const eventData = {
    id: eventId,
    name: "Winter Relief Drive",
    description: "Providing warm clothing and food to families in need during the winter season. Join us in making a difference in our community.",
    date: "2024-01-15",
    location: "Community Center, Downtown",
    duration: "2 weeks",
    targetAmount: "15000",
    urgencyLevel: "High",
    specialInstructions: "Please bring warm clothing in good condition. Food donations should be non-perishable.",
    status: "Active",
    participants: 450,
    donations: 12500,
    organizer: "Green Earth Foundation",
  };

  const handleViewParticipants = () => {
    router.push("/event-participants" as any);
  };

  const handleTrackDistribution = () => {
    router.push("/event-distribution-tracking" as any);
  };

  const handleCompleteEvent = () => {
    router.push("/event-completion" as any);
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
        <Text style={styles.headerTitle}>Event Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Event Title and Status */}
        <View style={styles.titleSection}>
          <Text style={styles.eventTitle}>{eventData.name}</Text>
          <View style={[styles.statusBadge, {
            backgroundColor: eventData.status === "Active" ? "#dcfce7" : "#fee2e2"
          }]}>
            <Text style={[styles.statusText, {
              color: eventData.status === "Active" ? "#166534" : "#991b1b"
            }]}>
              {eventData.status}
            </Text>
          </View>
        </View>

        {/* Event Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{eventData.description}</Text>
        </View>

        {/* Event Details */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <Calendar size={20} color="#e60000" />
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{eventData.date}</Text>
          </View>
          <View style={styles.detailCard}>
            <MapPin size={20} color="#e60000" />
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{eventData.location}</Text>
          </View>
          <View style={styles.detailCard}>
            <Clock size={20} color="#e60000" />
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{eventData.duration}</Text>
          </View>
          <View style={styles.detailCard}>
            <Target size={20} color="#e60000" />
            <Text style={styles.detailLabel}>Target</Text>
            <Text style={styles.detailValue}>${eventData.targetAmount}</Text>
          </View>
        </View>

        {/* Urgency Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Urgency Level</Text>
          <View style={[styles.urgencyBadge, {
            backgroundColor: eventData.urgencyLevel === "High" ? "#fee2e2" :
                           eventData.urgencyLevel === "Medium" ? "#fef3c7" : "#dcfce7"
          }]}>
            <AlertTriangle size={16} color={
              eventData.urgencyLevel === "High" ? "#991b1b" :
              eventData.urgencyLevel === "Medium" ? "#92400e" : "#166534"
            } />
            <Text style={[styles.urgencyText, {
              color: eventData.urgencyLevel === "High" ? "#991b1b" :
                     eventData.urgencyLevel === "Medium" ? "#92400e" : "#166534"
            }]}>
              {eventData.urgencyLevel} Priority
            </Text>
          </View>
        </View>

        {/* Special Instructions */}
        {eventData.specialInstructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <Text style={styles.instructions}>{eventData.specialInstructions}</Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Current Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Users size={24} color="#e60000" />
              <Text style={styles.statValue}>{eventData.participants}</Text>
              <Text style={styles.statLabel}>Participants</Text>
            </View>
            <View style={styles.statCard}>
              <Package size={24} color="#e60000" />
              <Text style={styles.statValue}>${eventData.donations}</Text>
              <Text style={styles.statLabel}>Donations</Text>
            </View>
          </View>
        </View>

        {/* Organizer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organizer</Text>
          <Text style={styles.organizer}>{eventData.organizer}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleViewParticipants}>
            <Users size={20} color="#fff" />
            <Text style={styles.actionButtonText}>View Participants</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleTrackDistribution}>
            <Package size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Track Distribution</Text>
          </TouchableOpacity>

          {eventData.status === "Active" && (
            <TouchableOpacity style={[styles.actionButton, styles.completeButton]} onPress={handleCompleteEvent}>
              <Text style={styles.actionButtonText}>Complete Event</Text>
            </TouchableOpacity>
          )}
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
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  titleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 24,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "48%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
  },
  urgencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  instructions: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  organizer: {
    fontSize: 16,
    color: "#6b7280",
  },
  actionsSection: {
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: "#e60000",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButton: {
    backgroundColor: "#22c55e",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
