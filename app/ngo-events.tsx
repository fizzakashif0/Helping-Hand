import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArrowLeft,
  Plus,
  Calendar,
  MapPin,
  Users,
  Trash2,
  ChevronDown,
} from "lucide-react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

interface EventItem {
  _id: string;
  name: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  status: "upcoming" | "active" | "completed" | "cancelled";
  targetParticipants?: number;
  participants?: string[];
  donations?: string[];
}

const STATUS_OPTIONS: EventItem["status"][] = [
  "upcoming",
  "active",
  "completed",
  "cancelled",
];

const STATUS_COLORS: Record<EventItem["status"], string> = {
  upcoming: "#eab308",
  active: "#22c55e",
  completed: "#3b82f6",
  cancelled: "#ef4444",
};

export default function NGOEventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusMenuFor, setStatusMenuFor] = useState<string | null>(null);

  const loadEvents = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/events/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.message || "Failed to load events");
        return;
      }

      const data = await res.json();
      setEvents(data.events ?? []);
    } catch (_) {
      setError("Network error. Pull down to retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Refresh whenever the screen regains focus (e.g. after creating an event)
  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  async function updateStatus(eventId: string, status: EventItem["status"]) {
    try {
      setUpdatingId(eventId);
      setStatusMenuFor(null);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const err = await res.json();
        Alert.alert("Error", err.message || "Failed to update event");
        return;
      }

      const data = await res.json();
      setEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, status: data.event.status } : e))
      );
    } catch (_) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  function confirmDelete(eventId: string, name: string) {
    Alert.alert(
      "Delete Event",
      `Are you sure you want to delete "${name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteEvent(eventId) },
      ]
    );
  }

  async function deleteEvent(eventId: string) {
    try {
      setUpdatingId(eventId);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        Alert.alert("Error", err.message || "Failed to delete event");
        return;
      }

      setEvents((prev) => prev.filter((e) => e._id !== eventId));
    } catch (_) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  function formatDateRange(start: string, end?: string) {
    const s = start ? new Date(start).toISOString().split("T")[0] : "";
    if (!end) return s;
    const e = new Date(end).toISOString().split("T")[0];
    return `${s} → ${e}`;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Events</Text>
        <TouchableOpacity
          onPress={() => (router.push as any)("/create-event")}
          style={styles.iconButton}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadEvents(true)}
            tintColor="#fff"
            colors={["#fff"]}
          />
        }
      >
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {events.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>You haven't created any events yet.</Text>
            <TouchableOpacity onPress={() => (router.push as any)("/create-event")}>
              <Text style={styles.emptyLink}>Create your first event →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          events.map((event) => (
            <View key={event._id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventName} numberOfLines={1}>
                  {event.name}
                </Text>

                {/* Status dropdown trigger */}
                <TouchableOpacity
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[event.status] },
                  ]}
                  onPress={() =>
                    setStatusMenuFor(statusMenuFor === event._id ? null : event._id)
                  }
                  disabled={updatingId === event._id}
                >
                  {updatingId === event._id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.statusText}>{event.status}</Text>
                      <ChevronDown size={14} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Status options menu */}
              {statusMenuFor === event._id && (
                <View style={styles.statusMenu}>
                  {STATUS_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.statusOption}
                      onPress={() => updateStatus(event._id, option)}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: STATUS_COLORS[option] },
                        ]}
                      />
                      <Text style={styles.statusOptionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {!!event.description && (
                <Text style={styles.eventDescription} numberOfLines={2}>
                  {event.description}
                </Text>
              )}

              <View style={styles.eventDetails}>
                {!!event.startDate && (
                  <View style={styles.detailItem}>
                    <Calendar size={14} color="#6b7280" />
                    <Text style={styles.detailText}>
                      {formatDateRange(event.startDate, event.endDate)}
                    </Text>
                  </View>
                )}
                {!!event.location && (
                  <View style={styles.detailItem}>
                    <MapPin size={14} color="#6b7280" />
                    <Text style={styles.detailText} numberOfLines={1}>
                      {event.location}
                    </Text>
                  </View>
                )}
                <View style={styles.detailItem}>
                  <Users size={14} color="#6b7280" />
                  <Text style={styles.detailText}>
                    {event.participants?.length || 0}
                    {event.targetParticipants ? ` / ${event.targetParticipants}` : ""} participants
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => confirmDelete(event._id, event.name)}
                disabled={updatingId === event._id}
              >
                <Trash2 size={16} color="#ef4444" />
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
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
  iconButton: {
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
  errorBanner: {
    backgroundColor: "#EF444433",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  emptyCard: {
    backgroundColor: "#ffffff22",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#ffffffcc",
  },
  emptyLink: {
    fontSize: 14,
    color: "#B2D8E8",
    fontWeight: "600",
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
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
    marginBottom: 8,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    minWidth: 80,
    justifyContent: "center",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  statusMenu: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 8,
    overflow: "hidden",
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusOptionText: {
    fontSize: 14,
    color: "#1f2937",
    textTransform: "capitalize",
  },
  eventDescription: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 10,
    lineHeight: 18,
  },
  eventDetails: {
    gap: 6,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#6b7280",
    flex: 1,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 4,
  },
  deleteText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "600",
  },
});