import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GoogleSignInButton } from "./components/GoogleSignInButton";
import { apiFetch } from "./lib/apiClient";
import { getLoginErrorMessage } from "./lib/authErrors";
import { normalizeUserRole } from "./lib/authRole";
import { parseApiResponse } from "./lib/parseApiResponse";
import { saveToken } from "./lib/token";
import { setUserRole } from "./store/userStore";

interface LoginResponse {
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string | null;
    ngoProfile?: { rejectionReason?: string };
    [key: string]: unknown;
  };
  requiresRoleSelection?: boolean;
  verificationStatus?: string;
  message?: string;
  [key: string]: any;
}

export default function LoginScreen() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);

  const [emailError,  setEmailError]  = useState("");
  const [globalError, setGlobalError] = useState("");

  const clearErrors = () => { setEmailError(""); setGlobalError(""); };
  const handleEmailChange = (v: string) => { setEmail(v); clearErrors(); };
  const handlePassChange  = (v: string) => { setPassword(v); clearErrors(); };

  const callLogin = async (endpoint: string) => {
    clearErrors();

    if (!email.trim() || !password.trim()) {
      setGlobalError("Please enter both email and password");
      return null;
    }

    setLoading(true);
    try {
      const response = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const { ok, status, data } = await parseApiResponse<LoginResponse>(response);

console.log("STATUS:", status);
console.log("OK:", ok);
console.log("DATA:", JSON.stringify(data));
      if (!ok) {
        const rawMessage = (data as any)?.message ?? (data as any)?.error ?? "";
        const errorMessage = getLoginErrorMessage(status, rawMessage);

        if (
          errorMessage.toLowerCase().includes("email") &&
          !errorMessage.toLowerCase().includes("password")
        ) {
          setEmailError(errorMessage);
        } else {
          setGlobalError(errorMessage);
        }

        if (status === 403 && String(rawMessage).toLowerCase().includes("verify")) {
          setGlobalError(errorMessage + " — tap below to resend.");
        }

        return null;
      }

      return data;
    } catch (err: any) {
      setGlobalError(err?.message || "Network error. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const data = await callLogin("/api/auth/login");
    if (!data) return;
    if (data.token) await saveToken(data.token);
    setUserRole(normalizeUserRole(data.user?.role ?? null));
    if (data.requiresRoleSelection) {
      router.push("/role-selection");
    } else {
      router.push("/home");
    }
  };

  const handleNGOLogin = async () => {
    const data = await callLogin("/api/auth/login-ngo");
    if (!data) return;
    if (data.token) await saveToken(data.token);
    setUserRole(normalizeUserRole(data.user?.role ?? null));
    if (data.verificationStatus === "approved") {
      router.push("/ngo-home" as never);
    } else if (data.verificationStatus === "rejected") {
      const reason = data.user?.ngoProfile?.rejectionReason || "No reason provided.";
      setGlobalError(`Application rejected: ${reason}`);
    } else {
      router.push("/ngo-pending" as never);
    }
  };

  const handleAdminLogin = async () => {
    const data = await callLogin("/api/auth/login-admin");
    if (!data) return;
    if (data.token) await saveToken(data.token);
    if (data.user?.role) setUserRole(data.user.role as any);
    router.push("/admin-dashboard" as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

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

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={handlePassChange}
        style={styles.input}
        secureTextEntry
        editable={!loading}
      />

      {globalError ? (
        <View style={styles.globalErrorBox}>
          <Text style={styles.globalErrorText}>{globalError}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleLogin}
        activeOpacity={0.85}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Log In as Donor/Recipient</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.ngoButton, loading && { opacity: 0.6 }]}
        onPress={handleNGOLogin}
        activeOpacity={0.85}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Log In as NGO</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.adminButton, loading && { opacity: 0.6 }]}
        onPress={handleAdminLogin}
        activeOpacity={0.85}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Log In as Admin</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signup")} style={styles.link} disabled={loading}>
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/ngo-signup" as never)} style={styles.link} disabled={loading}>
        <Text style={styles.linkText}>
          Register your <Text style={{ textDecorationLine: "underline" }}>NGO</Text>
        </Text>
      </TouchableOpacity>

      {globalError.includes("resend") ? (
        <TouchableOpacity onPress={() => router.push("/verify-email")} style={styles.link}>
          <Text style={[styles.linkText, { textDecorationLine: "underline" }]}>
            Resend verification email
          </Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialRow}>
        <GoogleSignInButton disabled={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#1A5F7A" },
  title:           { fontSize: 28, fontWeight: "700", marginBottom: 24, textAlign: "center", color: "#fff" },
  input:           { borderWidth: 1, borderColor: "#2D9E7A", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginBottom: 4, backgroundColor: "#fff", color: "#0F2141" },
  inputError:      { borderColor: "#FCA5A5", borderWidth: 2 },
  fieldError:      { color: "#FCA5A5", fontSize: 12, marginBottom: 8, marginLeft: 4 },
  globalErrorBox:  { backgroundColor: "#FEE2E2", borderRadius: 8, padding: 10, marginBottom: 10, marginTop: 4 },
  globalErrorText: { color: "#DC2626", fontSize: 13, textAlign: "center" },
  button:          { backgroundColor: "#2D9E7A", paddingVertical: 12, borderRadius: 8, marginTop: 8 },
  ngoButton:       { backgroundColor: "#FF6B35", paddingVertical: 12, borderRadius: 8, marginTop: 8 },
  adminButton:     { backgroundColor: "#8B5CF6", paddingVertical: 12, borderRadius: 8, marginTop: 8 },
  buttonText:      { color: "#fff", textAlign: "center", fontWeight: "600" },
  link:            { marginTop: 12, alignItems: "center" },
  linkText:        { color: "#fff" },
  divider:         { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  dividerLine:     { flex: 1, height: 1, backgroundColor: "#fff", opacity: 0.3 },
  dividerText:     { color: "#fff", marginHorizontal: 12, fontSize: 12 },
  socialRow:       { flexDirection: "row", justifyContent: "center" },
});