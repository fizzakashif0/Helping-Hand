import {
    ArrowLeft,
    Book,
    ChevronRight,
    ExternalLink,
    Mail,
    MessageCircle,
    Phone,
} from "lucide-react-native";
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface HelpSupportProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export default function HelpSupport({ onBack, onNavigate }: HelpSupportProps) {
  const helpOptions = [
    {
      icon: Book,
      label: "FAQs",
      description: "Frequently asked questions",
      screen: "faqs",
      color: "#2563eb",
    },
    {
      icon: MessageCircle,
      label: "Live Chat",
      description: "Chat with our support team",
      action: "chat",
      color: "#16a34a",
    },
    {
      icon: Mail,
      label: "Email Support",
      description: "support@helpinghand.com",
      action: "email",
      color: "#7c3aed",
    },
    {
      icon: Phone,
      label: "Phone Support",
      description: "+1 (800) 123-4567",
      action: "phone",
      color: "#d97706",
    },
  ];

  const quickGuides = [
    {
      title: "How to Create a Donation",
      description: "Step-by-step guide for donors",
      screen: "guide-create-donation",
    },
    {
      title: "How to Request Help",
      description: "Guide for recipients",
      screen: "guide-request-help",
    },
    {
      title: "Privacy & Safety Guidelines",
      description: "Stay safe while helping",
      screen: "guide-safety",
    },
    {
      title: "NGO Event Participation",
      description: "Join community campaigns",
      screen: "guide-ngo-events",
    },
  ];

  const handleAction = (action?: string) => {
    if (!action) return;

    switch (action) {
      case "chat":
        alert("Live chat will open here");
        break;
      case "email":
        Linking.openURL("mailto:support@helpinghand.com");
        break;
      case "phone":
        Linking.openURL("tel:+18001234567");
        break;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.subtitle}>We're here to help you</Text>
      </View>

      <View style={styles.content}>
        {/* Contact Options */}
        <Text style={styles.sectionTitle}>Contact Us</Text>

        <View style={styles.card}>
          {helpOptions.map((option, index) => (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.optionRow,
                index !== helpOptions.length - 1 && styles.divider,
              ]}
              onPress={() =>
                option.screen
                  ? onNavigate(option.screen)
                  : handleAction(option.action)
              }
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: option.color + "20" },
                ]}
              >
                <option.icon size={20} color={option.color} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionDesc}>{option.description}</Text>
              </View>

              {option.action ? (
                <ExternalLink size={18} color="#9ca3af" />
              ) : (
                <ChevronRight size={18} color="#9ca3af" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Guides */}
        <Text style={styles.sectionTitle}>Quick Guides</Text>

        {quickGuides.map(guide => (
          <TouchableOpacity
            key={guide.screen}
            style={styles.guideCard}
            onPress={() => onNavigate(guide.screen)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.guideTitle}>{guide.title}</Text>
              <Text style={styles.guideDesc}>{guide.description}</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>
        ))}

        {/* Support Hours */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Support Hours</Text>

          <Text style={styles.supportText}>
            Monday - Friday: 9:00 AM - 6:00 PM EST
          </Text>
          <Text style={styles.supportText}>
            Saturday: 10:00 AM - 4:00 PM EST
          </Text>
          <Text style={styles.supportText}>Sunday: Closed</Text>

          <Text style={styles.supportNote}>
            Email support available 24/7 with response within 24 hours
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: "#1A5F7A",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backText: {
    color: "#fff",
    marginLeft: 8,
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "600",
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111827",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 15,
    color: "#111827",
  },
  optionDesc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  guideCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  guideTitle: {
    fontSize: 15,
    color: "#111827",
    marginBottom: 4,
  },
  guideDesc: {
    fontSize: 12,
    color: "#6b7280",
  },
  supportCard: {
    backgroundColor: "#1A5F7A15",
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#1A5F7A30",
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111827",
  },
  supportText: {
    fontSize: 13,
    color: "#4b5563",
    marginBottom: 2,
  },
  supportNote: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 10,
  },
});
