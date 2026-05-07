import {
    ArrowLeft,
    ChevronRight,
    Globe,
    Key,
    Smartphone,
    Trash2,
} from "lucide-react-native";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface AccountSettingsProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export default function AccountSettings({ onBack, onNavigate }: AccountSettingsProps) {
  const settings = [
    {
      icon: Key,
      label: "Change Password",
      description: "Update your account password",
      screen: "change-password",
      color: "#1A5F7A",
    },
    {
      icon: Globe,
      label: "Language & Region",
      description: "English (United States)",
      screen: "language-region",
      color: "#2563EB",
    },
    {
      icon: Smartphone,
      label: "Linked Devices",
      description: "Manage your devices",
      screen: "linked-devices",
      color: "#7C3AED",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={20} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <Text style={styles.headerSub}>Manage your account preferences</Text>
      </View>

      {/* Settings */}
      <View style={styles.card}>
        {settings.map((item, index) => (
          <Pressable
            key={item.screen}
            style={[
              styles.row,
              index !== settings.length - 1 && styles.borderBottom,
            ]}
            onPress={() => onNavigate(item.screen)}
          >
            <View style={[styles.iconBox, { backgroundColor: "#F3F4F6" }]}>
              <item.icon size={20} color={item.color} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.label}</Text>
              <Text style={styles.subtitle}>{item.description}</Text>
            </View>

            <ChevronRight size={20} color="#9CA3AF" />
          </Pressable>
        ))}
      </View>

      {/* Danger Zone */}
      <Text style={styles.sectionTitle}>Danger Zone</Text>

      <View style={[styles.card, styles.dangerCard]}>
        <Pressable
          style={styles.row}
          onPress={() => onNavigate("deactivate-account")}
        >
          <View style={[styles.iconBox, { backgroundColor: "#FEE2E2" }]}>
            <Trash2 size={20} color="#DC2626" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.dangerText}>Deactivate Account</Text>
            <Text style={styles.subtitle}>
              Temporarily disable your account
            </Text>
          </View>

          <ChevronRight size={20} color="#9CA3AF" />
        </Pressable>
      </View>
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
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  backText: { color: "#fff", marginLeft: 6 },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "600" },
  headerSub: { color: "#E5E7EB", marginTop: 4 },

  card: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontWeight: "500", color: "#111827" },
  subtitle: { fontSize: 12, color: "#6B7280" },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 12,
    fontWeight: "600",
  },
  dangerCard: {
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  dangerText: { color: "#DC2626", fontWeight: "500" },
});
