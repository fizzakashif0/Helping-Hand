import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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
  user?: { id: string; name: string; email: string; role: string | null };
  requiresEmailVerification?: boolean;
  message?: string;
  verificationUrl?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Inline field errors ──────────────────────────────────────────────────
  const [nameError,     setNameError]     = useState("");
  const [emailError,    setEmailError]    = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [globalError,   setGlobalError]   = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetail,    setSuccessDetail]    = useState("");

  // ── Clear errors on change ───────────────────────────────────────────────
  const handleNameChange  = (v: string) => { setName(v);     setNameError("");  setGlobalError(""); };
  const handleEmailChange = (v: string) => { setEmail(v);    setEmailError(""); setGlobalError(""); };
  const handlePassChange  = (v: string) => { setPassword(v); setPasswordError(""); setGlobalError(""); };

  // ── Client-side validation ───────────────────────────────────────────────
  const validate = () => {
    let valid = true;

    if (!name.trim()) {
      setNameError("Full name is required");
      valid = false;
    }

    if (!email.trim()) {
      setEmailError("Email is required");
      valid = false;
    } else if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError("Invalid email format");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    }

    return valid;
  };

  const handleSignup = async () => {
    setGlobalError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await apiFetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:     name.trim(),
          email:    email.trim(),
          password,
        }),
      });

      const { ok, status, data } = await parseApiResponse<any>(response);

      if (!ok) {
        const rawMessage =
          (data as any)?.message ?? (data as any)?.error ?? "";
        const errorMessage = getSignupErrorMessage(status, rawMessage);

        // Route error to the right field
        if (errorMessage.toLowerCase().includes("email") && errorMessage.toLowerCase().includes("use")) {
          setEmailError(errorMessage);
        } else if (errorMessage.toLowerCase().includes("email format") || errorMessage.toLowerCase().includes("invalid email")) {
          setEmailError(errorMessage);
        } else {
          setGlobalError(errorMessage);
        }
        return;
      }

      const detail =
        data?.message ||
        "We sent a verification link to your email. Please verify your account, then log in.";

      const devHint =
        __DEV__ && data.verificationUrl
          ? `\n\nDev link:\n${data.verificationUrl}`
          : "";

      setSuccessDetail(detail + devHint);
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setGlobalError(err?.message || "Network error. Please try again.");
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
            <Text style={styles.modalTitle}>Signup Successful 🎉</Text>
            <Text style={styles.modalMessage}>{successDetail}</Text>
          </View>
        </View>
      </Modal>

      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>

        {/* Name */}
        <TextInput
          placeholder="Full name"
          value={name}
          onChangeText={handleNameChange}
          style={[styles.input, nameError ? styles.inputError : null]}
          editable={!loading}
        />
        {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}

        {/* Email */}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={handleEmailChange}
          style={[styles.input, emailError ? styles.inputError : null]}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

        {/* Password */}
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={handlePassChange}
          style={[styles.input, passwordError ? styles.inputError : null]}
          secureTextEntry
          editable={!loading}
        />
        {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}

        {/* Global error */}
        {globalError ? (
          <View style={styles.globalErrorBox}>
            <Text style={styles.globalErrorText}>{globalError}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSignup}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Sign Up</Text>
          }
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

        <TouchableOpacity
          onPress={() => router.push("/login")}
          style={styles.link}
          disabled={loading}
        >
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
    marginBottom: 4,
    backgroundColor: "#fff",
    color: "#0F2141",
  },
  inputError: {
    borderColor: "#FCA5A5",
    borderWidth: 2,
  },
  fieldError: {
    color: "#FCA5A5",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  globalErrorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  globalErrorText: {
    color: "#DC2626",
    fontSize: 13,
    textAlign: "center",
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