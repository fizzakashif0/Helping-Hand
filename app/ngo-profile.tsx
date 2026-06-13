import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Edit,
  Save,
  Camera,
} from "lucide-react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

interface ProfileData {
  organizationName: string;
  email: string;
  phone: string;
  address: string;
  missionStatement: string;
  website: string;
  orgType: string;
  verificationStatus: string;
}

const EMPTY_PROFILE: ProfileData = {
  organizationName: "",
  email: "",
  phone: "",
  address: "",
  missionStatement: "",
  website: "",
  orgType: "",
  verificationStatus: "pending",
};

export default function NGOProfileScreen() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(EMPTY_PROFILE);
  const [editData, setEditData] = useState<ProfileData>(EMPTY_PROFILE);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/ngos/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        Alert.alert("Error", err.message || "Failed to load profile");
        return;
      }

      const data = await res.json();
      const ngo = data.ngo;

      // Also get email from stored user info
      const userRaw = await AsyncStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;

      const mapped: ProfileData = {
        organizationName: ngo.organizationName || "",
        email: user?.email || "",
        phone: ngo.phone || "",
        address: ngo.address || "",
        missionStatement: ngo.missionStatement || "",
        website: ngo.website || "",
        orgType: ngo.orgType || "",
        verificationStatus: ngo.verificationStatus || "pending",
      };

      setProfileData(mapped);
      setEditData(mapped);
    } catch (err) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/ngos/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationName: editData.organizationName,
          phone: editData.phone,
          address: editData.address,
          missionStatement: editData.missionStatement,
          website: editData.website,
          orgType: editData.orgType,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        Alert.alert("Error", err.message || "Failed to save profile");
        return;
      }

      const data = await res.json();
      const ngo = data.ngo;

      const updated: ProfileData = {
        ...profileData,
        organizationName: ngo.organizationName || "",
        phone: ngo.phone || "",
        address: ngo.address || "",
        missionStatement: ngo.missionStatement || "",
        website: ngo.website || "",
        orgType: ngo.orgType || "",
      };

      setProfileData(updated);
      setEditData(updated);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setEditData(profileData); // discard changes
    setIsEditing(false);
  }

  function handleInputChange(field: keyof ProfileData, value: string) {
    setEditData({ ...editData, [field]: value });
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>NGO Profile</Text>
        <TouchableOpacity
          onPress={() => isEditing ? handleCancel() : setIsEditing(true)}
          style={styles.editButton}
        >
          <Edit size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <View style={styles.profilePicture}>
            <User size={48} color="#1A5F7A" />
          </View>
          {isEditing && (
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={20} color="#fff" />
            </TouchableOpacity>
          )}
          {/* Verification badge */}
          <View style={[
            styles.badge,
            profileData.verificationStatus === "verified" && styles.badgeVerified,
            profileData.verificationStatus === "rejected" && styles.badgeRejected,
          ]}>
            <Text style={styles.badgeText}>
              {profileData.verificationStatus === "verified"
                ? "✓ Verified"
                : profileData.verificationStatus === "rejected"
                ? "✗ Rejected"
                : "⏳ Pending Approval"}
            </Text>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Organization Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.organizationName}
                onChangeText={(t) => handleInputChange("organizationName", t)}
              />
            ) : (
              <Text style={styles.fieldValue}>{profileData.organizationName || "—"}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            {/* Email is not editable — comes from User account */}
            <View style={styles.valueWithIcon}>
              <Mail size={16} color="#6b7280" />
              <Text style={[styles.fieldValue, styles.fieldValueFlat]}>
                {profileData.email || "—"}
              </Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Phone</Text>
            {isEditing ? (
              <View style={styles.inputWithIcon}>
                <Phone size={20} color="#6b7280" style={styles.icon} />
                <TextInput
                  style={styles.inputWithIconText}
                  value={editData.phone}
                  onChangeText={(t) => handleInputChange("phone", t)}
                  keyboardType="phone-pad"
                />
              </View>
            ) : (
              <View style={styles.valueWithIcon}>
                <Phone size={16} color="#6b7280" />
                <Text style={[styles.fieldValue, styles.fieldValueFlat]}>
                  {profileData.phone || "—"}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Address</Text>
            {isEditing ? (
              <View style={styles.inputWithIcon}>
                <MapPin size={20} color="#6b7280" style={styles.icon} />
                <TextInput
                  style={styles.inputWithIconText}
                  value={editData.address}
                  onChangeText={(t) => handleInputChange("address", t)}
                  multiline
                  numberOfLines={2}
                />
              </View>
            ) : (
              <View style={styles.valueWithIcon}>
                <MapPin size={16} color="#6b7280" />
                <Text style={[styles.fieldValue, styles.fieldValueFlat]}>
                  {profileData.address || "—"}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Mission Statement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mission Statement</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editData.missionStatement}
              onChangeText={(t) => handleInputChange("missionStatement", t)}
              multiline
              numberOfLines={4}
              placeholder="Describe your NGO's mission..."
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            <Text style={styles.descriptionText}>
              {profileData.missionStatement || "No mission statement added yet."}
            </Text>
          )}
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Website</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.website}
                onChangeText={(t) => handleInputChange("website", t)}
                keyboardType="url"
                placeholder="www.example.org"
                placeholderTextColor="#9CA3AF"
              />
            ) : (
              <Text style={styles.fieldValue}>{profileData.website || "—"}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Organization Type</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.orgType}
                onChangeText={(t) => handleInputChange("orgType", t)}
                placeholder="e.g. Education, Health, Relief..."
                placeholderTextColor="#9CA3AF"
              />
            ) : (
              <Text style={styles.fieldValue}>{profileData.orgType || "—"}</Text>
            )}
          </View>
        </View>

        {/* Impact Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impact Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Building size={24} color="#1A5F7A" />
              <Text style={styles.statValue}>—</Text>
              <Text style={styles.statLabel}>Total Events</Text>
            </View>
            <View style={styles.statCard}>
              <User size={24} color="#1A5F7A" />
              <Text style={styles.statValue}>—</Text>
              <Text style={styles.statLabel}>Beneficiaries</Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        {isEditing && (
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator size="small" color="#fff" />
              : <Save size={24} color="#fff" />
            }
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  editButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  profilePictureSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraButton: {
    position: "absolute",
    bottom: 30,
    right: "35%",
    backgroundColor: "#1A5F7A",
    borderRadius: 20,
    padding: 8,
  },
  badge: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#F59E0B",
  },
  badgeVerified: {
    backgroundColor: "#2D9E7A",
  },
  badgeRejected: {
    backgroundColor: "#EF4444",
  },
  badgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
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
  fieldValue: {
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  fieldValueFlat: {
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
    marginLeft: 8,
    flex: 1,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
  },
  valueWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  descriptionText: {
    fontSize: 16,
    color: "#4b5563",
    lineHeight: 24,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    width: "48%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: "#22c55e",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
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