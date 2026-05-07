import { ArrowLeft, MapPin, MessageSquare, Package, User } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface RequestDonationConfirmProps {
  onConfirm: () => void;
  onBack: () => void;
}

export function RequestDonationConfirm({ onConfirm, onBack }: RequestDonationConfirmProps) {
  const [message, setMessage] = useState("");

  const donation = {
    title: "Fresh groceries and produce",
    type: "Food",
    quantity: "For 5 families",
    location: "Community Center",
    distance: "1.5 km away",
    donor: "Anonymous Helper",
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBack}>
            <ArrowLeft width={24} height={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Help</Text>
        </View>
        <Text style={styles.headerSubtitle}>Review and confirm your request</Text>
      </View>

      {/* Donation Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Donation Details</Text>
        <View style={styles.cardItem}>
          <Package width={20} height={20} color="#1A5F7A" />
          <View style={styles.cardText}>
            <Text style={styles.label}>Item</Text>
            <Text style={styles.value}>{donation.title}</Text>
            <Text style={styles.subValue}>{donation.type} • {donation.quantity}</Text>
          </View>
        </View>

        <View style={styles.cardItem}>
          <MapPin width={20} height={20} color="#1A5F7A" />
          <View style={styles.cardText}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{donation.location}</Text>
            <Text style={styles.subValue}>{donation.distance}</Text>
          </View>
        </View>

        <View style={styles.cardItem}>
          <User width={20} height={20} color="#1A5F7A" />
          <View style={styles.cardText}>
            <Text style={styles.label}>Provided by</Text>
            <Text style={styles.value}>{donation.donor}</Text>
          </View>
        </View>
      </View>

      {/* Add Message */}
      <View style={styles.card}>
        <View style={styles.messageHeader}>
          <MessageSquare width={20} height={20} color="#1A5F7A" />
          <Text style={styles.messageTitle}>Add a message (Optional)</Text>
        </View>
        <TextInput
          style={styles.textarea}
          value={message}
          onChangeText={setMessage}
          placeholder="Share why you need this help or any specific requirements..."
          multiline
          maxLength={300}
        />
        <Text style={styles.charCount}>{message.length}/300</Text>
      </View>

      {/* Privacy Note */}
      <View style={styles.privacyCard}>
        <Text style={styles.privacyText}>
          🔒 Your request will be sent to the donor privately. They can choose to accept and contact you.
        </Text>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
        <Text style={styles.confirmText}>Confirm Request</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>Go Back</Text>
      </TouchableOpacity>

      {/* Info Card */}
      <View style={styles.card}>
        <Text style={styles.infoTitle}>What happens next?</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoNumber}>1.</Text>
          <Text style={styles.infoText}>Your request will be sent to the donor</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoNumber}>2.</Text>
          <Text style={styles.infoText}>The donor will review and respond</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoNumber}>3.</Text>
          <Text style={styles.infoText}>You'll be notified when they accept</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoNumber}>4.</Text>
          <Text style={styles.infoText}>You can then chat to arrange pickup/delivery</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0E4A61" },
  header: { backgroundColor: "#1A5F7A", paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerTop: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  headerTitle: { color: "#fff", fontSize: 20, marginLeft: 10 },
  headerSubtitle: { color: "rgba(255,255,255,0.7)", marginLeft: 34, fontSize: 14 },
  card: { backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 10, padding: 15, margin: 10 },
  cardTitle: { color: "#1A5F7A", fontSize: 16, marginBottom: 10 },
  cardItem: { flexDirection: "row", marginBottom: 10 },
  cardText: { marginLeft: 10 },
  label: { color: "#888", fontSize: 12 },
  value: { color: "#333", fontSize: 14 },
  subValue: { color: "#666", fontSize: 12, marginTop: 2 },
  messageHeader: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  messageTitle: { color: "#1A5F7A", marginLeft: 5, fontSize: 14 },
  textarea: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, minHeight: 100, padding: 10, textAlignVertical: "top" },
  charCount: { textAlign: "right", fontSize: 12, color: "#888", marginTop: 5 },
  privacyCard: { backgroundColor: "rgba(26,95,122,0.2)", borderRadius: 10, padding: 10, marginHorizontal: 10, marginVertical: 5 },
  privacyText: { color: "rgba(255,255,255,0.9)", fontSize: 13 },
  confirmButton: { backgroundColor: "#1A5F7A", marginHorizontal: 10, paddingVertical: 15, borderRadius: 10, marginTop: 10 },
  confirmText: { color: "#fff", fontSize: 16, textAlign: "center" },
  backButton: { borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", marginHorizontal: 10, paddingVertical: 15, borderRadius: 10, marginTop: 10 },
  backText: { color: "#fff", fontSize: 16, textAlign: "center" },
  infoTitle: { color: "#1A5F7A", fontSize: 14, marginBottom: 10 },
  infoItem: { flexDirection: "row", marginBottom: 5 },
  infoNumber: { color: "#1A5F7A", marginRight: 5 },
  infoText: { color: "#666", fontSize: 12 },
});
