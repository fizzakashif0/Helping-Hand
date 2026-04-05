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

  // If no eventId is provided, show a message
  if (!eventId) {
    return (
      <View style={styles.container}>
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
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#fff', fontSize: 18 }}>Event ID is required</Text>
        </View>
      </View>
    );
  }

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
          <View style={styles.sectionBox}>
            <OutlineText style={styles.description}>{eventData.description}</OutlineText>
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <Calendar size={20} color="#8B5CF6" />
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{eventData.date}</Text>
          </View>
          <View style={styles.detailCard}>
            <MapPin size={20} color="#8B5CF6" />
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{eventData.location}</Text>
          </View>
          <View style={styles.detailCard}>
            <Clock size={20} color="#8B5CF6" />
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{eventData.duration}</Text>
          </View>
          <View style={styles.detailCard}>
            <Target size={20} color="#8B5CF6" />
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
            <View style={styles.sectionBox}>
              <OutlineText style={styles.instructions}>{eventData.specialInstructions}</OutlineText>
            </View>
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
          <View style={styles.sectionBox}>
            <OutlineText style={styles.organizer}>{eventData.organizer}</OutlineText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleViewParticipants}>
            <Users size={20} color="#1f2937" />
            <Text style={styles.actionButtonText}>View Participants</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleTrackDistribution}>
            <Package size={20} color="#1f2937" />
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

function OutlineText({ children, style }: { children: React.ReactNode; style?: any }) {
  const offsets = [
    { left: -1, top: -1 },
    { left: -1, top: 1 },
    { left: 1, top: -1 },
    { left: 1, top: 1 },
  ];
  return (
    <View style={{ position: "relative" }}>
      {offsets.map((off, i) => (
        <Text
          key={i}
          style={[style, { position: "absolute", left: off.left, top: off.top, color: "#e60000" }]}
        >
          {children}
        </Text>
      ))}
      <Text style={style}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A5F7A",
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
    color: "#fff",
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
    color: "#fff",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#000000",
    lineHeight: 24,
  },
  descriptionBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionBox: {
  backgroundColor: "#ffffff",
  borderRadius: 12,
  padding: 16,

  borderWidth: 1.5,
  borderColor: "#e60000",

  elevation: 5,

  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.2,
  shadowRadius: 4,

  marginBottom: 8,
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
    color: "#000000",
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
    color: "#000000",
  },
  actionsSection: {
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: "#fff",
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
    backgroundColor: "#fff",
  },
  actionButtonText: {
    color: "#1f2937",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
