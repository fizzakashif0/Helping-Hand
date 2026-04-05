import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { buildApiUrl } from "../../lib/api";
import { DEMO_DONOR_ID, toBackendDonationType } from "../../lib/donations";
import { addDonation } from "../../store/donationStore";
import BottomNav, { NavItem } from "../Navbar";

interface CreateDonationFormProps {
  onSubmit: () => void;
  onBack: () => void;
}

export function CreateDonationForm({
  onSubmit,
  onBack,
}: CreateDonationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
    quantity: "",
    location: "",
    urgency: "medium",
  });
  const [navTab, setNavTab] = useState<NavItem>("create");
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
    setPopup((current) => ({ ...current, visible: false }));
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
      showPopup("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Create donation object for backend
      const donationData = {
        userId: DEMO_DONOR_ID,
        type: toBackendDonationType(formData.type as any),
        description: `${trimmedTitle}\n${trimmedDescription}`,
        quantityText: trimmedQuantity || "Not specified",
        location: {
          address: trimmedLocation || "Not specified",
          coordinates: {
            lat: 31.5497, // TODO: Get actual coordinates
            lng: 74.3436
          }
        }
      };

      console.log("Sending donation data:", donationData); // Debug log

      // Submit to backend
      const response = await fetch(buildApiUrl("/api/donations"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(donationData)
      });

      console.log("Response status:", response.status); // Debug log

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to create donation: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log("Success response:", result); // Debug log

      // Add to local store
      addDonation({
        id: result._id || Date.now().toString(),
        type: formData.type as any,
        title: trimmedTitle,
        recipientName: "Nearby Recipients",
        amount: trimmedQuantity,
        date: new Date().toLocaleDateString(),
        location: trimmedLocation || "Not specified",
        status: "pending"
      });

      showPopup(
        "Success",
        "Donation posted! Recipients will see it nearby.",
        onSubmit
      );
    } catch (error) {
      console.error("Error creating donation:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create donation. Please try again.";
      showPopup("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const donationTypes = [
    { value: "food", label: "Food", icon: "🍽️" },
    { value: "clothes", label: "Clothes", icon: "👕" },
    { value: "blood", label: "Blood", icon: "🩸" },
    { value: "financial", label: "Financial", icon: "💰" },
  ];

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

      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Create Donation</Text>
            <Text style={styles.headerSubtitle}>
              Share what you can offer to help others
            </Text>
          </View>
        </View>

        {/* Donation Type */}
        <View style={styles.card}>
          <Text style={styles.label}>What would you like to donate?</Text>

          <View style={styles.typeGrid}>
            {donationTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  formData.type === type.value && styles.typeButtonActive,
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
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Fresh groceries available"
            value={formData.title}
            onChangeText={(text) =>
              setFormData({ ...formData, title: text })
            }
          />
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Provide details about what you're offering..."
            multiline
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
          />
        </View>

        {/* Quantity */}
        <View style={styles.card}>
          <Text style={styles.label}>Quantity / Amount</Text>
          <View style={styles.inputRow}>
            <Ionicons name="cube-outline" size={20} color="#999" />
            <TextInput
              style={styles.inputFlex}
              placeholder="e.g., 5 bags, Rs 10,000"
              value={formData.quantity}
              onChangeText={(text) =>
                setFormData({ ...formData, quantity: text })
              }
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.card}>
          <Text style={styles.label}>Pickup Location</Text>
          <View style={styles.inputRow}>
            <Ionicons name="location-outline" size={20} color="#999" />
            <TextInput
              style={styles.inputFlex}
              placeholder="Enter address or area"
              value={formData.location}
              onChangeText={(text) =>
                setFormData({ ...formData, location: text })
              }
            />
          </View>
          <Text style={styles.helperText}>
            Your exact address will only be shared with confirmed recipients
          </Text>
        </View>

        {/* Urgency */}
        <View style={styles.card}>
          <Text style={styles.label}>Availability</Text>

          <View style={styles.urgencyRow}>
            {[
              { value: "low", label: "Flexible" },
              { value: "medium", label: "This Week" },
              { value: "high", label: "Urgent" },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.urgencyButton,
                  formData.urgency === option.value &&
                    styles.urgencyButtonActive,
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

        {/* Upload */}
        <View style={styles.card}>
          <Text style={styles.label}>Add Photos (Optional)</Text>
          <TouchableOpacity style={styles.uploadBox}>
            <Ionicons name="cloud-upload-outline" size={32} color="#999" />
            <Text style={styles.uploadText}>Tap to upload photos</Text>
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (loading || !formData.type ||
              !formData.title ||
              !formData.description) && { opacity: 0.6 },
          ]}
          disabled={loading || !formData.type || !formData.title || !formData.description}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>{loading ? "Posting..." : "Post Donation"}</Text>
        </TouchableOpacity>

        {/* Cancel */}
        <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <BottomNav activeTab={navTab} onTabChange={setNavTab} />
      </ScrollView>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E4A61",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#1A5F7A",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
  },
  label: {
    color: "#1A5F7A",
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: 12,
  },
  helperText: {
    fontSize: 12,
    color: "#777",
    marginTop: 6,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeButton: {
    width: "48%",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  typeButtonActive: {
    borderColor: "#1A5F7A",
    backgroundColor: "rgba(26,95,122,0.1)",
  },
  typeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  typeText: {
    color: "#444",
  },
  urgencyRow: {
    flexDirection: "row",
    gap: 10,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
  },
  urgencyButtonActive: {
    borderColor: "#1A5F7A",
    backgroundColor: "rgba(26,95,122,0.1)",
  },
  urgencyText: {
    color: "#666",
  },
  urgencyTextActive: {
    color: "#1A5F7A",
    fontWeight: "600",
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ccc",
    borderRadius: 14,
    padding: 30,
    alignItems: "center",
  },
  uploadText: {
    marginTop: 8,
    color: "#777",
  },
  submitButton: {
    backgroundColor: "#1A5F7A",
    margin: 16,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
  },
  cancelButton: {
    marginHorizontal: 16,
    marginBottom: 30,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    backgroundColor: "#fff",
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

export default CreateDonationForm;

