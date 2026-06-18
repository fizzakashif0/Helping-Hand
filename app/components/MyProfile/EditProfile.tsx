import {
  ArrowLeft,
  Camera,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiFetch } from "../../lib/apiClient";

interface EditProfileProps {
  onBack: () => void;
  onSave: () => void;
  userRole: "donor" | "recipient" | "ngo";
}

export default function EditProfile({ onBack, onSave, userRole }: EditProfileProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    bio: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiFetch("/api/users/profile");
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        const u = data.user;
        setFormData({
          name: u.name ?? "",
          email: u.email ?? "",
          phone: u.phone ?? "",
          address: u.address ?? "",
          city: u.city ?? "",
          bio: u.bio ?? "",
        });
      } catch {
        Alert.alert("Error", "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await apiFetch("/api/users/update-profile", {
        method: "PATCH",
        body: JSON.stringify({
          phone: formData.phone,
          bio: formData.bio,
          address: formData.address,
          city: formData.city,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      Alert.alert("Success", "Profile updated successfully!");
      onSave();
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb" }}>
        <ActivityIndicator size="large" color="#1A5F7A" />
      </View>
    );
  }

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

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatar}>
          <User size={48} color="#fff" />
        </View>
        <TouchableOpacity style={styles.cameraButton}>
          <Camera size={16} color="#1A5F7A" />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {/* Name - read only, shown for context */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <User size={18} color="#9ca3af" />
            <Text style={styles.label}>Full Name</Text>
          </View>
          <Text style={styles.readOnly}>{formData.name}</Text>
        </View>

        {/* Email - read only */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Mail size={18} color="#9ca3af" />
            <Text style={styles.label}>Email</Text>
          </View>
          <Text style={styles.readOnly}>{formData.email}</Text>
        </View>

        {/* Phone */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Phone size={18} color="#9ca3af" />
            <Text style={styles.label}>Phone Number</Text>
          </View>
          <TextInput
            value={formData.phone}
            onChangeText={v => handleChange("phone", v)}
            style={styles.input}
            keyboardType="phone-pad"
          />
        </View>

        {/* Address */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <MapPin size={18} color="#9ca3af" />
            <Text style={styles.label}>Address</Text>
          </View>
          <TextInput
            value={formData.address}
            onChangeText={v => handleChange("address", v)}
            style={styles.input}
          />
        </View>

        {/* City */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <MapPin size={18} color="#9ca3af" />
            <Text style={styles.label}>City</Text>
          </View>
          <TextInput
            value={formData.city}
            onChangeText={v => handleChange("city", v)}
            style={styles.input}
          />
        </View>

        {/* Bio - donor and recipient only */}
        {(userRole === "donor" || userRole === "recipient") && (
          <View style={styles.card}>
            <View style={styles.labelRow}>
              <User size={18} color="#9ca3af" />
              <Text style={styles.label}>
                {userRole === "donor" ? "About Me" : "My Story"}
              </Text>
            </View>
            <TextInput
              value={formData.bio}
              onChangeText={v => handleChange("bio", v)}
              style={[styles.input, styles.textArea]}
              multiline
              placeholder={
                userRole === "donor"
                  ? "Tell others about your donation journey..."
                  : "Share your story with donors..."
              }
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.primaryButtonText}>Save Changes</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: { paddingTop: 48, paddingBottom: 24, paddingHorizontal: 20, backgroundColor: "#1A5F7A" },
  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  backText: { color: "#fff", marginLeft: 8 },
  title: { fontSize: 22, color: "#fff", fontWeight: "600" },
  subtitle: { color: "rgba(255,255,255,0.7)", marginTop: 4 },
  avatarWrapper: { alignItems: "center", marginTop: -40, marginBottom: 24 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#1A5F7A", justifyContent: "center", alignItems: "center" },
  cameraButton: { position: "absolute", bottom: 0, right: "38%", width: 32, height: 32, backgroundColor: "#fff", borderRadius: 16, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#1A5F7A" },
  form: { paddingHorizontal: 20 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  label: { marginLeft: 8, color: "#6b7280", fontSize: 13 },
  input: { fontSize: 16, color: "#111827", paddingVertical: 4 },
  readOnly: { fontSize: 16, color: "#6b7280", paddingVertical: 4 },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  primaryButton: { backgroundColor: "#1A5F7A", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 12 },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  secondaryButton: { backgroundColor: "#e5e7eb", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 10, marginBottom: 40 },
  secondaryButtonText: { color: "#374151", fontSize: 16 },
});