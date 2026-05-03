import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, MapPin, Users, FileText } from "lucide-react-native";

export default function CreateEventScreen() {
  const router = useRouter();
  const [eventData, setEventData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    targetParticipants: "",
  });

  const handleSubmit = () => {
    // Basic validation
    if (!eventData.name || !eventData.description || !eventData.date || !eventData.location || !eventData.targetParticipants) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // In a real app, this would save to backend
    Alert.alert("Success", "Event created successfully!", [
      {
        text: "OK",
        onPress: () => router.push("/publish-event-confirmation" as any),
      },
    ]);
  };

  const updateField = (field: string, value: string) => {
    setEventData(prev => ({ ...prev, [field]: value }));
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
        <Text style={styles.headerTitle}>Create Event</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Form Fields */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Event Details</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <FileText size={20} color="#e60000" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Event Name"
              value={eventData.name}
              onChangeText={(value) => updateField("name", value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <FileText size={20} color="#e60000" />
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Event Description"
              value={eventData.description}
              onChangeText={(value) => updateField("description", value)}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Calendar size={20} color="#e60000" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Event Date (YYYY-MM-DD)"
              value={eventData.date}
              onChangeText={(value) => updateField("date", value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <MapPin size={20} color="#e60000" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={eventData.location}
              onChangeText={(value) => updateField("location", value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Users size={20} color="#e60000" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Target Participants"
              value={eventData.targetParticipants}
              onChangeText={(value) => updateField("targetParticipants", value)}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Create Event</Text>
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
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  formSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 20,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    color: "#1f2937",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#1A5F7A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
