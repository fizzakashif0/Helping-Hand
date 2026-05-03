import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import {
  User,
  Settings,
  Bell,
  Shield,
  Key,
  LogOut,
  Edit,
  Trash2,
} from "lucide-react-native";

export default function AdminProfileScreen() {
  const router = useRouter();

  // Mock admin profile data
  const profileData = {
    name: "John Doe",
    email: "admin@helpinghand.com",
    role: "System Administrator",
    joinDate: "January 2023",
    lastLogin: "Today at 10:30 AM",
    permissions: ["User Management", "Donation Monitoring", "Report Handling", "Analytics Access"],
  };

  const handleLogout = () => {
    // In a real app, this would clear authentication tokens
    router.push("/");
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen (placeholder)
    console.log("Edit profile");
  };

  const handleChangePassword = () => {
    // Navigate to change password screen (placeholder)
    console.log("Change password");
  };

  const handleNotificationSettings = () => {
    // Navigate to notification settings (placeholder)
    console.log("Notification settings");
  };

  const handleDeactivateAccount = () => {
    // Handle account deactivation (placeholder)
    console.log("Deactivate account");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <User size={48} color="#1A5F7A" />
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{profileData.name}</Text>
            <Text style={styles.profileRole}>{profileData.role}</Text>
            <Text style={styles.profileEmail}>{profileData.email}</Text>
          </View>
          <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
            <Edit size={20} color="#1A5F7A" />
          </TouchableOpacity>
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since:</Text>
              <Text style={styles.infoValue}>{profileData.joinDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Login:</Text>
              <Text style={styles.infoValue}>{profileData.lastLogin}</Text>
            </View>
          </View>
        </View>

        {/* Permissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permissions</Text>
          <View style={styles.permissionsCard}>
            {profileData.permissions.map((permission, index) => (
              <View key={index} style={styles.permissionItem}>
                <Shield size={16} color="#8B5CF6" />
                <Text style={styles.permissionText}>{permission}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsGrid}>
            <TouchableOpacity
              style={styles.settingButton}
              onPress={handleChangePassword}
            >
              <Key size={24} color="#8B5CF6" />
              <Text style={styles.settingText}>Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingButton}
              onPress={handleNotificationSettings}
            >
              <Bell size={24} color="#8B5CF6" />
              <Text style={styles.settingText}>Notifications</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleDeactivateAccount}
          >
            <Trash2 size={20} color="#dc2626" />
            <Text style={styles.dangerText}>Deactivate Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E4A61",
  },
  header: {
    backgroundColor: "#1A5F7A",
    padding: 20,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileText: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  profileRole: {
    fontSize: 14,
    color: "grey",
    fontWeight: "600",
    marginTop: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "grey",
    marginTop: 2,
  },
  editButton: {
    padding: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "grey",
  },
  infoValue: {
    fontSize: 14,
    color: "black",
    fontWeight: "500",
  },
  permissionsCard: {
    backgroundColor: "#ffffff22",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 14,
    color: "black",
    marginLeft: 12,
  },
  settingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  settingButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    width: "48%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "black",
    marginTop: 8,
  },
  dangerButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
    marginLeft: 8,
  },
});
