import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Building2,
  CheckCircle,
  HandHeart,
} from "lucide-react-native";
import { getToken } from "../lib/token";
import { getUserRole } from "../store/userStore";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

interface EventDetail {
  _id: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  targetParticipants: number;
  participants: number;
  participantIds: string[];
  ngoName: string;
  ngoId: string;
}

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const userRole = getUserRole();

  useEffect(() => {
    if (id) {
      fetchEvent();
      fetchCurrentUser();
    }
  }, [id]);

  async function fetchEvent() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/events/public/${id}`);
      if (!res.ok) {
        Alert.alert("Error", "Event not found");
        router.back();
        return;
      }
      const data = await res.json();
      setEvent(data.event);
    } catch (_) {
      Alert.alert("Error", "Failed to load event");
      router.back();
    } finally {
      setLoading(false);
    }
  }

 async function fetchCurrentUser() {
  try {
    const token = await getToken();
    if (!token) return;
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      // Handle both response shapes
      const uid = data._id || data.id || data.user?._id || data.user?.id;
      setCurrentUserId(uid);
    }
  } catch (_) {}
}

  // Once both event and currentUserId are set, check joined status
  useEffect(() => {
    if (event && currentUserId) {
      setHasJoined(event.participantIds.includes(currentUserId));
    }
  }, [event, currentUserId]);

 async function handleJoin() {
  try {
    setJoining(true);
    const token = await getToken();
    if (!token) { router.replace("/login"); return; }

    const res = await fetch(`${API_URL}/api/events/${id}/join`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) { Alert.alert("Error", data.message || "Failed"); return; }

    // Server now tells us the truth
    setHasJoined(data.joined);
    setEvent(prev => prev ? {
      ...prev,
      participants: data.participants,
      participantIds: data.participantIds,
    } : prev);

    Alert.alert(data.joined ? "Joined!" : "Left", data.message);
  } catch (_) {
    Alert.alert("Error", "Network error. Please try again.");
  } finally {
    setJoining(false);
  }
}

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading event...</Text>
      </View>
    );
  }

  if (!event) return null;

  const statusColor =
    event.status === "active" ? "#22c55e" :
    event.status === "upcoming" ? "#eab308" :
    event.status === "completed" ? "#3b82f6" : "#ef4444";

  const progressPct = event.targetParticipants > 0
    ? Math.min((event.participants / event.targetParticipants) * 100, 100)
    : 0;

  const isNGO = userRole?.toLowerCase() === "ngo";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Title + Status */}
        <View style={styles.titleRow}>
          <Text style={styles.eventTitle}>{event.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{event.status}</Text>
          </View>
        </View>

        {/* NGO */}
        <View style={styles.ngoRow}>
          <Building2 size={16} color="#B2D8E8" />
          <Text style={styles.ngoName}>{event.ngoName}</Text>
        </View>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          {event.startDate ? (
            <View style={styles.detailCard}>
              <Calendar size={20} color="#1A5F7A" />
              <Text style={styles.detailLabel}>Start Date</Text>
              <Text style={styles.detailValue}>{event.startDate}</Text>
            </View>
          ) : null}
          {event.endDate ? (
            <View style={styles.detailCard}>
              <Clock size={20} color="#1A5F7A" />
              <Text style={styles.detailLabel}>End Date</Text>
              <Text style={styles.detailValue}>{event.endDate}</Text>
            </View>
          ) : null}
          {event.location ? (
            <View style={styles.detailCard}>
              <MapPin size={20} color="#1A5F7A" />
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{event.location}</Text>
            </View>
          ) : null}
          <View style={styles.detailCard}>
            <Users size={20} color="#1A5F7A" />
            <Text style={styles.detailLabel}>Participants</Text>
            <Text style={styles.detailValue}>
              {event.participants}{event.targetParticipants > 0 ? ` / ${event.targetParticipants}` : ''}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        {event.targetParticipants > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progressPct)}% of target reached
            </Text>
          </View>
        )}

        {/* Description */}
        {event.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this Event</Text>
            <View style={styles.sectionBox}>
              <Text style={styles.descriptionText}>{event.description}</Text>
            </View>
          </View>
        ) : null}

       {/* Action Buttons */}
<View style={styles.actionsSection}>

  {/* Donor — Join / Leave */}
  {userRole === "donor" && (
    hasJoined ? (
      <View style={{ gap: 10 }}>
        <View style={styles.joinedBadge}>
          <CheckCircle size={20} color="#22c55e" />
          <Text style={styles.joinedText}>You've joined this event</Text>
        </View>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: '#ef4444' }, joining && styles.btnDisabled]}
          onPress={handleJoin}
          disabled={joining}
        >
          <Text style={styles.primaryBtnText}>{joining ? "Leaving..." : "Leave Event"}</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <TouchableOpacity
        style={[styles.primaryBtn, joining && styles.btnDisabled]}
        onPress={handleJoin}
        disabled={joining}
      >
        {joining ? <ActivityIndicator size="small" color="#fff" /> : <Users size={20} color="#fff" />}
        <Text style={styles.primaryBtnText}>{joining ? "Joining..." : "Join as Volunteer"}</Text>
      </TouchableOpacity>
    )
  )}

          {/* Recipient — Apply for help */}
          {userRole === "recipient" && (
            hasJoined ? (
              <View style={styles.joinedBadge}>
                <CheckCircle size={20} color="#22c55e" />
                <Text style={styles.joinedText}>You've applied for this event</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.primaryBtn, styles.applyBtn, joining && styles.btnDisabled]}
                onPress={handleJoin}
                disabled={joining}
              >
                {joining
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <HandHeart size={20} color="#fff" />
                }
                <Text style={styles.primaryBtnText}>
                  {joining ? "Applying..." : "Apply for Help"}
                </Text>
              </TouchableOpacity>
            )
          )}

          {/* NGO — no action (they own events) */}
          {isNGO && (
            <View style={styles.ngoNote}>
              <Text style={styles.ngoNoteText}>
                This is a public view of the event as seen by donors and recipients.
              </Text>
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A5F7A",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#1A5F7A",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
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
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 12,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  ngoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  ngoName: {
    color: "#B2D8E8",
    fontSize: 14,
    fontWeight: "500",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 6,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
  },
  progressSection: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#ffffff33",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 4,
  },
  progressText: {
    color: "#B2D8E8",
    fontSize: 12,
    textAlign: "right",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
  },
  sectionBox: {
    backgroundColor: "#ffffff15",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ffffff22",
  },
  descriptionText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
  },
  actionsSection: {
    marginTop: 8,
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: "#22c55e",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 3,
  },
  applyBtn: {
    backgroundColor: "#7C3AED",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  joinedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ffffff15",
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  joinedText: {
    color: "#22c55e",
    fontSize: 15,
    fontWeight: "600",
  },
  ngoNote: {
    backgroundColor: "#ffffff15",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ffffff22",
  },
  ngoNoteText: {
    color: "#B2D8E8",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});