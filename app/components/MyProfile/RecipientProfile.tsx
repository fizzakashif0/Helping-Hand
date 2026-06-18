import { useRouter } from "expo-router";
import {
  Bell,
  ChevronRight,
  HelpCircle,
  Info,
  LogOut,
  Settings,
  Shield,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiFetch } from "../../lib/apiClient";
import { clearToken } from "../../lib/token";

interface Props {
  onNavigate: (screen: string) => void;
}

export default function RecipientProfile({ onNavigate }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<
    { _id?: string; id?: string; name: string; email: string } | null
  >(null);
  const [trustScore, setTrustScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiFetch("/api/users/profile");
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setUser(data.user);

        const uid = data?.user?._id || data?.user?.id;
        if (uid) {
          try {
            const trustRes = await apiFetch(`/api/users/${uid}/trust-score`);
            if (!trustRes.ok) throw new Error("Failed to fetch trust score");
            const trustData = await trustRes.json();
            const score =
              typeof trustData?.score === "number" ? trustData.score : 0;
            setTrustScore(score);
          } catch {
            // silently skip on trust score failure
          }
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await clearToken();
    router.push("/login");
  };

  const menu = [
    { label: "Edit Profile", icon: User, screen: "edit-profile" },
    {
      label: "Account Settings",
      icon: Settings,
      screen: "account-settings",
    },
    { label: "Notifications", icon: Bell, screen: "notifications" },
    { label: "Privacy & Security", icon: Shield, screen: "privacy" },
    { label: "Help & Support", icon: HelpCircle, screen: "help" },
    { label: "About", icon: Info, screen: "about" },
  ];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1A5F7A" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>Failed to load profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSub}>Manage your account</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <User color="white" size={40} />
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Text style={styles.name}>{user?.name}</Text>
          {trustScore !== null && (
            <View style={[styles.trustBadgePill, {
  backgroundColor: trustScore >= 70 ? "#16A34A" : trustScore >= 40 ? "#2563EB" : "#DC2626"
}]}>
  <Text style={styles.trustBadgeText}>
    ⭐ {trustScore}/100
  </Text>
</View>
          )}
        </View>

        <Text style={styles.email}>{user?.email}</Text>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => onNavigate("edit-profile")}
        >
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menu}>
        {menu.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => onNavigate(item.screen)}
          >
            <item.icon color="#1A5F7A" />
            <Text style={styles.menuText}>{item.label}</Text>
            <ChevronRight color="gray" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <LogOut color="red" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  header: {
    backgroundColor: "#1A5F7A",
    padding: 24,
    paddingTop: 50,
  },
  headerTitle: { color: "white", fontSize: 22, fontWeight: "600" },
  headerSub: { color: "#cbd5e1", marginTop: 4 },

  profileCard: {
    backgroundColor: "white",
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginTop: -40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1A5F7A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  name: { fontSize: 18, fontWeight: "600" },
  trustBadge: { fontSize: 12, color: "#1D4ED8", fontWeight: "600" },
  email: { color: "gray", marginBottom: 12, textAlign: "center" },

  editBtn: {
    backgroundColor: "#1A5F7A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  editText: { color: "white" },

  menu: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    gap: 12,
  },
  menuText: { flex: 1 },

  logout: {
    backgroundColor: "#fee2e2",
    margin: 16,
    padding: 14,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    alignItems: "center",
  },
  trustBadgePill: {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 20,
},
trustBadgeText: {
  color: "#fff",
  fontSize: 12,
  fontWeight: "600",
},
  logoutText: { color: "red", fontWeight: "600" },
});