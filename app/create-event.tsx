import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { getToken } from "./lib/token";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  FileText,
  Save,
} from "lucide-react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

export default function CreateEventScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState("");     // YYYY-MM-DD, optional
  const [targetParticipants, setTargetParticipants] = useState("");
  const [saving, setSaving] = useState(false);

  function validate(): string | null {
    if (!name.trim()) return "Event name is required.";
    if (!startDate.trim()) return "Start date is required.";

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate.trim())) {
      return "Start date must be in YYYY-MM-DD format.";
    }
    if (endDate.trim() && !dateRegex.test(endDate.trim())) {
      return "End date must be in YYYY-MM-DD format.";
    }
    if (endDate.trim() && endDate.trim() < startDate.trim()) {
      return "End date cannot be before start date.";
    }
    if (targetParticipants.trim()) {
      const n = Number(targetParticipants.trim());
      if (!Number.isFinite(n) || n < 0) {
        return "Target participants must be a positive number.";
      }
    }
    return null;
  }

  async function handleCreate() {
    const validationError = validate();
    if (validationError) {
      Alert.alert("Check your input", validationError);
      return;
    }

    try {
      setSaving(true);
      const token = await getToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          location: location.trim(),
          startDate: startDate.trim(),
          endDate: endDate.trim() || undefined,
          targetParticipants: targetParticipants.trim() ? Number(targetParticipants.trim()) : 0,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        Alert.alert("Error", err.message || "Failed to create event");
        return;
      }

      const data = await res.json();
      const event = data.event;

      router.push({
        pathname: "/publish-event-confirmation" as any,
        params: {
          name: event?.name || name.trim(),
          location: event?.location || location.trim(),
          startDate: event?.startDate
            ? new Date(event.startDate).toISOString().split("T")[0]
            : startDate.trim(),
          endDate: event?.endDate
            ? new Date(event.endDate).toISOString().split("T")[0]
            : endDate.trim(),
          targetParticipants: String(event?.targetParticipants ?? targetParticipants.trim() ?? "0"),
        },
      });
    } catch (err) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Event Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Winter Food Drive"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholder="Describe the event, its goals, and what's needed..."
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Location</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color="#6b7280" style={styles.icon} />
              <TextInput
                style={styles.inputWithIconText}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Community Center, Main St"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Start Date *</Text>
            <View style={styles.inputWithIcon}>
              <Calendar size={20} color="#6b7280" style={styles.icon} />
              <TextInput
                style={styles.inputWithIconText}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>End Date</Text>
            <View style={styles.inputWithIcon}>
              <Calendar size={20} color="#6b7280" style={styles.icon} />
              <TextInput
                style={styles.inputWithIconText}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD (optional)"
                placeholderTextColor="#9CA3AF"
                keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Target Participants</Text>
            <View style={styles.inputWithIcon}>
              <Users size={20} color="#6b7280" style={styles.icon} />
              <TextInput
                style={styles.inputWithIconText}
                value={targetParticipants}
                onChangeText={setTargetParticipants}
                placeholder="e.g. 20 (optional)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <FileText size={18} color="#1A5F7A" />
          <Text style={styles.infoText}>
            New events start with "Upcoming" status. You can update the status
            once the event begins or ends from the event details screen.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleCreate}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Save size={22} color="#fff" />
          )}
          <Text style={styles.saveButtonText}>
            {saving ? "Creating..." : "Create Event"}
          </Text>
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
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A5F7A",
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    color: "#1f2937",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  icon: {
    marginLeft: 12,
  },
  inputWithIconText: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#ffffff22",
    borderRadius: 12,
    padding: 16,
    gap: 10,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#ffffffdd",
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: "#22c55e",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#86efac",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});