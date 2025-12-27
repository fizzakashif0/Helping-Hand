<<<<<<< HEAD
import { X } from "lucide-react-native";
import { Modal, Text, TouchableOpacity, View } from "react-native";
=======
import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { X } from "lucide-react-native";
>>>>>>> 5538bb4c6b447a597a5a96cb18d8888f1556697e
import { DonationType } from "./DonationPost";

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTypes: DonationType[];
  onTypeToggle: (type: DonationType) => void;
  onClearAll: () => void;
}

const donationTypes: {
  type: DonationType;
  label: string;
  color: string;
}[] = [
  { type: "clothes", label: "Clothes", color: "#2563eb" },
  { type: "food", label: "Food", color: "#16a34a" },
  { type: "blood", label: "Blood", color: "#dc2626" },
  { type: "financial", label: "Financial", color: "#d97706" },
];

export function FilterSheet({
  isOpen,
  onClose,
  selectedTypes,
  onTypeToggle,
  onClearAll
}: FilterSheetProps) {
  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      {/* Backdrop */}
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          justifyContent: "flex-end"
        }}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Bottom Sheet */}
        <TouchableOpacity
          style={{ backgroundColor: "#fff", paddingHorizontal: 24, paddingVertical: 24 }}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>
              Filter Donations
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Donation Type */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, color: "#4b5563", marginBottom: 12 }}>
              Donation Type
            </Text>

<<<<<<< HEAD
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
=======
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
>>>>>>> 5538bb4c6b447a597a5a96cb18d8888f1556697e
              {donationTypes.map(({ type, label, color }) => {
                const isSelected = selectedTypes.includes(type);

                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => onTypeToggle(type)}
                    style={{
                      flex: 1,
                      minWidth: "45%",
                      flexDirection: "row",
                      alignItems: "center",
<<<<<<< HEAD
                      marginRight: 12,
                      marginBottom: 12,
=======
                      gap: 12,
>>>>>>> 5538bb4c6b447a597a5a96cb18d8888f1556697e
                      padding: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: isSelected ? "#dc2626" : "#e5e7eb",
                      backgroundColor: isSelected ? "#fee2e2" : "#fff"
                    }}
                  >
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: color,
                        opacity: isSelected ? 1 : 0.7
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
<<<<<<< HEAD
                        color: "#1f2937",
                        marginLeft: 12
=======
                        color: "#1f2937"
>>>>>>> 5538bb4c6b447a597a5a96cb18d8888f1556697e
                      }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Actions */}
<<<<<<< HEAD
          <View style={{ flexDirection: "row" }}>
=======
          <View style={{ flexDirection: "row", gap: 12 }}>
>>>>>>> 5538bb4c6b447a597a5a96cb18d8888f1556697e
            <TouchableOpacity
              onPress={onClearAll}
              disabled={selectedTypes.length === 0}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                backgroundColor: "#f9fafb",
<<<<<<< HEAD
                opacity: selectedTypes.length === 0 ? 0.5 : 1,
                marginRight: 12
=======
                opacity: selectedTypes.length === 0 ? 0.5 : 1
>>>>>>> 5538bb4c6b447a597a5a96cb18d8888f1556697e
              }}
            >
              <Text style={{ textAlign: "center", fontSize: 14, fontWeight: "600", color: "#1f2937" }}>
                Clear All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: "#dc2626"
              }}
            >
              <Text style={{ textAlign: "center", fontSize: 14, fontWeight: "600", color: "#fff" }}>
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
<<<<<<< HEAD

export default FilterSheet;
=======
>>>>>>> 5538bb4c6b447a597a5a96cb18d8888f1556697e
