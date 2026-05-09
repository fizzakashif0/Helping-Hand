import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { buildApiUrl } from "../lib/api";
import { DEMO_REQUESTER_ID } from "../lib/donations";
import { timeAgo } from "../lib/timeAgo";
import { createDonationRequestApi } from "../store/donationRequestStore";
import BottomNav, { NavItem } from "../components/Navbar";

type PublicDonation = {
  _id: string;
  type: string;
  title: string;
  shortDescription?: string;
  landmark?: string;
  quantityText?: string;
  images?: string[];
  postedAt?: string;
  createdAt?: string;
  distanceKm?: number;
};

export default function RecipientDonationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [navTab, setNavTab] = useState<NavItem>("donations");
  const [donation, setDonation] = useState<PublicDonation | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(buildApiUrl(`/api/donations/${id}/public`));
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setDonation(data);
    } catch {
      setDonation(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const requestDonation = async () => {
    if (!id || !donation) return;
    setSubmitting(true);
    setError("");
    try {
      await createDonationRequestApi({
        recipientId: DEMO_REQUESTER_ID,
        donationId: String(id),
        recipientDisplayName: "Recipient",
        message: message.trim() || undefined,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#1A5F7A" />
      </View>
    );
  }

  if (!donation) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.err}>Donation not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const img = donation.images?.[0];
  const posted = donation.postedAt || donation.createdAt;

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Donation details</Text>
        </View>

        <View style={styles.card}>
          {img ? (
            <Image source={{ uri: img }} style={styles.hero} />
          ) : null}
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{donation.type}</Text>
          </View>
          <Text style={styles.cardTitle}>{donation.title}</Text>
          <Text style={styles.desc}>{donation.shortDescription}</Text>

          <View style={styles.row}>
            <Ionicons name="location-outline" size={18} color="#1A5F7A" />
            <Text style={styles.meta}>{donation.landmark || "General area"}</Text>
          </View>
          {donation.distanceKm != null ? (
            <View style={styles.row}>
              <Ionicons name="navigate-outline" size={18} color="#1A5F7A" />
              <Text style={styles.meta}>{donation.distanceKm} km away</Text>
            </View>
          ) : null}
          <View style={styles.row}>
            <Ionicons name="time-outline" size={18} color="#1A5F7A" />
            <Text style={styles.meta}>{timeAgo(posted || "")}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="cube-outline" size={18} color="#1A5F7A" />
            <Text style={styles.meta}>{donation.quantityText || "—"}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Message to donor (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Introduce yourself or add pickup preferences"
            value={message}
            onChangeText={setMessage}
            multiline
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.cta, submitting && { opacity: 0.7 }]}
            onPress={requestDonation}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>Request Donation</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNav activeTab={navTab} onTabChange={setNavTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  err: { color: "#b91c1c", marginBottom: 8 },
  link: { color: "#1A5F7A" },
  header: {
    backgroundColor: "#1A5F7A",
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  backText: { color: "#fff", marginLeft: 6 },
  title: { color: "#fff", fontSize: 20, fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  hero: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#e0f2f1",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  typeBadgeText: {
    color: "#00695c",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  desc: { color: "#4b5563", marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  meta: { color: "#374151", flex: 1 },
  label: { fontWeight: "600", color: "#1A5F7A", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  errorText: { color: "#b91c1c", marginBottom: 8 },
  cta: {
    backgroundColor: "#1A5F7A",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontWeight: "600" },
});
