import {
    ArrowLeft,
    Eye,
    Lock,
    MapPin,
    Shield,
    Users,
} from "lucide-react-native";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  onBack: () => void;
  onSave: () => void;
}

export default function PrivacySettings({ onBack, onSave }: Props) {
  const [settings, setSettings] = useState({
    showProfile: true,
    showLocation: true,
    showDonationHistory: false,
    allowMessages: true,
    shareAnalytics: true,
    twoFactorAuth: false,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings({ ...settings, [key]: !settings[key] });

  const Item = ({
    icon,
    title,
    desc,
    value,
    onToggle,
  }: any) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconBox}>{icon}</View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{desc}</Text>
        </View>
        <Switch value={value} onValueChange={onToggle} />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backRow}>
          <ArrowLeft color="white" size={20} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <Text style={styles.headerSub}>Control your privacy settings</Text>
      </View>

      {/* Privacy */}
      <Text style={styles.section}>Privacy Settings</Text>

      <Item
        icon={<Users color="#1A5F7A" />}
        title="Public Profile"
        desc="Allow others to see your profile"
        value={settings.showProfile}
        onToggle={() => toggle("showProfile")}
      />

      <Item
        icon={<MapPin color="green" />}
        title="Share Location"
        desc="Show approximate location"
        value={settings.showLocation}
        onToggle={() => toggle("showLocation")}
      />

      <Item
        icon={<Eye color="purple" />}
        title="Donation History"
        desc="Display donation activity"
        value={settings.showDonationHistory}
        onToggle={() => toggle("showDonationHistory")}
      />

      <Item
        icon={<Users color="#1A5F7A" />}
        title="Allow Messages"
        desc="Let users message you"
        value={settings.allowMessages}
        onToggle={() => toggle("allowMessages")}
      />

      {/* Security */}
      <Text style={styles.section}>Security</Text>

      <Item
        icon={<Shield color="orange" />}
        title="Two-Factor Authentication"
        desc="Extra account security"
        value={settings.twoFactorAuth}
        onToggle={() => toggle("twoFactorAuth")}
      />

      <Item
        icon={<Lock color="gray" />}
        title="Share Usage Data"
        desc="Anonymous analytics"
        value={settings.shareAnalytics}
        onToggle={() => toggle("shareAnalytics")}
      />

      {/* Buttons */}
      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveText}>Save Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={onBack}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  header: {
    backgroundColor: "#1A5F7A",
    padding: 20,
    paddingTop: 50,
  },
  backRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  backText: { color: "white", marginLeft: 8 },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "600" },
  headerSub: { color: "#cbd5e1", marginTop: 4 },

  section: {
    margin: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 12,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontWeight: "600" },
  desc: { fontSize: 12, color: "gray" },

  saveBtn: {
    backgroundColor: "#1A5F7A",
    margin: 16,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: { color: "white", fontWeight: "600" },

  cancelBtn: {
    backgroundColor: "#e5e7eb",
    marginHorizontal: 16,
    marginBottom: 30,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelText: { color: "#374151" },
});
