import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, User, Mail, Phone, MapPin, Building, Edit, Save, Camera } from "lucide-react-native";
import { apiFetch } from "../../lib/apiClient";
import { clearToken } from "../../lib/token";

export default function NGOProfileScreen() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "", email: "", phone: "", address: "",
    description: "", website: "", founded: "",
    totalDonations: 0, totalReceived: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiFetch("/api/users/profile");
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        const u = data.user;
        setProfileData(prev => ({
          ...prev,
          name: u.name ?? "",
          email: u.email ?? "",
          phone: u.phone ?? "",
          address: u.address ?? "",
          description: u.bio ?? "",
          totalDonations: u.totalDonations ?? 0,
          totalReceived: u.totalReceived ?? 0,
        }));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert("Success", "Profile updated successfully!");
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleLogout = async () => {
    await clearToken();
    router.push("/login");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1A5F7A" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1A5F7A" }}>
        <Text style={{ color: "#fff" }}>Failed to load profile</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NGO Profile</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
          <Edit size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profilePictureSection}>
          <View style={styles.profilePicture}>
            <User size={48} color="#1A5F7A" />
          </View>
          {isEditing && (
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Organization Name</Text>
            {isEditing ? (
              <TextInput style={styles.input} value={profileData.name} onChangeText={(t) => handleInputChange("name", t)} />
            ) : (
              <Text style={styles.fieldValue}>{profileData.name}</Text>
            )}
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.valueWithIcon}>
              <Mail size={16} color="#6b7280" />
              <Text style={styles.fieldValue}>{profileData.email}</Text>
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Phone</Text>
            {isEditing ? (
              <View style={styles.inputWithIcon}>
                <Phone size={20} color="#6b7280" style={styles.icon} />
                <TextInput style={styles.inputWithIconText} value={profileData.phone} onChangeText={(t) => handleInputChange("phone", t)} keyboardType="phone-pad" />
              </View>
            ) : (
              <View style={styles.valueWithIcon}>
                <Phone size={16} color="#6b7280" />
                <Text style={styles.fieldValue}>{profileData.phone || "Not set"}</Text>
              </View>
            )}
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Address</Text>
            {isEditing ? (
              <View style={styles.inputWithIcon}>
                <MapPin size={20} color="#6b7280" style={styles.icon} />
                <TextInput style={styles.inputWithIconText} value={profileData.address} onChangeText={(t) => handleInputChange("address", t)} multiline numberOfLines={2} />
              </View>
            ) : (
              <View style={styles.valueWithIcon}>
                <MapPin size={16} color="#6b7280" />
                <Text style={styles.fieldValue}>{profileData.address || "Not set"}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          {isEditing ? (
            <TextInput style={[styles.input, styles.textArea]} value={profileData.description} onChangeText={(t) => handleInputChange("description", t)} multiline numberOfLines={4} />
          ) : (
            <Text style={styles.descriptionText}>{profileData.description || "No description yet"}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impact Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Building size={24} color="#1A5F7A" />
              <Text style={styles.statValue}>{profileData.totalDonations}</Text>
              <Text style={styles.statLabel}>Total Donations</Text>
            </View>
            <View style={styles.statCard}>
              <User size={24} color="#1A5F7A" />
              <Text style={styles.statValue}>{profileData.totalReceived}</Text>
              <Text style={styles.statLabel}>Total Received</Text>
            </View>
          </View>
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={24} color="#fff" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
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
    bottom: 0,
    right: "35%",
    backgroundColor: "#1A5F7A",
    borderRadius: 20,
    padding: 8,
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
    color: "#fff",
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
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  descriptionText: {
    fontSize: 16,
    color: "#4b5563",
    lineHeight: 24,
    backgroundColor: "#fff",
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
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  logoutBtn: { padding: 16, alignItems: "center", marginBottom: 40 },
  logoutText: { color: "#fee2e2", fontSize: 16, fontWeight: "600" },

});
