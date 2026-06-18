import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";

// TODO: move to .env when configured
const API_BASE_URL = "http://localhost:5000";

interface CompletionBarProps {
  donationId: string;
  threadStatus: "active" | "locked";
  donationStatus: "in_progress" | "pending_confirmation" | "completed" | "disputed";
  userId: string;
  isDonor: boolean;
  isRecipient: boolean;
  onStatusChange: () => void;
}

export default function CompletionBar({
  donationId,
  threadStatus,
  donationStatus,
  userId,
  isDonor,
  isRecipient,
  onStatusChange,
}: CompletionBarProps) {
  const [loading, setLoading] = useState(false);

  const handleMarkComplete = async () => {
    try {
      setLoading(true);
      await axios.patch(`${API_BASE_URL}/api/donations/${donationId}/complete`, {
        userId,
      });
      Alert.alert("Success", "Donation marked as completed!");
      onStatusChange();
    } catch (error) {
      Alert.alert("Error", "Failed to mark donation as complete");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await axios.patch(`${API_BASE_URL}/api/donations/${donationId}/confirm`, {
        userId,
      });
      Alert.alert("Success", "Donation confirmed as completed!");
      onStatusChange();
    } catch (error) {
      Alert.alert("Error", "Failed to confirm completion");
    } finally {
      setLoading(false);
    }
  };

  const handleDispute = async () => {
    Alert.prompt(
      "Dispute Completion",
      "Please provide a reason for disputing this completion:",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Submit",
          onPress: async (reason) => {
            try {
              setLoading(true);
              await axios.patch(`${API_BASE_URL}/api/donations/${donationId}/dispute`, {
                userId,
                reason,
              });
              Alert.alert("Success", "Dispute submitted. Admins will review.");
              onStatusChange();
            } catch (error) {
              Alert.alert("Error", "Failed to submit dispute");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Donor sees "Mark as Completed" button
  if (isDonor && donationStatus === "in_progress") {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleMarkComplete}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="check-circle" size={18} color="#fff" />
              <Text style={styles.buttonText}>Mark as Completed</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // Recipient sees confirmation options when donor marked as complete
  if (isRecipient && donationStatus === "pending_confirmation") {
    return (
      <View style={styles.container}>
        <Text style={styles.statusText}>Donor marked this complete</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="check" size={16} color="#fff" />
                <Text style={styles.buttonText}>Confirm</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.disputeButton]}
            onPress={handleDispute}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="close" size={16} color="#fff" />
                <Text style={styles.buttonText}>Dispute</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show nothing when status is completed or locked
  return null;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  completeButton: {
    backgroundColor: "#31a24c",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  confirmButton: {
    backgroundColor: "#31a24c",
  },
  disputeButton: {
    backgroundColor: "#d32f2f",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  statusText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "500",
  },
});
