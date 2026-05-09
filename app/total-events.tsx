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
  CheckCircle,
  Circle,
} from "lucide-react-native";

export default function TotalEventsScreen() {
  const router = useRouter();

  // Mock data for all events (past and present)
  const allEvents = [
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
      id: 2,
      name: "Food Distribution",
      participants: 320,
      location: "Central Park",
      date: "2024-01-10",
      time: "11:00 AM",
      status: "Completed",
      description: "Distributing food packages to homeless shelters and low-income families.",
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
    {
      id: 4,
      name: "Education Support Program",
      participants: 150,
      location: "Local School",
      date: "2023-12-20",
      time: "2:00 PM",
      status: "Completed",
      description: "Providing educational materials and tutoring to underprivileged children.",
    },
    {
      id: 5,
      name: "Clean Water Initiative",
      participants: 200,
      location: "Rural Village",
      date: "2023-12-15",
      time: "8:00 AM",
      status: "Completed",
      description: "Installing water purification systems in rural areas lacking clean water access.",
    },
    {
      id: 6,
      name: "Elderly Care Program",
      participants: 120,
      location: "Senior Center",
      date: "2023-11-30",
      time: "10:00 AM",
      status: "Completed",
      description: "Providing care and companionship to elderly individuals in the community.",
    },
  ];

  const getStatusIcon = (status: string) => {
    return status === "Completed" ? (
      <CheckCircle size={16} color="#22c55e" />
    ) : (
      <Circle size={16} color="#f59e0b" />
    );
  };

  const getStatusColor = (status: string) => {
    return status === "Completed" ? "#22c55e" : "#f59e0b";
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
        <Text style={styles.headerTitle}>Total Events</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Events List */}
        {allEvents.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => (router.push as any)(`/event-details/${event.id}`)}
          >
            <View style={styles.eventHeader}>
              <Text style={styles.eventName}>{event.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
                {getStatusIcon(event.status)}
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

        {allEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Events Found</Text>
            <Text style={styles.emptyText}>
              There are no events to display at this time.
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
    backgroundColor: "#0E4A61",
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
    backgroundColor: "#ffffff22",
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
    color: "white",
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: "#ffffffaa",
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
    color: "#ffffffaa",
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
    color: "#ffffffaa",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#ffffffaa",
    textAlign: "center",
    lineHeight: 20,
  },
});
