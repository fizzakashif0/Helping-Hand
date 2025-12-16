import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "default" | "outline";
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const styles = StyleSheet.create({
  buttonDefault: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center"
  },
  buttonOutline: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center"
  },
  textDefault: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14
  },
  textOutline: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 14
  }
});

export function Button({
  children,
  variant = "default",
  onPress,
  disabled = false,
  style
}: ButtonProps) {
  const isOutline = variant === "outline";
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        isOutline ? styles.buttonOutline : styles.buttonDefault,
        disabled && { opacity: 0.5 },
        style
      ]}
      activeOpacity={0.8}
    >
      <Text style={isOutline ? styles.textOutline : styles.textDefault}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}
