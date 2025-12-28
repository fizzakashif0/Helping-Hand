import {
  ArrowLeft,
  Calendar,
  Camera,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react-native";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface EditProfileProps {
  onBack: () => void;
  onSave: () => void;
  userRole: "donor" | "recipient" | "ngo";
}

export default function EditProfile({
  onBack,
  onSave,
  userRole,
}: EditProfileProps) {
  const [formData, setFormData] = useState({
    name: userRole === "donor" ? "ABC" : "Recipient User",
    email: userRole === "donor"
      ? "donor@example.com"
      : "recipient@example.com",
    phone: "+92 331245563345",
    location: " Lahore, Pakistan   ",
    bio:
      userRole === "donor"
        ? "Passionate about making a difference in my community."
        : "Grateful for the support and kindness of donors.",
    dateOfBirth: "1990-01-01",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitle}>Update your personal information</Text>
      </View>

      {/* Profile Picture */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatar}>
          <User size={48} color="#fff" />
        </View>
        <TouchableOpacity style={styles.cameraButton}>
          <Camera size={16} color="#1A5F7A" />
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {renderField("Full Name", User, formData.name, value =>
          handleChange("name", value)
        )}

        {renderField("Email", Mail, formData.email, value =>
          handleChange("email", value)
        )}

        {renderField("Phone Number", Phone, formData.phone, value =>
          handleChange("phone", value)
        )}

        {renderField("Location", MapPin, formData.location, value =>
          handleChange("location", value)
        )}

        {renderField("Date of Birth", Calendar, formData.dateOfBirth, value =>
          handleChange("dateOfBirth", value)
        )}

        {/* Bio */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <User size={18} color="#9ca3af" />
            <Text style={styles.label}>Bio</Text>
          </View>
          <TextInput
            value={formData.bio}
            onChangeText={value => handleChange("bio", value)}
            style={[styles.input, styles.textArea]}
            multiline
          />
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.primaryButton} onPress={onSave}>
          <Text style={styles.primaryButtonText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function renderField(
  label: string,
  Icon: any,
  value: string,
  onChange: (text: string) => void
) {
  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <Icon size={18} color="#9ca3af" />
        <Text style={styles.label}>{label}</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: "#1A5F7A",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backText: {
    color: "#fff",
    marginLeft: 8,
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "600",
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  avatarWrapper: {
    alignItems: "center",
    marginTop: -40,
    marginBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#1A5F7A",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: "38%",
    width: 32,
    height: 32,
    backgroundColor: "#fff",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1A5F7A",
  },
  form: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    marginLeft: 8,
    color: "#6b7280",
    fontSize: 13,
  },
  input: {
    fontSize: 16,
    color: "#111827",
    paddingVertical: 4,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  primaryButton: {
    backgroundColor: "#1A5F7A",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 16,
  },
});
