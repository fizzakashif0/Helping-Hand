import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Clock, Target, AlertTriangle } from "lucide-react-native";

export default function EventDetailsSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [detailsData, setDetailsData] = useState({
    duration: "",
    targetAmount: "",
    urgencyLevel: "Medium",
    specialInstructions: "",
  });

  const handleContinue = () => {
    // Basic validation
    if (!detailsData.duration) {
      Alert.alert("Error", "Please enter event duration");
      return;
    }

    // Combine with previous data and navigate to publish confirmation
    const eventData = {
      ...params,
      ...detailsData,
    };

    router.push({
      pathname: "/publish-event-confirmation",
      params: eventData,
    });
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
        <Text style={styles.headerTitle}>Event Details Setup</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Event Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Event Summary</Text>
          <Text style={styles.summaryText}>Name: {params.name}</Text>
          <Text style={styles.summaryText}>Location: {params.location}</Text>
          <Text style={styles.summaryText}>Date: {params.date}</Text>
        </View>

        {/* Duration */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Event Duration *</Text>
          <View style={styles.inputWithIcon}>
            <Clock size={20} color="#6b7280" style={styles.icon} />
            <TextInput
              style={styles.inputWithIconText}
              placeholder="e.g., 2 weeks, 1 month"
              value={detailsData.duration}
              onChangeText={(text) =>
                setDetailsData({ ...detailsData, duration: text })
              }
            />
          </View>
        </View>

        {/* Target Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Donation Amount</Text>
          <View style={styles.inputWithIcon}>
            <Target size={20} color="#6b7280" style={styles.icon} />
            <TextInput
              style={styles.inputWithIconText}
              placeholder="Enter target amount (optional)"
              keyboardType="numeric"
              value={detailsData.targetAmount}
              onChangeText={(text) =>
                setDetailsData({ ...detailsData, targetAmount: text })
              }
            />
          </View>
        </View>

        {/* Urgency Level */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Urgency Level</Text>
          <View style={styles.urgencyOptions}>
            {["Low", "Medium", "High", "Critical"].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.urgencyButton,
                  detailsData.urgencyLevel === level && styles.urgencyButtonActive,
                ]}
                onPress={() =>
                  setDetailsData({ ...detailsData, urgencyLevel: level })
                }
              >
                <Text
                  style={[
                    styles.urgencyButtonText,
                    detailsData.urgencyLevel === level && styles.urgencyButtonTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Special Instructions */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Special Instructions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any special instructions for donors or participants"
            multiline
            numberOfLines={4}
            value={detailsData.specialInstructions}
            onChangeText={(text) =>
              setDetailsData({ ...detailsData, specialInstructions: text })
            }
          />
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <AlertTriangle size={20} color="#f59e0b" />
          <Text style={styles.warningText}>
            Please ensure all information is accurate. Once published, some details cannot be changed.
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue to Publish</Text>
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
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  icon: {
    marginLeft: 12,
  },
  inputWithIconText: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  urgencyOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  urgencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  urgencyButtonActive: {
    backgroundColor: "#e60000",
    borderColor: "#e60000",
  },
  urgencyButtonText: {
    fontSize: 14,
    color: "#6b7280",
  },
  urgencyButtonTextActive: {
    color: "#fff",
  },
  warningCard: {
    backgroundColor: "#fef3c7",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: "#92400e",
    marginLeft: 8,
    flex: 1,
  },
  continueButton: {
    backgroundColor: "#e60000",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
