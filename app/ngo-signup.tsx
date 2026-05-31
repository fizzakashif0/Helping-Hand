import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { apiFetch } from "./lib/apiClient";
import { saveToken } from "./lib/token";
import { setUserRole } from "./store/userStore";

const ORG_TYPES = [
  { label: "Food Bank",  value: "food_bank" },
  { label: "Shelter",    value: "shelter"   },
  { label: "Medical",    value: "medical"   },
  { label: "Education",  value: "education" },
  { label: "General",    value: "general"   },
  { label: "Other",      value: "other"     },
];

export default function NGOSignupScreen() {
  const router = useRouter();

  // ── required fields ──────────────────────────────────────────────────────
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [orgName,  setOrgName]  = useState("");

  // ── optional fields ──────────────────────────────────────────────────────
  const [regNumber,        setRegNumber]        = useState("");
  const [orgType,          setOrgType]          = useState("");
  const [missionStatement, setMissionStatement] = useState("");
  const [phone,            setPhone]            = useState("");
  const [address,          setAddress]          = useState("");
  const [website,          setWebsite]          = useState("");
  const [showOrgTypePicker, setShowOrgTypePicker] = useState(false);

  const [loading, setLoading] = useState(false);

  const selectedOrgTypeLabel =
    ORG_TYPES.find((t) => t.value === orgType)?.label || "Select type…";

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !orgName.trim()) {
      Alert.alert("Error", "Name, email, password and organisation name are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch("/api/auth/register-ngo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:              name.trim(),
          email:             email.trim(),
          password,
          orgName:           orgName.trim(),
          registrationNumber: regNumber.trim() || undefined,
          orgType:           orgType || undefined,
          missionStatement:  missionStatement.trim() || undefined,
          phone:             phone.trim() || undefined,
          address:           address.trim() || undefined,
          website:           website.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Registration Failed", data?.message || "An error occurred");
        return;
      }

      if (data.token) await saveToken(data.token);
      if (data.user?.role) setUserRole(data.user.role as "ngo");

      router.push("/ngo-pending" as any);
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Register Your NGO</Text>
      <Text style={styles.subtitle}>
        Fill in your details. Our team will review your application before granting access.
      </Text>

      {/* ── Account details ─────────────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>Account Details</Text>

      <TextInput
        placeholder="Full name *"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
        style={styles.input}
        editable={!loading}
      />
      <TextInput
        placeholder="Email *"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />
      <TextInput
        placeholder="Password *"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        editable={!loading}
      />

      {/* ── Organisation details ─────────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>Organisation Details</Text>

      <TextInput
        placeholder="Organisation name *"
        placeholderTextColor="#aaa"
        value={orgName}
        onChangeText={setOrgName}
        style={styles.input}
        editable={!loading}
      />
      <TextInput
        placeholder="Registration / licence number"
        placeholderTextColor="#aaa"
        value={regNumber}
        onChangeText={setRegNumber}
        style={styles.input}
        editable={!loading}
      />

      {/* Org type picker */}
      <TouchableOpacity
        style={[styles.input, styles.pickerBtn]}
        onPress={() => setShowOrgTypePicker((v) => !v)}
        disabled={loading}
      >
        <Text style={{ color: orgType ? "#0F2141" : "#aaa" }}>
          {selectedOrgTypeLabel}
        </Text>
      </TouchableOpacity>

      {showOrgTypePicker && (
        <View style={styles.pickerList}>
          {ORG_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[
                styles.pickerItem,
                orgType === t.value && styles.pickerItemActive,
              ]}
              onPress={() => {
                setOrgType(t.value);
                setShowOrgTypePicker(false);
              }}
            >
              <Text
                style={[
                  styles.pickerItemText,
                  orgType === t.value && styles.pickerItemTextActive,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TextInput
        placeholder="Mission statement"
        placeholderTextColor="#aaa"
        value={missionStatement}
        onChangeText={setMissionStatement}
        style={[styles.input, styles.textArea]}
        multiline
        numberOfLines={3}
        editable={!loading}
      />
      <TextInput
        placeholder="Phone number"
        placeholderTextColor="#aaa"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
        editable={!loading}
      />
      <TextInput
        placeholder="Address"
        placeholderTextColor="#aaa"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
        editable={!loading}
      />
      <TextInput
        placeholder="Website (optional)"
        placeholderTextColor="#aaa"
        value={website}
        onChangeText={setWebsite}
        style={styles.input}
        keyboardType="url"
        autoCapitalize="none"
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleRegister}
        activeOpacity={0.85}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Submit Application</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/login")}
        style={styles.link}
        disabled={loading}
      >
        <Text style={styles.linkText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#1A5F7A",
  },
  container: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#ffffffcc",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 18,
  },
  sectionLabel: {
    color: "#2D9E7A",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 8,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  pickerBtn: {
    justifyContent: "center",
  },
  pickerList: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2D9E7A",
    marginBottom: 12,
    overflow: "hidden",
  },
  pickerItem: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  pickerItemActive: {
    backgroundColor: "#2D9E7A22",
  },
  pickerItemText: {
    color: "#0F2141",
    fontSize: 14,
  },
  pickerItemTextActive: {
    color: "#2D9E7A",
    fontWeight: "700",
  },
  button: {
    backgroundColor: "#FF6B35",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
  },
  link: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    color: "#fff",
  },
});