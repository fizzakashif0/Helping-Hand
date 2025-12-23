import {
    ArrowLeft,
    Award,
    ChevronRight,
    ExternalLink,
    Heart,
    Shield,
    Users,
} from "lucide-react-native";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface AboutProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export default function About({ onBack, onNavigate }: AboutProps) {
  const features = [
    {
      icon: Heart,
      title: "Compassionate Platform",
      description: "Connecting donors with those in need through dignity and respect",
      color: "#DC2626",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your privacy and security are our top priorities",
      color: "#16A34A",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Building stronger communities through collective support",
      color: "#2563EB",
    },
    {
      icon: Award,
      title: "Impact Focused",
      description: "Track your contribution and see the real difference you make",
      color: "#D97706",
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
        <Text style={styles.headerTitle}>About</Text>
        <Text style={styles.headerSub}>Helping Hand App Information</Text>
      </View>

      {/* App Info */}
      <View style={styles.card}>
        <View style={styles.logo}>
          <Heart size={36} color="#fff" />
        </View>
        <Text style={styles.appName}>Helping Hand</Text>
        <Text style={styles.appDesc}>Making a difference, one donation at a time</Text>
        <Text style={styles.meta}>Version 1.0.0</Text>
        <Text style={styles.meta}>Build 2024.12</Text>
        <Text style={styles.meta}>Last Updated: December 2024</Text>
      </View>

      {/* Mission */}
      <View style={[styles.card, styles.mission]}>
        <Text style={styles.missionTitle}>Our Mission</Text>
        <Text style={styles.missionText}>
          Helping Hand connects generous donors with individuals and families in need,
          fostering a compassionate community with dignity.
        </Text>
      </View>

      {/* Features */}
      <Text style={styles.sectionTitle}>What We Stand For</Text>
      {features.map((item) => (
        <View key={item.title} style={styles.featureCard}>
          <View style={[styles.iconBox, { backgroundColor: "#F3F4F6" }]}>
            <item.icon size={20} color={item.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>{item.title}</Text>
            <Text style={styles.featureDesc}>{item.description}</Text>
          </View>
        </View>
      ))}

      {/* Legal */}
      <Text style={styles.sectionTitle}>Legal & Policies</Text>
      {["Terms of Service", "Privacy Policy", "Community Guidelines", "Cookie Policy"].map(
        (item) => (
          <Pressable
            key={item}
            style={styles.listItem}
            onPress={() => onNavigate(item)}
          >
            <Text style={styles.listText}>{item}</Text>
            <ChevronRight size={20} color="#9CA3AF" />
          </Pressable>
        )
      )}

      {/* Social */}
      <Text style={styles.sectionTitle}>Connect With Us</Text>
      <View style={styles.socialRow}>
        {["Website", "Twitter", "Facebook"].map((item) => (
          <View key={item} style={styles.socialCard}>
            <ExternalLink size={20} color="#1A5F7A" />
            <Text style={styles.socialText}>{item}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>© 2024 Helping Hand</Text>
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
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  logo: {
    backgroundColor: "#1A5F7A",
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  appName: { fontSize: 18, fontWeight: "600" },
  appDesc: { color: "#6B7280", marginBottom: 8 },
  meta: { fontSize: 12, color: "#9CA3AF" },
  mission: { backgroundColor: "#1A5F7A" },
  missionTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  missionText: { color: "#E5E7EB", marginTop: 8, fontSize: 13 },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 16,
    fontWeight: "600",
  },
  featureCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureTitle: { fontWeight: "500" },
  featureDesc: { fontSize: 12, color: "#6B7280" },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    marginTop: 6,
  },
  listText: { fontSize: 14 },
  socialRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    justifyContent: "space-between",
  },
  socialCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    margin: 4,
    borderRadius: 12,
    alignItems: "center",
  },
  socialText: { fontSize: 12, marginTop: 6 },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    marginVertical: 20,
  },
  
});

  