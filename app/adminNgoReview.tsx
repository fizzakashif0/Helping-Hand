import { useRouter } from "expo-router";
import { ArrowLeft, Building2, CheckCircle, ChevronDown, ChevronUp, Clock, XCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { apiFetch } from "./lib/apiClient";

interface NGODocument {
  name: string;
  url: string;
  uploadedAt: string;
}

interface NGOUser {
  _id: string;
  name: string;
  email: string;
}

interface NGO {
  _id: string;
  userId: NGOUser;
  organizationName: string;
  registrationId?: string;
  orgType?: string;
  missionStatement?: string;
  phone?: string;
  address?: string;
  website?: string;
  documents: NGODocument[];
  verificationStatus: "pending" | "verified" | "rejected";
  createdAt: string;
}

export default function NGOReviewScreen() {
  const router = useRouter();
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingNGOs();
  }, []);

  const fetchPendingNGOs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch("/api/admin/ngos/pending");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch NGOs");
      setNgos(data.ngos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load NGOs");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const response = await apiFetch(`/api/admin/ngos/${id}/approve`, {
        method: "PUT",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setNgos((prev) => prev.filter((n) => n._id !== id));
      Alert.alert("Approved", "The NGO application has been approved.");
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (id: string) => {
    setRejectingId(id);
    setRejectReason("");
    setRejectModalVisible(true);
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    if (!rejectReason.trim()) {
      Alert.alert("Required", "Please provide a rejection reason.");
      return;
    }

    setActionLoading(true);
    try {
      const response = await apiFetch(`/api/admin/ngos/${rejectingId}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setNgos((prev) => prev.filter((n) => n._id !== rejectingId));
      setRejectModalVisible(false);
      Alert.alert("Rejected", "The NGO application has been rejected.");
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>NGO Review</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>NGO Review</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchPendingNGOs}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NGO Review</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.countBar}>
        <Clock size={16} color="#fbbf24" />
        <Text style={styles.countText}>
          {ngos.length} application{ngos.length !== 1 ? "s" : ""} pending review
        </Text>
      </View>

      {ngos.length === 0 ? (
        <View style={styles.centered}>
          <CheckCircle size={64} color="#22c55e" />
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>No pending NGO applications.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {ngos.map((ngo) => {
            const isExpanded = expandedId === ngo._id;
            return (
              <View key={ngo._id} style={styles.card}>
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => toggleExpand(ngo._id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.orgIconCircle}>
                    <Building2 size={22} color="#8B5CF6" />
                  </View>
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.orgName}>{ngo.organizationName}</Text>
                    <Text style={styles.orgMeta}>
                      {ngo.orgType?.replace("_", " ") || "General"} • Applied {formatDate(ngo.createdAt)}
                    </Text>
                  </View>
                  {isExpanded
                    ? <ChevronUp size={20} color="#6b7280" />
                    : <ChevronDown size={20} color="#6b7280" />
                  }
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.cardBody}>
                    <View style={styles.divider} />

                    <Detail label="Contact Person" value={ngo.userId?.name || "—"} />
                    <Detail label="Email" value={ngo.userId?.email || "—"} />
                    {ngo.phone && <Detail label="Phone" value={ngo.phone} />}
                    {ngo.registrationId && <Detail label="Registration No." value={ngo.registrationId} />}
                    {ngo.address && <Detail label="Address" value={ngo.address} />}
                    {ngo.website && <Detail label="Website" value={ngo.website} />}
                    {ngo.missionStatement && <Detail label="Mission Statement" value={ngo.missionStatement} />}

                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn, actionLoading && { opacity: 0.6 }]}
                        onPress={() => openRejectModal(ngo._id)}
                        disabled={actionLoading}
                      >
                        <XCircle size={18} color="#dc2626" />
                        <Text style={styles.rejectBtnText}>Reject</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn, actionLoading && { opacity: 0.6 }]}
                        onPress={() => handleApprove(ngo._id)}
                        disabled={actionLoading}
                      >
                        <CheckCircle size={18} color="#fff" />
                        <Text style={styles.approveBtnText}>Approve</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reject Application</Text>
            <Text style={styles.modalSubtitle}>
              Provide a reason so the NGO knows what to fix.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Registration number is invalid..."
              placeholderTextColor="#9ca3af"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setRejectModalVisible(false)}
                disabled={actionLoading}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalReject, actionLoading && { opacity: 0.6 }]}
                onPress={handleReject}
                disabled={actionLoading}
              >
                {actionLoading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.modalRejectText}>Confirm Reject</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: "#0E4A61" },
  header:          { backgroundColor: "#1A5F7A", padding: 20, paddingTop: 50, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton:      { padding: 8 },
  headerTitle:     { color: "#fff", fontSize: 20, fontWeight: "bold" },
  centered:        { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  errorText:       { color: "#fca5a5", fontSize: 15, textAlign: "center", marginBottom: 16 },
  retryBtn:        { backgroundColor: "#8B5CF6", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText:       { color: "#fff", fontWeight: "600" },
  countBar:        { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#0E4A61" },
  countText:       { color: "#fbbf24", fontSize: 14, fontWeight: "600" },
  content:         { padding: 16, paddingBottom: 40 },
  emptyTitle:      { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 16 },
  emptySubtitle:   { color: "#94a3b8", fontSize: 14, marginTop: 6 },
  card:            { backgroundColor: "#fff", borderRadius: 14, marginBottom: 14, overflow: "hidden", elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader:      { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  orgIconCircle:   { width: 44, height: 44, borderRadius: 22, backgroundColor: "#f3e8ff", justifyContent: "center", alignItems: "center" },
  cardHeaderText:  { flex: 1 },
  orgName:         { fontSize: 16, fontWeight: "700", color: "#1f2937" },
  orgMeta:         { fontSize: 12, color: "#6b7280", marginTop: 2, textTransform: "capitalize" },
  cardBody:        { paddingHorizontal: 16, paddingBottom: 16 },
  divider:         { height: 1, backgroundColor: "#f3f4f6", marginBottom: 12 },
  detailRow:       { marginBottom: 10 },
  detailLabel:     { fontSize: 11, color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  detailValue:     { fontSize: 14, color: "#1f2937", marginTop: 2 },
  actions:         { flexDirection: "row", gap: 10, marginTop: 16 },
  actionBtn:       { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, paddingVertical: 12, borderRadius: 8 },
  rejectBtn:       { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca" },
  rejectBtnText:   { color: "#dc2626", fontWeight: "700" },
  approveBtn:      { backgroundColor: "#22c55e" },
  approveBtnText:  { color: "#fff", fontWeight: "700" },
  modalOverlay:    { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalCard:       { backgroundColor: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 400 },
  modalTitle:      { fontSize: 18, fontWeight: "700", color: "#1f2937", marginBottom: 6 },
  modalSubtitle:   { fontSize: 13, color: "#6b7280", marginBottom: 16 },
  modalInput:      { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, padding: 12, fontSize: 14, color: "#1f2937", minHeight: 100, textAlignVertical: "top" },
  modalActions:    { flexDirection: "row", gap: 10, marginTop: 16 },
  modalCancel:     { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center" },
  modalCancelText: { color: "#6b7280", fontWeight: "600" },
  modalReject:     { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: "#dc2626", alignItems: "center" },
  modalRejectText: { color: "#fff", fontWeight: "700" },
});