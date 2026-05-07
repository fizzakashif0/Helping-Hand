import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
} from "lucide-react-native";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

interface DeactivateAccountProps {
  onBack: () => void;
  onDeactivate: () => void;
}

export default function DeactivateAccount({
  onBack,
  onDeactivate,
}: DeactivateAccountProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [confirmText, setConfirmText] = useState("");
  const [otherReason, setOtherReason] = useState("");

  const reasons = [
    "Taking a break from the platform",
    "Privacy concerns",
    "Not useful anymore",
    "Found alternative solution",
    "Too many notifications",
    "Other",
  ];

  const toggleReason = (text: string) => {
    setSelectedReasons((prev) =>
      prev.includes(text) ? prev.filter((r) => r !== text) : [...prev, text]
    );
  };

  const canDeactivate =
    confirmText.toLowerCase() === "deactivate" &&
    selectedReasons.length > 0;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={20} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Deactivate Account</Text>
        <Text style={styles.headerSub}>We're sad to see you go</Text>
      </View>

      {/* Warning */}
      <View style={styles.warning}>
        <AlertTriangle size={20} color="#DC2626" />
        <View style={{ flex: 1 }}>
          <Text style={styles.warningTitle}>Important Information</Text>
          <Text style={styles.warningText}>• Profile will be hidden</Text>
          <Text style={styles.warningText}>• Donations will be cancelled</Text>
          <Text style={styles.warningText}>• Reactivate within 30 days</Text>
          <Text style={styles.warningText}>• Data deleted after 30 days</Text>
        </View>
      </View>

      {/* Reasons */}
      <Text style={styles.sectionTitle}>Why are you leaving?</Text>

      {reasons.map((item) => {
        const selected = selectedReasons.includes(item);
        return (
          <Pressable
            key={item}
            style={[
              styles.reasonRow,
              selected && styles.reasonSelected,
            ]}
            onPress={() => toggleReason(item)}
          >
            <View
              style={[
                styles.radio,
                selected && styles.radioSelected,
              ]}
            >
              {selected && <CheckCircle2 size={16} color="#fff" />}
            </View>
            <Text style={selected ? styles.reasonTextActive : styles.reasonText}>
              {item}
            </Text>
          </Pressable>
        );
      })}

      {/* Other reason */}
      {selectedReasons.includes("Other") && (
        <TextInput
          style={styles.input}
          placeholder="Tell us more..."
          value={otherReason}
          onChangeText={setOtherReason}
          multiline
        />
      )}

      {/* Confirm */}
      <Text style={styles.sectionTitle}>Type "DEACTIVATE" to confirm</Text>
      <TextInput
        style={styles.input}
        placeholder="DEACTIVATE"
        value={confirmText}
        onChangeText={setConfirmText}
      />

      {/* Buttons */}
      <Pressable
        style={[
          styles.primaryBtn,
          !canDeactivate && styles.disabledBtn,
        ]}
        disabled={!canDeactivate}
        onPress={onDeactivate}
      >
        <Text style={styles.primaryText}>Deactivate Account</Text>
      </Pressable>

      <Pressable style={styles.secondaryBtn} onPress={onBack}>
        <Text style={styles.secondaryText}>Cancel</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    backgroundColor: "#DC2626",
    padding: 24,
    paddingTop: 50,
  },
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  backText: { color: "#fff", marginLeft: 6 },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "600" },
  headerSub: { color: "#FECACA", marginTop: 4 },

  warning: {
    backgroundColor: "#FEE2E2",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    gap: 12,
  },
  warningTitle: { fontWeight: "600", color: "#7F1D1D" },
  warningText: { color: "#991B1B", fontSize: 12 },

  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 12,
    fontWeight: "600",
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  reasonSelected: {
    borderColor: "#DC2626",
    backgroundColor: "#FEE2E2",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioSelected: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },
  reasonText: { color: "#374151" },
  reasonTextActive: { color: "#7F1D1D" },

  input: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  primaryBtn: {
    backgroundColor: "#DC2626",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledBtn: { backgroundColor: "#D1D5DB" },
  primaryText: { color: "#fff", fontWeight: "600" },

  secondaryBtn: {
    backgroundColor: "#E5E7EB",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryText: { color: "#374151" },
});
