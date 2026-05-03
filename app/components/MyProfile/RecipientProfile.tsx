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
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export default function RecipientProfile({ onNavigate, onLogout }: Props) {
  const menu = [
    { label: "Edit Profile", icon: User, screen: "edit-profile" },
    { label: "Account Settings", icon: Settings, screen: "account-settings" },
    { label: "Notifications", icon: Bell, screen: "notifications" },
    { label: "Privacy & Security", icon: Shield, screen: "privacy" },
    { label: "Help & Support", icon: HelpCircle, screen: "help" },
    { label: "About", icon: Info, screen: "about" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSub}>Manage your account</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <User color="white" size={40} />
        </View>
        <Text style={styles.name}>Recipient User</Text>
        <Text style={styles.email}>recipient@example.com</Text>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => onNavigate("edit-profile")}
        >
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Menu */}
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

      {/* Logout */}
      <TouchableOpacity style={styles.logout} onPress={onLogout}>
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
  email: { color: "gray", marginBottom: 12 },

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
  },
  logoutText: { color: "red", fontWeight: "600" },
});
