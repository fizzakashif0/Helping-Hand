import {
  ArrowLeft,
  Bell,
  Calendar,
  Heart,
  MessageSquare,
  TrendingUp,
} from "lucide-react-native";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface NotificationPreferencesProps {
  onBack: () => void;
  onSave: () => void;
}

export default function NotificationPreferences({
  onBack,
  onSave,
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    newDonations: true,
    donationRequests: true,
    messages: true,
    events: true,
    updates: false,
    marketing: false,
  });

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const notificationChannels = [
    { key: "pushNotifications", label: "Push Notifications", icon: Bell },
    { key: "emailNotifications", label: "Email Notifications", icon: Bell },
    { key: "smsNotifications", label: "SMS Notifications", icon: MessageSquare },
  ] as const;

  const notificationTypes = [
    {
      key: "newDonations",
      label: "New Donations",
      description: "When new donations are available nearby",
      icon: Heart,
      color: "#dc2626",
    },
    {
      key: "donationRequests",
      label: "Donation Requests",
      description: "When someone requests your donation",
      icon: Bell,
      color: "#2563eb",
    },
    {
      key: "messages",
      label: "Messages",
      description: "New chat messages from donors/recipients",
      icon: MessageSquare,
      color: "#16a34a",
    },
    {
      key: "events",
      label: "NGO Events",
      description: "New events and campaigns",
      icon: Calendar,
      color: "#7c3aed",
    },
    {
      key: "updates",
      label: "App Updates",
      description: "New features and improvements",
      icon: TrendingUp,
      color: "#1A5F7A",
    },
    {
      key: "marketing",
      label: "Marketing & Promotions",
      description: "Special offers and newsletters",
      icon: Bell,
      color: "#d97706",
    },
  ] as const;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Notification Preferences</Text>
        <Text style={styles.subtitle}>
          Customize how you receive updates
        </Text>
      </View>

      <View style={styles.content}>
        {/* Channels */}
        <Text style={styles.sectionTitle}>Notification Channels</Text>

        <View style={styles.card}>
          {notificationChannels.map((channel, index) => (
            <View
              key={channel.key}
              style={[
                styles.row,
                index !== notificationChannels.length - 1 && styles.divider,
              ]}
            >
              <View style={styles.rowLeft}>
                <channel.icon size={20} color="#9ca3af" />
                <Text style={styles.rowLabel}>{channel.label}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.switch,
                  preferences[channel.key]
                    ? styles.switchOn
                    : styles.switchOff,
                ]}
                onPress={() => togglePreference(channel.key)}
              >
                <View
                  style={[
                    styles.thumb,
                    preferences[channel.key]
                      ? styles.thumbOn
                      : styles.thumbOff,
                  ]}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Types */}
        <Text style={styles.sectionTitle}>Notification Types</Text>

        {notificationTypes.map(type => (
          <View key={type.key} style={styles.typeCard}>
            <View style={styles.typeRow}>
              <View style={styles.typeLeft}>
                <View
                  style={[
                    styles.typeIcon,
                    { backgroundColor: type.color + "20" },
                  ]}
                >
                  <type.icon size={20} color={type.color} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.typeLabel}>{type.label}</Text>
                  <Text style={styles.typeDesc}>{type.description}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.switch,
                  preferences[type.key]
                    ? styles.switchOn
                    : styles.switchOff,
                ]}
                onPress={() => togglePreference(type.key)}
              >
                <View
                  style={[
                    styles.thumb,
                    preferences[type.key]
                      ? styles.thumbOn
                      : styles.thumbOff,
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Actions */}
        <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
          <Text style={styles.saveText}>Save Preferences</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={onBack}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowLabel: {
    marginLeft: 12,
    color: "#111827",
    fontSize: 15,
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  switchOn: {
    backgroundColor: "#1A5F7A",
  },
  switchOff: {
    backgroundColor: "#d1d5db",
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  thumbOn: {
    alignSelf: "flex-end",
  },
  thumbOff: {
    alignSelf: "flex-start",
  },
  typeCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeLeft: {
    flexDirection: "row",
    flex: 1,
    marginRight: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  typeLabel: {
    fontSize: 15,
    color: "#111827",
  },
  typeDesc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: "#1A5F7A",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  cancelBtn: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  cancelText: {
    color: "#374151",
    fontSize: 15,
  },
});
