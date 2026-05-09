import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Shield, ArrowLeft } from "lucide-react-native";

export default function AdminLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    // placeholder behaviour - in real app, this would authenticate with backend
    Alert.alert("Admin Login", `Email: ${email}\nPassword: ${password}`);
    // after login, navigate to admin dashboard
    router.push("/admin-dashboard" as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Portal</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Shield size={64} color="#1A5F7A" />
          <Text style={styles.appName}>Helping-Hand</Text>
          <Text style={styles.adminLabel}>Administrator Access</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Admin Login</Text>

          <TextInput
            placeholder="Admin Email"
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

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={styles.loginButtonText}>Login as Admin</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/login')} style={styles.backLink}>
            <Text style={styles.backLinkText}>Back to User Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A5F7A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
  },
  adminLabel: {
    fontSize: 16,
    color: '#e60000',
    fontWeight: '600',
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#1f2937'
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#1A5F7A',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  backLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  backLinkText: {
    color: '#6b7280',
    fontSize: 14,
  },
});
