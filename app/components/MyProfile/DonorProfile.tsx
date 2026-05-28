import {
    Award,
    Bell,
    Calendar,
    ChevronRight,
    Heart,
    HelpCircle,
    Info,
    LogOut,
    Settings,
    Shield,
    TrendingUp,
    User,
} from "lucide-react-native";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { apiFetch } from "../../lib/apiClient";
import { clearToken } from "../../lib/token";

interface DonorProfileProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string | null;
  totalDonations: number;
  ratingAvg: number;
  totalReceived: number;
}

export default function DonorProfile({
  onNavigate,
  onLogout,
}: DonorProfileProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch("/api/users/profile");
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      
      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearToken();
    router.push("/login");
    onLogout();
  };
  const menu=[
    {
      icon :User,
      label: "Edit Profile",
      description: "Update your personal information",
      screen: "edit-profile",
      color: "#1A5F7A",
    },
    {
      icon: Settings,
      label: "Account Settings",
      description: "Manage your account preferences",
      screen: "account-settings",
      color: "#4B5563",
    },
    {
      icon: Bell,
      label: "Notification Preferences",
      description: "Customize your notifications",
      screen: "notification-preferences",
      color: "#2563EB",
    },
    {
      icon: Shield,
      label: "Privacy & Security",
      description: "Control your privacy settings",
      screen: "privacy-settings",
      color: "#16A34A",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      description: "Get help and contact support",
      screen: "help-support",
      color: "#7C3AED",
    },
    {
      icon: Info,
      label: "About",
      description: "App information and terms",
      screen: "about",
      color: "#6B7280",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSub}>
          Manage your account and view your impact
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A5F7A" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : user ? (
        <>
          {/* Profile Card */}
          <View style={styles.profileWrapper}>
            <View style={styles.profileCard}>
              <View style={styles.profileRow}>
                <View style={styles.avatar}>
                  <User size={36} color="#fff" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{user.name}</Text>
                  <Text style={styles.email}>{user.email}</Text>
                </View>
              </View>

              <Pressable
                style={styles.editBtn}
                onPress={() => onNavigate("edit-profile")}
              >
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </Pressable>
            </View>
          </View>

          {/* Impact Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Impact</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.grid}>
              <View style={[styles.statCard, styles.statPrimary]}>
                <Heart size={20} color="#fff" />
                <Text style={styles.statLabel}>Total Donations</Text>
                <Text style={styles.statValue}>{user.totalDonations}</Text>
              </View>

              <View style={styles.statCard}>
                <Award size={20} color="#D97706" />
                <Text style={styles.statLabelDark}>Rating</Text>
                <Text style={styles.statValueDark}>
                {(user.ratingAvg ?? 0).toFixed(1)}
                </Text>
                <Text style={styles.statSubDark}>Average</Text>
              </View>

              <View style={styles.statCard}>
                <TrendingUp size={20} color="#16A34A" />
                <Text style={styles.statLabelDark}>Received</Text>
                <Text style={styles.statValueDark}>
                  {user.totalReceived}
                </Text>
                <Text style={styles.statSubDark}>Items</Text>
              </View>
            </View>
          </View>

          {/* Logout Button */}
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  header: {
    backgroundColor: "#1A5F7A",
    padding: 24,
    paddingTop: 50,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "600" },
  headerSub: { color: "#E5E7EB", marginTop: 4 },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 16,
    textAlign: "center",
  },

  profileWrapper: { marginTop: 16, paddingHorizontal: 16 },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
  },
  profileRow: { flexDirection: "row", gap: 16, marginBottom: 16 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#1A5F7A",
    justifyContent: "center",
    alignItems: "center",
  },
  name: { fontWeight: "600", fontSize: 16 },
  email: { color: "#6B7280", fontSize: 12 },

  editBtn: {
    backgroundColor: "#1A5F7A",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  editBtnText: { color: "#fff", fontWeight: "600" },

  section: { padding: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontWeight: "600", fontSize: 16 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
  },
  statPrimary: { backgroundColor: "#1A5F7A" },
  statLabel: { color: "#E5E7EB", fontSize: 12 },
  statValue: { color: "#fff", fontSize: 28, fontWeight: "600" },
  statSub: { color: "#CBD5E1", fontSize: 11 },

  statLabelDark: { color: "#6B7280", fontSize: 12 },
  statValueDark: { color: "#111827", fontSize: 28, fontWeight: "600" },
  statSubDark: { color: "#9CA3AF", fontSize: 11 },

  logoutButton: {
    backgroundColor: "#FEE2E2",
    margin: 16,
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  logoutText: { color: "#DC2626", fontWeight: "600" },
});
