import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NGOPendingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="time-outline" size={48} color="#FF6B35" />
        </View>

        <Text style={styles.title}>Application Submitted</Text>

        <Text style={styles.body}>
          Thank you for registering your NGO. Our admin team will review your
          application and verify your details.
        </Text>

        <View style={styles.stepsContainer}>
          <Step number="1" text="Application received" done />
          <Step number="2" text="Admin review in progress" active />
          <Step number="3" text="Account approved & activated" />
        </View>

        <Text style={styles.note}>
          You'll be able to log in once your account is approved. This usually
          takes 1–2 business days.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/login")}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Step({
  number,
  text,
  done,
  active,
}: {
  number: string;
  text: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <View style={stepStyles.row}>
      <View
        style={[
          stepStyles.circle,
          done   && stepStyles.circleDone,
          active && stepStyles.circleActive,
        ]}
      >
        {done
          ? <Ionicons name="checkmark" size={14} color="#fff" />
          : <Text style={stepStyles.number}>{number}</Text>
        }
      </View>
      <Text
        style={[
          stepStyles.label,
          done   && stepStyles.labelDone,
          active && stepStyles.labelActive,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A5F7A",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FFF3EE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F2141",
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  stepsContainer: {
    alignSelf: "stretch",
    marginBottom: 20,
    gap: 12,
  },
  note: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#1A5F7A",
    paddingVertical: 13,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignSelf: "stretch",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
  },
});

const stepStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  circleDone: {
    backgroundColor: "#2D9E7A",
  },
  circleActive: {
    backgroundColor: "#FF6B35",
  },
  number: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  label: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  labelDone: {
    color: "#2D9E7A",
    fontWeight: "600",
  },
  labelActive: {
    color: "#FF6B35",
    fontWeight: "600",
  },
});