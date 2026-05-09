import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      const emailVal = email.trim();
      const passwordVal = password;

      if (!emailVal || !passwordVal) {
        Alert.alert("Error", "Email and password are required");
        return;
      }

      setLoading(true);

      const { buildApiUrl } = await import("./lib/api");
      const { request } = await import("./lib/request");
      const tokenHelper = await import("./lib/token");

      const res: any = await request("POST", buildApiUrl("/api/auth/login"), {
        email: emailVal,
        password: passwordVal,
      });

      if (res?.token) {
        await tokenHelper.setToken(res.token);
      }

      router.push("/role-selection");
    } catch (e: any) {
      Alert.alert("Login failed", e?.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  const handleNGOLogin = () => {
    // placeholder behaviour for NGO login
    Alert.alert("NGO Login", `Email: ${email}\nPassword: ${password}`);
    router.push("/ngo-home" as any);
  };

  const handleAdminLogin = () => {
    // placeholder behaviour for Admin login
    Alert.alert("Admin Login", `Email: ${email}\nPassword: ${password}`);
    router.push("/admin-dashboard" as any);
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
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In as Donor/Recipient</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.ngoButton} onPress={handleNGOLogin} activeOpacity={0.85}>
        <Text style={styles.buttonText}>Log In as NGO</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.adminButton} onPress={handleAdminLogin} activeOpacity={0.85}>
        <Text style={styles.buttonText}>Log In as Admin</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/forgot-password" as any)}
        style={styles.link}
      >
        <Text style={styles.linkText}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signup")} style={styles.link}>
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
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
    alignItems: "center",
  },
  ngoButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  adminButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
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

