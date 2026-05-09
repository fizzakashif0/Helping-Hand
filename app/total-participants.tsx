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
  User,
  Mail,
  Calendar,
  MapPin,
  Award,
  Heart,
} from "lucide-react-native";

export default function TotalParticipantsScreen() {
  const router = useRouter();

  // Mock data for all participants
  const allParticipants = [
    {
      id: 1,
      name: "John Donor",
      email: "john.donor@example.com",
      joinedDate: "Jan 2024",
      location: "New York, NY",
      totalDonations: 45,
      eventsParticipated: 12,
      impactScore: 92,
      avatar: "JD",
    },
    {
      id: 2,
      name: "Sarah Volunteer",
      email: "sarah.volunteer@example.com",
      joinedDate: "Dec 2023",
      location: "Los Angeles, CA",
      totalDonations: 28,
      eventsParticipated: 8,
      impactScore: 85,
      avatar: "SV",
    },
    {
      id: 3,
      name: "Mike Helper",
      email: "mike.helper@example.com",
      joinedDate: "Nov 2023",
      location: "Chicago, IL",
      totalDonations: 67,
      eventsParticipated: 15,
      impactScore: 95,
      avatar: "MH",
    },
    {
      id: 4,
      name: "Emma Contributor",
      email: "emma.contributor@example.com",
      joinedDate: "Oct 2023",
      location: "Houston, TX",
      totalDonations: 34,
      eventsParticipated: 10,
      impactScore: 88,
      avatar: "EC",
    },
    {
      id: 5,
      name: "David Supporter",
      email: "david.supporter@example.com",
      joinedDate: "Sep 2023",
      location: "Phoenix, AZ",
      totalDonations: 52,
      eventsParticipated: 14,
      impactScore: 90,
      avatar: "DS",
    },
    {
      id: 6,
      name: "Lisa Benefactor",
      email: "lisa.benefactor@example.com",
      joinedDate: "Aug 2023",
      location: "Philadelphia, PA",
      totalDonations: 78,
      eventsParticipated: 18,
      impactScore: 97,
      avatar: "LB",
    },
  ];

  const getImpactColor = (score: number) => {
    if (score >= 90) return "#22c55e";
    if (score >= 80) return "#f59e0b";
    return "#ef4444";
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
        <Text style={styles.headerTitle}>Total Participants</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Participants List */}
        {allParticipants.map((participant) => (
          <TouchableOpacity
            key={participant.id}
            style={styles.participantCard}
            onPress={() => (router.push as any)(`/participant-profile/${participant.id}`)}
          >
            <View style={styles.participantHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{participant.avatar}</Text>
              </View>
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>{participant.name}</Text>
                <Text style={styles.participantEmail}>{participant.email}</Text>
                <Text style={styles.participantJoined}>
                  Joined {participant.joinedDate}
                </Text>
              </View>
            </View>

            <View style={styles.participantDetails}>
              <View style={styles.detailItem}>
                <MapPin size={16} color="#6b7280" />
                <Text style={styles.detailText}>{participant.location}</Text>
              </View>
              <View style={styles.detailItem}>
                <Calendar size={16} color="#6b7280" />
                <Text style={styles.detailText}>
                  {participant.eventsParticipated} events
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Heart size={16} color="#1A5F7A" />
                <Text style={styles.statValue}>{participant.totalDonations}</Text>
                <Text style={styles.statLabel}>Donations</Text>
              </View>
              <View style={styles.statItem}>
                <Award size={16} color={getImpactColor(participant.impactScore)} />
                <Text style={styles.statValue}>{participant.impactScore}%</Text>
                <Text style={styles.statLabel}>Impact</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {allParticipants.length === 0 && (
          <View style={styles.emptyState}>
            <User size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Participants Found</Text>
            <Text style={styles.emptyText}>
              There are no participants to display at this time.
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
  participantCard: {
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
  participantHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1A5F7A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  participantEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  participantJoined: {
    fontSize: 12,
    color: "#9ca3af",
  },
  participantDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
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
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
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
