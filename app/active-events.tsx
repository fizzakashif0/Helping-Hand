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
  Calendar,
  Users,
  MapPin,
  Clock,
} from "lucide-react-native";

export default function ActiveEventsScreen() {
  const router = useRouter();

  // Mock data for active events
  const activeEvents = [
    {
      id: 1,
      name: "Winter Relief Drive",
      participants: 450,
      location: "Downtown Community Center",
      date: "2024-01-15",
      time: "10:00 AM",
      status: "Active",
      description: "Providing warm clothing and food supplies to families in need during the winter season.",
    },
    {
      id: 3,
      name: "Medical Aid Camp",
      participants: 280,
      location: "City Hospital Grounds",
      date: "2024-01-20",
      time: "9:00 AM",
      status: "Active",
      description: "Free medical check-ups, vaccinations, and health consultations for underprivileged communities.",
    },
  ];

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
        <Text style={styles.headerTitle}>Active Events</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Events List */}
        {activeEvents.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => (router.push as any)(`/event-details/${event.id}`)}
          >
            <View style={styles.eventHeader}>
              <Text style={styles.eventName}>{event.name}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{event.status}</Text>
              </View>
            </View>

            <Text style={styles.eventDescription}>{event.description}</Text>

            <View style={styles.eventDetails}>
              <View style={styles.detailItem}>
                <Calendar size={16} color="#6b7280" />
                <Text style={styles.detailText}>{event.date}</Text>
              </View>
              <View style={styles.detailItem}>
                <Clock size={16} color="#6b7280" />
                <Text style={styles.detailText}>{event.time}</Text>
              </View>
            </View>

            <View style={styles.eventDetails}>
              <View style={styles.detailItem}>
                <MapPin size={16} color="#6b7280" />
                <Text style={styles.detailText}>{event.location}</Text>
              </View>
              <View style={styles.detailItem}>
                <Users size={16} color="#6b7280" />
                <Text style={styles.detailText}>{event.participants} participants</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {activeEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Active Events</Text>
            <Text style={styles.emptyText}>
              There are currently no active events. Check back later for upcoming events.
            </Text>
          </View>
        )}
      </ScrollView>
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
  content: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  eventName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
  },
  statusBadge: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  eventDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 16,
  },
  eventDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6b7280",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 20,
  },
});
