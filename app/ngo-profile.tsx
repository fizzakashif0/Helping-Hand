import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
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

export default function NGOProfileScreen() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Helping Hands NGO",
    email: "contact@helpinghands.org",
    phone: "+1 (555) 123-4567",
    address: "123 Charity Street, Helping City, HC 12345",
    description: "Dedicated to providing relief and support to communities in need through various charitable activities and programs.",
    website: "www.helpinghands.org",
    founded: "2015",
    totalEvents: 45,
    totalBeneficiaries: 12500,
  });

  const handleSave = () => {
    // In a real app, this would save to backend
    setIsEditing(false);
    Alert.alert("Success", "Profile updated successfully!");
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData({ ...profileData, [field]: value });
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
        <Text style={styles.headerTitle}>NGO Profile</Text>
        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          style={styles.editButton}
        >
          <Edit size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <View style={styles.profilePicture}>
            <User size={48} color="#e60000" />
          </View>
          {isEditing && (
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Organization Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profileData.name}
                onChangeText={(text) => handleInputChange("name", text)}
              />
            ) : (
              <Text style={styles.fieldValue}>{profileData.name}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            {isEditing ? (
              <View style={styles.inputWithIcon}>
                <Mail size={20} color="#6b7280" style={styles.icon} />
                <TextInput
                  style={styles.inputWithIconText}
                  value={profileData.email}
                  onChangeText={(text) => handleInputChange("email", text)}
                  keyboardType="email-address"
                />
              </View>
            ) : (
              <View style={styles.valueWithIcon}>
                <Mail size={16} color="#6b7280" />
                <Text style={styles.fieldValue}>{profileData.email}</Text>
              </View>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Phone</Text>
            {isEditing ? (
              <View style={styles.inputWithIcon}>
                <Phone size={20} color="#6b7280" style={styles.icon} />
                <TextInput
                  style={styles.inputWithIconText}
                  value={profileData.phone}
                  onChangeText={(text) => handleInputChange("phone", text)}
                  keyboardType="phone-pad"
                />
              </View>
            ) : (
              <View style={styles.valueWithIcon}>
                <Phone size={16} color="#6b7280" />
                <Text style={styles.fieldValue}>{profileData.phone}</Text>
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
                  value={profileData.address}
                  onChangeText={(text) => handleInputChange("address", text)}
                  multiline
                  numberOfLines={2}
                />
              </View>
            ) : (
              <View style={styles.valueWithIcon}>
                <MapPin size={16} color="#6b7280" />
                <Text style={styles.fieldValue}>{profileData.address}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={profileData.description}
              onChangeText={(text) => handleInputChange("description", text)}
              multiline
              numberOfLines={4}
            />
          ) : (
            <Text style={styles.descriptionText}>{profileData.description}</Text>
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
                value={profileData.website}
                onChangeText={(text) => handleInputChange("website", text)}
                keyboardType="url"
              />
            ) : (
              <Text style={styles.fieldValue}>{profileData.website}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Founded</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profileData.founded}
                onChangeText={(text) => handleInputChange("founded", text)}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.fieldValue}>{profileData.founded}</Text>
            )}
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impact Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Building size={24} color="#e60000" />
              <Text style={styles.statValue}>{profileData.totalEvents}</Text>
              <Text style={styles.statLabel}>Total Events</Text>
            </View>
            <View style={styles.statCard}>
              <User size={24} color="#e60000" />
              <Text style={styles.statValue}>{profileData.totalBeneficiaries}</Text>
              <Text style={styles.statLabel}>Beneficiaries</Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={24} color="#fff" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#e60000",
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
    backgroundColor: "#e60000",
    borderRadius: 20,
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
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
  },
  descriptionText: {
    fontSize: 16,
    color: "#4b5563",
    lineHeight: 24,
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
});
