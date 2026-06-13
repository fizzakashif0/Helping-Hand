import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getToken } from "./lib/token";

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
const POLL_INTERVAL_MS = 10000; // poll every 10 seconds

export default function NGOPendingScreen() {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
  checkVerificationStatus(); // ← fires immediately on mount
  intervalRef.current = setInterval(checkVerificationStatus, 5000);

  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
}, []);

 async function checkVerificationStatus() {
  try {
    setChecking(true);
    const token = await getToken(); 
    console.log('[poll] token:', token ? 'EXISTS' : 'NULL');

    if (!token) return;

    const res = await fetch(`${API_URL}/api/ngos/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('[poll] status:', res.status);
    const data = await res.json();
    console.log('[poll] data:', JSON.stringify(data));

    const status = data?.ngo?.verificationStatus;
    console.log('[poll] verificationStatus:', status);

    if (status === 'verified') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      router.replace('/ngo-home');
    } else if (status === 'rejected') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setStatusMessage('rejected');
    }
  } catch (err) {
    console.log('[poll] error:', err);
  } finally {
    setChecking(false);
  }
}

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Icon */}
        <View style={[
          styles.iconCircle,
          statusMessage === 'rejected' && styles.iconCircleRejected,
        ]}>
          <Ionicons
            name={statusMessage === 'rejected' ? 'close-circle-outline' : 'time-outline'}
            size={48}
            color={statusMessage === 'rejected' ? '#EF4444' : '#FF6B35'}
          />
        </View>

        <Text style={styles.title}>
          {statusMessage === 'rejected' ? 'Application Rejected' : 'Application Submitted'}
        </Text>

        <Text style={styles.body}>
          {statusMessage === 'rejected'
            ? 'Unfortunately your NGO application was not approved. Please re-register with correct details.'
            : 'Thank you for registering your NGO. Our admin team will review your application and verify your details.'
          }
        </Text>

        {/* Steps — only show when not rejected */}
        {statusMessage !== 'rejected' && (
          <View style={styles.stepsContainer}>
            <Step number="1" text="Application received" done />
            <Step number="2" text="Admin review in progress" active />
            <Step number="3" text="Account approved & activated" />
          </View>
        )}

        {/* Polling indicator */}
        {statusMessage !== 'rejected' && (
          <View style={styles.pollingRow}>
            {checking
              ? <ActivityIndicator size="small" color="#1A5F7A" />
              : <Ionicons name="sync-outline" size={14} color="#9CA3AF" />
            }
            <Text style={styles.pollingText}>
              {checking ? 'Checking status...' : 'Auto-checking every 10s'}
            </Text>
          </View>
        )}

        <Text style={styles.note}>
          {statusMessage === 'rejected'
            ? 'Contact support if you believe this is a mistake.'
            : "You'll be able to log in once your account is approved. This usually takes 1–2 business days."
          }
        </Text>

        {statusMessage === 'rejected' ? (
          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={() => router.replace('/ngo-signup')}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Re-register NGO</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Back to Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function Step({
  number,
  text,
  done,
  active,
}: {
  number: string;
  text: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <View style={stepStyles.row}>
      <View
        style={[
          stepStyles.circle,
          done   && stepStyles.circleDone,
          active && stepStyles.circleActive,
        ]}
      >
        {done
          ? <Ionicons name="checkmark" size={14} color="#fff" />
          : <Text style={stepStyles.number}>{number}</Text>
        }
      </View>
      <Text
        style={[
          stepStyles.label,
          done   && stepStyles.labelDone,
          active && stepStyles.labelActive,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A5F7A",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FFF3EE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircleRejected: {
    backgroundColor: "#FEE2E2",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F2141",
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  stepsContainer: {
    alignSelf: "stretch",
    marginBottom: 20,
    gap: 12,
  },
  pollingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  pollingText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  note: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#1A5F7A",
    paddingVertical: 13,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignSelf: "stretch",
  },
  buttonDanger: {
    backgroundColor: "#EF4444",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
  },
});

const stepStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  circleDone: {
    backgroundColor: "#2D9E7A",
  },
  circleActive: {
    backgroundColor: "#FF6B35",
  },
  number: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  label: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  labelDone: {
    color: "#2D9E7A",
    fontWeight: "600",
  },
  labelActive: {
    color: "#FF6B35",
    fontWeight: "600",
  },
});