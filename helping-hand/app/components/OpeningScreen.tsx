import { LinearGradient } from "expo-linear-gradient";
import { HandHeart } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface OpeningPageProps {
  onGetStarted: () => void;
}

export default function OpeningPage({ onGetStarted }: OpeningPageProps) {
  return (
    <LinearGradient
      colors={["#1A5F7A", "#0E4A61", "#082F3E"]}
      style={styles.container}
    >
      {/* Floating background circles */}
      <View style={[styles.circle, styles.circleTop]} />

      <View style={[styles.circle, styles.circleBottom]} />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo */}
        <View>
          <View style={styles.logoWrapper}>
            <View style={styles.logoGlow} />
            <View style={styles.logo}>
              <HandHeart size={80} color="white" />
            </View>
          </View>
        </View>

        {/* App Name */}
        <Text
          style={styles.title}
        >
          Helping Hand
        </Text>

        {/* Tagline */}
        <Text
          style={styles.tagline}
        >
          Making a difference, one donation at a time
        </Text>

        {/* Description */}
        <Text
          style={styles.description}
        >
          Connect with those in need and make an impact through clothes, food,
          blood, and financial donations
        </Text>

        {/* Buttons */}
        <View
          style={styles.buttonGroup}
        >
          <TouchableOpacity style={styles.primaryButton} onPress={onGetStarted}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <View style={styles.authRow}>
            <TouchableOpacity onPress={onGetStarted}>
              <Text style={styles.authText}>Login</Text>
            </TouchableOpacity>

            <Text style={styles.separator}>|</Text>

            <TouchableOpacity onPress={onGetStarted}>
              <Text style={styles.authText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
  },
  circleTop: {
    width: 260,
    height: 260,
    top: 80,
    left: -40,
  },
  circleBottom: {
    width: 320,
    height: 320,
    bottom: 60,
    right: -60,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoWrapper: {
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 70,
  },
  logo: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 28,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
  },
  tagline: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: 40,
  },
  buttonGroup: {
    alignItems: "center",
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: "#1A5F7A",
    fontSize: 16,
    fontWeight: "600",
  },
  authRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  authText: {
    color: "white",
    fontSize: 14,
  },
  separator: {
    color: "rgba(255,255,255,0.5)",
  },
});
