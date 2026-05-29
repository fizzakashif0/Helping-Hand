import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiFetch } from "./lib/apiClient";
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
    [key: string]: any;
  };
  requiresRoleSelection?: boolean;
  verificationStatus?: string;
  message?: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
        return;
      }

      if (data.token) await saveToken(data.token);
      if (data.user?.role) {
        setUserRole(data.user.role as "donor" | "recipient" | "ngo");
      } else {
        setUserRole(null);
      }

      if (data.requiresRoleSelection) {
        router.push("/role-selection");
      } else {
        router.push("/home");
      }
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNGOLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }


  setLoading(true);
  try {
    const response = await apiFetch("/api/auth/login-ngo", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const data: LoginResponse & { verificationStatus?: string } = await response.json();

    if (!response.ok) {
      Alert.alert("Login Failed", data.message || "Invalid credentials");
      return;
    }

    if (data.token) await saveToken(data.token);
    if (data.user?.role) {
      setUserRole(data.user.role as "donor" | "recipient" | "ngo");
    }

    // Route based on verification status
    if (data.verificationStatus === "approved") {
      router.push("/ngo-home" );
    } else if (data.verificationStatus === "rejected") {
      const reason = data.user?.ngoProfile?.rejectionReason || "No reason provided.";
      Alert.alert(
        "Application Rejected",
        `Your NGO application was rejected.\n\nReason: ${reason}`,
      );
    } else {
      // pending
      router.push("/ngo-pending");
    }
  } catch {
    Alert.alert("Error", "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};
  const handleAdminLogin = () => {
    Alert.alert("Admin Login", "Coming soon");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

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

      <TouchableOpacity
        onPress={() => router.push("/signup")}
        style={styles.link}
        disabled={loading}
      >
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/ngo-signup" as any)}
        style={styles.link}
        disabled={loading}
      >
        <Text style={styles.linkText}>
          Register your <Text style={{ textDecorationLine: "underline" }}>NGO</Text>
        </Text>
      </TouchableOpacity>
    </View>
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
  ngoButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  adminButton: {
    backgroundColor: "#8B5CF6",
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
});