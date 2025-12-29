import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, CheckCircle, Users, Package, Star, MessageSquare } from "lucide-react-native";

export default function EventCompletionScreen() {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);

  // Mock event completion data
  const completionData = {
    eventName: "Winter Relief Drive",
    totalParticipants: 450,
    itemsDistributed: 1200,
    fundsRaised: 15600,
    completionDate: "2024-01-20",
  };

  const handleComplete = () => {
    Alert.alert(
      "Event Completed",
      "Thank you for completing the event! Your feedback has been recorded.",
      [
        {
          text: "OK",
          onPress: () => router.push("/ngo-home" as any),
        },
      ]
    );
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity
        key={star}
        onPress={() => setRating(star)}
        style={styles.starButton}
      >
        <Star
          size={24}
          color={star <= rating ? "#fbbf24" : "#d1d5db"}
          fill={star <= rating ? "#fbbf24" : "none"}
        />
      </TouchableOpacity>
    ));
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
        <Text style={styles.headerTitle}>Event Completion</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Message */}
        <View style={styles.successCard}>
          <CheckCircle size={48} color="#22c55e" />
          <Text style={styles.successTitle}>Event Completed Successfully!</Text>
          <Text style={styles.successSubtitle}>
            {completionData.eventName} has been completed on {completionData.completionDate}
          </Text>
        </View>

        {/* Event Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Event Summary</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Users size={24} color="#e60000" />
              <Text style={styles.statValue}>{completionData.totalParticipants}</Text>
              <Text style={styles.statLabel}>Participants</Text>
            </View>
            <View style={styles.statCard}>
              <Package size={24} color="#e60000" />
              <Text style={styles.statValue}>{completionData.itemsDistributed}</Text>
              <Text style={styles.statLabel}>Items Distributed</Text>
            </View>
            <View style={styles.statCard}>
              <CheckCircle size={24} color="#e60000" />
              <Text style={styles.statValue}>${completionData.fundsRaised}</Text>
              <Text style={styles.statLabel}>Funds Raised</Text>
            </View>
          </View>
        </View>

        {/* Feedback Section */}
        <View style={styles.feedbackSection}>
          <Text style={styles.sectionTitle}>Share Your Feedback</Text>

          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Rate this event:</Text>
            <View style={styles.starsContainer}>
              {renderStars()}
            </View>
          </View>

          <View style={styles.feedbackInput}>
            <MessageSquare size={20} color="#6b7280" style={styles.feedbackIcon} />
            <TextInput
              style={styles.feedbackTextInput}
              placeholder="Tell us about your experience..."
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Complete Button */}
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>Mark as Completed</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#e60000",
    padding: 20,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  successCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  summarySection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    width: "48%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  feedbackSection: {
    marginBottom: 30,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  starButton: {
    padding: 4,
  },
  feedbackInput: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  feedbackTextInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
    minHeight: 80,
    textAlignVertical: "top",
  },
  completeButton: {
    backgroundColor: "#22c55e",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
