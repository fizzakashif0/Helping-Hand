import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { apiFetch } from "./lib/apiClient";
import { saveToken } from "./lib/token";
import { setUserRole } from "./store/userStore";

interface RegisterResponse {
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string | null;
    [key: string]: any;
  };
  requiresRoleSelection?: boolean;
  message?: string;
}

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSignup = async () => {
    // Validate inputs
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

      const data: RegisterResponse = await response.json();
  console.log("Response status:", response.status, "ok:", response.ok);
   console.log("Response data:", JSON.stringify(data));
      if (!response.ok) {
        Alert.alert("Sign Up Failed", data?.message || "An error occurred");
        return;
      }

      // Store user role from the response
      if (data.user?.role) {
        setUserRole(data.user.role as "donor" | "recipient" | "ngo");
      } else {
        setUserRole(null);
      }

      // Save token for future API requests
     if (data.token) await saveToken(data.token);

      // Show success modal
      console.log("About to show modal");
      setShowSuccessModal(true);

      // Auto-dismiss after 2.5 seconds and redirect
      setTimeout(() => {
        setShowSuccessModal(false);
        router.push("/login");
      }, 2500);
    } catch (error) {
       console.log("Caught error:", error);
      Alert.alert("Error", error instanceof Error ? error.message : "An error occurred");
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
            <Text style={styles.modalTitle}>
              Signup Successful
            </Text>
            <Text style={styles.modalMessage}>
              Your account has been created. Please login to continue.
            </Text>
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
        <TouchableOpacity style={styles.socialBtn} onPress={() => Alert.alert("Google", "Google sign-up coming soon")} activeOpacity={0.85} disabled={loading}>
          <Ionicons name="logo-google" size={20} color="#fff" />
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push('/login')} style={styles.link} disabled={loading}>
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
    justifyContent: 'center',
    backgroundColor: '#1A5F7A'
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#fff'
  },
  input: {
    borderWidth: 1,
    borderColor: '#2D9E7A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: '#0F2141'
  },
  button: {
    backgroundColor: '#2D9E7A',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600'
  },
  link: {
    marginTop: 12,
    alignItems: 'center'
  },
  linkText: {
    color: '#fff'
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#fff',
    opacity: 0.3,
  },
  dividerText: {
    color: '#fff',
    marginHorizontal: 12,
    fontSize: 12,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialBtn: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#0F2141',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D9E7A',
    gap: 8,
  },
  socialText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
    marginBottom: 18,
  },
});
