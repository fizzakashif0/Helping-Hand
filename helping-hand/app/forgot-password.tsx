import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { buildApiUrl } from "./lib/api";
import { request } from "./lib/request";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgot = async () => {
    try {
      setLoading(true);
      const res = await request("POST", buildApiUrl("/api/auth/forgot-password"), {
        email,
      });

      // Backend returns otp in debug; frontend should never rely on it for real flow.
      Alert.alert("OTP sent", "Check your email/phone for the OTP.");
      if (res?.otp) {
        // Keep UI unchanged; optionally show OTP for testing.
        Alert.alert("Test OTP", String(res.otp));
      }

      router.push({
        pathname: "/verify-otp" as any,
        params: { email },
      });
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to request OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your email to receive an OTP</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleForgot}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send OTP</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#1A5F7A",
    justifyContent: "center",
  },
  backBtn: {
    position: "absolute",
    top: 40,
    left: 20,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "left",
    color: "#fff",
  },
  subtitle: {
    color: "rgba(255,255,255,0.9)",
    marginBottom: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: "#2D9E7A",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 14,
    backgroundColor: "#fff",
    color: "#0F2141",
  },
  button: {
    backgroundColor: "#2D9E7A",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

