<<<<<<< HEAD
import { StyleSheet, Text, View } from "react-native";

=======
import React from "react";
import clsx from "clsx";
>>>>>>> origin/feature/mahnoor

interface BadgeProps {
label: string;
variant?: "default" | "secondary" | "destructive" | "outline";
style?: any;
}


export function Badge({ label, variant = "default", style }: BadgeProps) {
return (
<View style={[styles.base, styles[variant], style]}>
<Text style={styles.text}>{label}</Text>
</View>
);
}
const styles = StyleSheet.create({
base: {
paddingHorizontal: 8,
paddingVertical: 4,
borderRadius: 6,
alignSelf: "flex-start",
},
text: {
color: "#fff",
fontSize: 12,
fontWeight: "600",
},
default: { backgroundColor: "#dc2626" },
secondary: { backgroundColor: "#6b7280" },
destructive: { backgroundColor: "#b91c1c" },
outline: {
backgroundColor: "transparent",
borderWidth: 1,
borderColor: "#dc2626",
},
});