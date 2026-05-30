import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GoogleSignInButton } from "./components/GoogleSignInButton";
import { apiFetch } from "./lib/apiClient";
import { getSignupErrorMessage } from "./lib/authErrors";
import { parseApiResponse } from "./lib/parseApiResponse";


interface RegisterResponse {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string | null;
  };
  requiresEmailVerification?: boolean;
  message?: string;
  verificationUrl?: string;
}

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetail, setSuccessDetail] = useState("");

  const extractErrorMessage = (err: unknown, fallback: string) => {
    // Common shapes:
    // - fetch/parseApiResponse: message is already in `data.message`
    // - axios-like: err.response.data.message
    const anyErr = err as any;
    const msg =
      anyErr?.response?.data?.message ??
      anyErr?.response?.data?.error ??
      anyErr?.message ??
      anyErr?.toString?.();

    if (typeof msg === "string" && msg.trim()) return msg.trim();
    return fallback;
  };

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch("/api/auth/register", {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const { ok, status, data } = await parseApiResponse<any>(response);

      if (!ok) {
        const rawMessage =
          (data as any)?.message ?? (data as any)?.error ?? (data as any)?.toString?.();
        const errorMessage = getSignupErrorMessage(status, rawMessage);
        Alert.alert("Sign Up Failed", errorMessage);
        return;
      }


      // Backend may return a custom message; keep a safe fallback.
      const detail =
        data?.message ||
        "We sent a verification link to your email. Please verify your account, then log in.";

      const devHint =

        __DEV__ && data.verificationUrl
          ? `\n\nDev link (email not configured):\n${data.verificationUrl}`
          : "";
      setSuccessDetail(detail + devHint);
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        router.push("/login");
      }, 3000);
    } catch (err) {
      const message = extractErrorMessage(err, "Network error");
      Alert.alert("Error", message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Signup Successful</Text>
            <Text style={styles.modalMessage}>{successDetail}</Text>
          </View>
        </View>
      </Modal>

      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          placeholder="Full name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          editable={!loading}
        />

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity style={styles.button} onPress={handleSignup} activeOpacity={0.85} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or sign up with</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialRow}>
          <GoogleSignInButton disabled={loading} />
        </View>

        <TouchableOpacity
          onPress={() => router.push("/verify-email")}
          style={styles.link}
          disabled={loading}
        >
          <Text style={styles.linkText}>Need to verify your email?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")} style={styles.link} disabled={loading}>
          <Text style={styles.linkText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#1A5F7A",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#2D9E7A",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
    color: "#0F2141",
  },
  button: {
    backgroundColor: "#2D9E7A",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  link: {
    marginTop: 12,
    alignItems: "center",
  },
  linkText: {
    color: "#fff",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#fff",
    opacity: 0.3,
  },
  dividerText: {
    color: "#fff",
    marginHorizontal: 12,
    fontSize: 12,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A5F7A",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 20,
  },
});
