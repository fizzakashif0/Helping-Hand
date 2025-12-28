import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface CreateHelpRequestFormProps {
  onSubmit: () => void;
  onBack: () => void;
}

export default function CreateHelpRequestForm({
  onSubmit,
  onBack,
}: CreateHelpRequestFormProps) {
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
    quantity: "",
    location: "",
    urgency: "medium",
  });

  const requestTypes = [
    { value: "food", label: "Food", icon: "🍽️" },
    { value: "clothes", label: "Clothes", icon: "👕" },
    { value: "medical", label: "Medical", icon: "💊" },
    { value: "financial", label: "Financial", icon: "💰" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backRow} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.headerTitle}>Request Help</Text>
        </TouchableOpacity>
        <Text style={styles.headerSubtitle}>
          Let us know how we can help you
        </Text>
      </View>

      {/* Privacy Notice */}
      <View style={styles.card}>
        <View style={styles.privacyRow}>
          <Ionicons name="shield-checkmark" size={20} color="#1A5F7A" />
          <View style={{ flex: 1 }}>
            <Text style={styles.privacyTitle}>Your Privacy Matters</Text>
            <Text style={styles.privacyText}>
              Your request is confidential. Only approved donors will see your
              details.
            </Text>
          </View>
        </View>
      </View>

      {/* Request Type */}
      <View style={styles.card}>
        <Text style={styles.label}>What kind of help do you need?</Text>
        <View style={styles.typeGrid}>
          {requestTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeBox,
                formData.type === type.value && styles.typeBoxActive,
              ]}
              onPress={() =>
                setFormData({ ...formData, type: type.value })
              }
            >
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text style={styles.typeText}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Title */}
      <View style={styles.card}>
        <Text style={styles.label}>Brief Description</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Need groceries for family"
          value={formData.title}
          onChangeText={(text) =>
            setFormData({ ...formData, title: text })
          }
        />
      </View>

      {/* Description */}
      <View style={styles.card}>
        <Text style={styles.label}>Detailed Information</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          placeholder="Please share more details about your situation..."
          value={formData.description}
          onChangeText={(text) =>
            setFormData({ ...formData, description: text })
          }
        />
        <Text style={styles.helperText}>
          The more details you provide, the easier it is for donors to help
        </Text>
      </View>

      {/* Quantity */}
      <View style={styles.card}>
        <Text style={styles.label}>Quantity / Amount Needed</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., For 4 people, $200, 3 bags"
          value={formData.quantity}
          onChangeText={(text) =>
            setFormData({ ...formData, quantity: text })
          }
        />
      </View>

      {/* Location */}
      <View style={styles.card}>
        <Text style={styles.label}>Your Area</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={20} color="#888" />
          <TextInput
            style={[styles.input, { flex: 1, marginLeft: 8 }]}
            placeholder="Enter your area or neighborhood"
            value={formData.location}
            onChangeText={(text) =>
              setFormData({ ...formData, location: text })
            }
          />
        </View>
        <Text style={styles.helperText}>
          Only your general area will be shown to donors
        </Text>
      </View>

      {/* Urgency */}
      <View style={styles.card}>
        <Text style={styles.label}>How urgent is this?</Text>
        <View style={styles.urgencyRow}>
          {[
            { value: "low", label: "Can Wait" },
            { value: "medium", label: "This Week" },
            { value: "high", label: "Urgent" },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.urgencyBtn,
                formData.urgency === option.value && styles.urgencyActive,
              ]}
              onPress={() =>
                setFormData({ ...formData, urgency: option.value })
              }
            >
              <Text
                style={[
                  styles.urgencyText,
                  formData.urgency === option.value &&
                    styles.urgencyTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[
          styles.submitBtn,
          (!formData.type ||
            !formData.title ||
            !formData.description) && { opacity: 0.5 },
        ]}
        disabled={!formData.type || !formData.title || !formData.description}
        onPress={onSubmit}
      >
        <Text style={styles.submitText}>Submit Request</Text>
      </TouchableOpacity>

      {/* Cancel */}
      <TouchableOpacity style={styles.cancelBtn} onPress={onBack}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#1A5F7A",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  headerSubtitle: {
    color: "#d0e4ee",
    marginTop: 6,
    marginLeft: 34,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  privacyRow: {
    flexDirection: "row",
    gap: 10,
  },
  privacyTitle: {
    color: "#1A5F7A",
    fontWeight: "600",
    marginBottom: 2,
  },
  privacyText: {
    fontSize: 13,
    color: "#555",
  },
  label: {
    color: "#1A5F7A",
    fontWeight: "600",
    marginBottom: 10,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeBox: {
    width: "48%",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  typeBoxActive: {
    borderColor: "#1A5F7A",
    backgroundColor: "#1A5F7A15",
  },
  typeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  typeText: {
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  helperText: {
    fontSize: 12,
    color: "#777",
    marginTop: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  urgencyRow: {
    flexDirection: "row",
    gap: 8,
  },
  urgencyBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  urgencyActive: {
    borderColor: "#1A5F7A",
    backgroundColor: "#1A5F7A15",
  },
  urgencyText: {
    color: "#666",
  },
  urgencyTextActive: {
    color: "#1A5F7A",
    fontWeight: "600",
  },
  submitBtn: {
    backgroundColor: "#1A5F7A",
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelBtn: {
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  cancelText: {
    color: "#666",
  },
});
