import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Search, User, Phone, Mail } from "lucide-react-native";

export default function EventParticipantsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock participants data
  const participants = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1 234 567 8900",
      registrationDate: "2024-01-10",
      status: "confirmed",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+1 234 567 8901",
      registrationDate: "2024-01-11",
      status: "confirmed",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@email.com",
      phone: "+1 234 567 8902",
      registrationDate: "2024-01-12",
      status: "pending",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah.wilson@email.com",
      phone: "+1 234 567 8903",
      registrationDate: "2024-01-13",
      status: "confirmed",
    },
  ];

  const filteredParticipants = participants.filter(participant =>
    participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    participant.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderParticipant = ({ item }: { item: typeof participants[0] }) => (
    <View style={styles.participantCard}>
      <View style={styles.participantHeader}>
        <View style={styles.participantInfo}>
          <Text style={styles.participantName}>{item.name}</Text>
          <View style={[styles.statusBadge, {
            backgroundColor: item.status === "confirmed" ? "#dcfce7" : "#fef3c7"
          }]}>
            <Text style={[styles.statusText, {
              color: item.status === "confirmed" ? "#166534" : "#92400e"
            }]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.participantDetails}>
        <View style={styles.detailRow}>
          <Mail size={16} color="#6b7280" />
          <Text style={styles.detailText}>{item.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Phone size={16} color="#6b7280" />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
        <Text style={styles.registrationDate}>
          Registered: {item.registrationDate}
        </Text>
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
        <Text style={styles.headerTitle}>Event Participants</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search participants..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Participants List */}
      <FlatList
        data={filteredParticipants}
        renderItem={renderParticipant}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          Total Participants: {participants.length} | Confirmed: {participants.filter(p => p.status === "confirmed").length}
        </Text>
      </View>
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
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  participantCard: {
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
  participantHeader: {
    marginBottom: 12,
  },
  participantInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  participantName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
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
  participantDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
  },
  registrationDate: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  summaryContainer: {
    padding: 20,
    paddingTop: 0,
    alignItems: "center",
  },
  summaryText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
});
