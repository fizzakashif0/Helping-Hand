import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../services/chatApi";

interface FeedbackFormProps {
  visible: boolean;
  donationId: string;
  revieweeId: string;
  userId: string;
  role: "donor" | "recipient";
  onDismiss: () => void;
  onSubmitSuccess: () => void;
}

export default function FeedbackForm({
  visible,
  donationId,
  revieweeId,
  userId,
  role,
  onDismiss,
  onSubmitSuccess,
}: FeedbackFormProps) {
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!visible) {
      setReviewText("");
      setSubmitted(false);
    }
  }, [visible]);

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
  };

  const handleSubmit = async () => {
    const wordCount = countWords(reviewText);

    if (wordCount < 4) {
      Alert.alert("Too Short", "Please write at least 4 words in your review.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/api/reviews", {
        donationId,
        revieweeId,
        role,
        text: reviewText.trim(),
      });

      setSubmitted(true);
      setTimeout(() => {
        onSubmitSuccess();
        onDismiss();
      }, 2000);
    } catch (error) {
      Alert.alert("Error", "Failed to submit your review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.overlay} />

        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onDismiss} disabled={submitted}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.title}>How was your experience?</Text>
            <View style={{ width: 24 }} />
          </View>

          {submitted ? (
            <View style={styles.successContainer}>
              <MaterialIcons name="check-circle" size={60} color="#31a24c" />
              <Text style={styles.successText}>
                Thank you! Your review is being processed.
              </Text>
              <Text style={styles.successSubtext}>
                Your trust score will update shortly.
              </Text>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Write your review..."
                placeholderTextColor="#999"
                multiline
                maxLength={500}
                value={reviewText}
                onChangeText={setReviewText}
                editable={!loading}
              />

              <View style={styles.wordCount}>
                <Text style={styles.wordCountText}>
                  {countWords(reviewText)} / 4 words minimum
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  countWords(reviewText) < 4 && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading || countWords(reviewText) < 4}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Review</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.privacyNote}>
                Your review is private. Only your trust score is shown publicly.
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    textAlign: "center",
  },
  formContainer: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: "top",
  },
  wordCount: {
    alignItems: "flex-end",
  },
  wordCountText: {
    fontSize: 12,
    color: "#999",
  },
  submitButton: {
    backgroundColor: "#1A5F7A",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  privacyNote: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  successText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginTop: 16,
    textAlign: "center",
  },
  successSubtext: {
    fontSize: 13,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
});

