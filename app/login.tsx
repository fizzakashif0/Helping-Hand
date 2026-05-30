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

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const extractErrorMessage = (err: unknown, fallback: string) => {
    const anyErr = err as any;
    const msg =
      anyErr?.response?.data?.message ??
      anyErr?.response?.data?.error ??
      anyErr?.message ??
      anyErr?.toString?.();

    if (typeof msg === "string" && msg.trim()) return msg.trim();
    return fallback;
  };




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



      const { ok, status, data } = await parseApiResponse<LoginResponse>(response);



      if (!ok) {
        const rawMessage =
          (data as any)?.message ??
          (data as any)?.error ??
          (data as any)?.toString?.();

        const errorMessage = getLoginErrorMessage(status, rawMessage);
        const textForVerifyCheck = String(rawMessage || "").toLowerCase();
        if (status === 403 && textForVerifyCheck.includes("verify")) {


          Alert.alert("Email Not Verified", errorMessage, [

            { text: "Resend email", onPress: () => router.push("/verify-email") },

            { text: "OK" },

          ]);

        } else {

          Alert.alert("Login Failed", errorMessage);

        }

        return;

      }



      if (data.token) await saveToken(data.token);

      setUserRole(normalizeUserRole(data.user?.role ?? null));



      if (data.requiresRoleSelection) {

        router.push("/role-selection");

      } else {

        router.push("/home");

      }

    } catch (err) {

      const message = extractErrorMessage(err, "Network error");
      Alert.alert("Error", message || "Server error");

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



      const { ok, status, data } = await parseApiResponse<LoginResponse>(response);



      if (!ok) {

        const rawMessage =
          (data as any)?.message ?? (data as any)?.error ?? (data as any)?.toString?.();
        const errorMessage = getLoginErrorMessage(status, rawMessage);
        Alert.alert("Login Failed", errorMessage);
        return;

      }



      if (data.token) await saveToken(data.token);

      setUserRole(normalizeUserRole(data.user?.role ?? null));



      if (data.verificationStatus === "approved") {

        router.push("/ngo-home");

      } else if (data.verificationStatus === "rejected") {

        const reason = data.user?.ngoProfile?.rejectionReason || "No reason provided.";

        Alert.alert(

          "Application Rejected",

          `Your NGO application was rejected.\n\nReason: ${reason}`

        );

      } else {

        router.push("/ngo-pending");

      }

    } catch (err) {

      const message = extractErrorMessage(err, "Network error");
      Alert.alert("Error", message || "Server error");

    } finally {

      setLoading(false);

    }

  };

  const handleAdminLogin = async () => {

    if (!email.trim() || !password.trim()) {

      Alert.alert("Error", "Please enter email and password");

      return;

    }



    setLoading(true);

    try {

      const response = await apiFetch("/api/auth/login-admin", {

        method: "POST",

        body: JSON.stringify({ email: email.trim(), password }),

      });



      const { ok, status, data } = await parseApiResponse<LoginResponse>(response);



      if (!ok) {

        const rawMessage =
          (data as any)?.message ?? (data as any)?.error ?? (data as any)?.toString?.();
        const errorMessage = getLoginErrorMessage(status, rawMessage);
        Alert.alert("Login Failed", errorMessage);
        return;

      }



      if (data.token) await saveToken(data.token);

      if (data.user?.role) {

        setUserRole(data.user.role as "donor" | "recipient" | "ngo");

      }



      router.push("/admin-dashboard" as never);

    } catch (err) {

      const message = extractErrorMessage(err, "Network error");
      Alert.alert("Error", message || "Server error");

    } finally {


      setLoading(false);

    }

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

        {loading ? (

          <ActivityIndicator color="#fff" />

        ) : (

          <Text style={styles.buttonText}>Log In as Donor/Recipient</Text>

        )}

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

        onPress={() => router.push("/ngo-signup" as never)}

        style={styles.link}

        disabled={loading}

      >

        <Text style={styles.linkText}>

          Register your <Text style={{ textDecorationLine: "underline" }}>NGO</Text>

        </Text>

      </TouchableOpacity>



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

  },

});

