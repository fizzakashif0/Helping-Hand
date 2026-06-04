import { useRouter } from "expo-router";
import {
  Award,
  Bell,
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
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { apiFetch } from "../../lib/apiClient";
import { clearToken } from "../../lib/token";
import api from "../../services/chatApi";

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
  const [trustScore, setTrustScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      const uid = data?.user?._id || data?.user?.id;
      if (uid) {
        try {
          const trustRes = await api.get(`/api/users/${uid}/trust-score`);
          const score =
            typeof trustRes?.data?.score === "number" ? trustRes.data.score : 0;
          setTrustScore(score);
        } catch {
          // silently skip on trust score failure
        }
      }
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

  const menuItems = [
    {
      icon: User,
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

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F9FAFB",
        }}
      >
        <ActivityIndicator size="large" color="#1A5F7A" />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F9FAFB",
        }}
      >
        <Text style={{ color: "red" }}>Failed to load profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSub}>
          Manage your account and view your impact
        </Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileWrapper}>
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <User size={36} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <Text style={styles.name}>{user?.name}</Text>
                {trustScore !== null && (
                  <Text style={styles.trustBadge}>
                    ⭐ Trust Score: {trustScore}/100
                  </Text>
                )}
              </View>
              <Text style={styles.email}>{user?.email}</Text>
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

        <View style={styles.grid}>
          <View style={[styles.statCard, styles.statPrimary]}>
            <Heart size={20} color="#fff" />
            <Text style={styles.statLabel}>Total Donations</Text>
            <Text style={styles.statValue}>{user?.totalDonations ?? 0}</Text>
          </View>

          <View style={styles.statCard}>
            <Award size={20} color="#D97706" />
            <Text style={styles.statLabelDark}>Rating</Text>
            <Text style={styles.statValueDark}>
              {(user?.ratingAvg ?? 0).toFixed(1)}
            </Text>
            <Text style={styles.statSubDark}>Average</Text>
          </View>

          <View style={styles.statCard}>
            <TrendingUp size={20} color="#16A34A" />
            <Text style={styles.statLabelDark}>Received</Text>
            <Text style={styles.statValueDark}>{user?.totalReceived ?? 0}</Text>
            <Text style={styles.statSubDark}>Items</Text>
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.screen}
              style={[
                styles.menuRow,
                index !== menuItems.length - 1 && styles.borderBottom,
              ]}
              onPress={() => onNavigate(item.screen)}
            >
              <View style={styles.menuIcon}>
                <item.icon size={20} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.description}</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Logout */}
      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut size={20} color="#DC2626" />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    backgroundColor: "#1A5F7A",
    padding: 24,
    paddingTop: 50,
    paddingBottom: 100,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "600" },
  headerSub: { color: "#E5E7EB", marginTop: 4 },
  profileWrapper: { marginTop: -70, paddingHorizontal: 16 },
  profileCard: { backgroundColor: "#fff", borderRadius: 20, padding: 16 },
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
  trustBadge: { fontSize: 12, color: "#1D4ED8", fontWeight: "600" },
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
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 },
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
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 12,
    overflow: "hidden",
  },
  menuRow: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  menuTitle: { fontWeight: "500" },
  menuDesc: { fontSize: 12, color: "#6B7280" },
  logoutBtn: {
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

