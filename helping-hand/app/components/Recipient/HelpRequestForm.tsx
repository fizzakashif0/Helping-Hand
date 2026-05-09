import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createRequest } from "../../store/requestStore";

interface CreateHelpRequestFormProps {
  onSubmit: () => void;
  onBack: () => void;
}

export default function CreateHelpRequestForm({
  onSubmit,
  onBack,
}: CreateHelpRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
    quantity: "",
    location: "",
    urgency: "medium",
  });
  const [popup, setPopup] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onClose?: () => void;
  }>({
    visible: false,
    title: "",
    message: "",
  });

  const requestTypes = [
    { value: "food", label: "Food", icon: "Food" },
    { value: "clothes", label: "Clothes", icon: "Clothes" },
    { value: "blood", label: "Blood", icon: "Blood" },
    { value: "financial", label: "Financial", icon: "Money" },
  ];

  const showPopup = (title: string, message: string, onClose?: () => void) => {
    setPopup({
      visible: true,
      title,
      message,
      onClose,
    });
  };

  const closePopup = () => {
    const onClose = popup.onClose;
    setPopup((current) => ({
      ...current,
      visible: false,
      onClose: undefined,
    }));

    if (onClose) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    const trimmedTitle = formData.title.trim();
    const trimmedDescription = formData.description.trim();
    const trimmedQuantity = formData.quantity.trim();
    const trimmedLocation = formData.location.trim();

    if (!formData.type || !trimmedTitle || !trimmedDescription) {
      showPopup("Error", "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      await createRequest({
        type: formData.type as any,
        title: trimmedTitle,
        description: trimmedDescription,
        quantity: trimmedQuantity,
        location: trimmedLocation,
        urgency: formData.urgency as "low" | "medium" | "high",
      });

      showPopup("Success", "Help request submitted successfully.", onSubmit);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to submit request. Please try again.";
      showPopup("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        visible={popup.visible}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{popup.title}</Text>
            <Text style={styles.modalMessage}>{popup.message}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={closePopup}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backRow} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={styles.headerTitle}>Request Help</Text>
          </TouchableOpacity>
          <Text style={styles.headerSubtitle}>
            Let us know how we can help you
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.privacyRow}>
            <Ionicons name="shield-checkmark" size={20} color="#1A5F7A" />
            <View style={styles.flexOne}>
              <Text style={styles.privacyTitle}>Your Privacy Matters</Text>
              <Text style={styles.privacyText}>
                Your request is confidential. Only approved donors will see your
                details.
              </Text>
            </View>
          </View>
        </View>

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
                onPress={() => setFormData({ ...formData, type: type.value })}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={styles.typeText}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Brief Description</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Need groceries for family"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />
        </View>

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

        <View style={styles.card}>
          <Text style={styles.label}>Quantity / Amount Needed</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., For 4 people, Rs 20,000, 3 bags"
            value={formData.quantity}
            onChangeText={(text) => setFormData({ ...formData, quantity: text })}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Your Area</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={20} color="#888" />
            <TextInput
              style={[styles.input, styles.locationInput]}
              placeholder="Enter your area or neighborhood"
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
            />
          </View>
          <Text style={styles.helperText}>
            Only your general area will be shown to donors
          </Text>
        </View>

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

        <TouchableOpacity
          style={[
            styles.submitBtn,
            (loading ||
              !formData.type ||
              !formData.title ||
              !formData.description) && styles.submitBtnDisabled,
          ]}
          disabled={
            loading || !formData.type || !formData.title || !formData.description
          }
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>
            {loading ? "Submitting..." : "Submit Request"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={onBack}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    paddingBottom: 40,
  },
  flexOne: {
    flex: 1,
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
    fontSize: 16,
    marginBottom: 6,
    color: "#1A5F7A",
    fontWeight: "600",
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
  locationInput: {
    flex: 1,
    marginLeft: 8,
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
  submitBtnDisabled: {
    opacity: 0.5,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A5F7A",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
  },
  modalButton: {
    backgroundColor: "#1A5F7A",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
