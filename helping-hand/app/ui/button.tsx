import React from "react";
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";


interface ButtonProps {
title?: string;
children?: React.ReactNode;
onPress?: () => void;
variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
size?: "default" | "sm" | "lg" | "icon";
disabled?: boolean;
style?: ViewStyle;
}


export function Button({
title,
children,
onPress,
variant = "default",
size = "default",
disabled,
style,
}: ButtonProps) {
	const sizeStyleMap: Record<NonNullable<ButtonProps["size"]>, any> = {
		default: styles.sizeDefault,
		sm: styles.sm,
		lg: styles.lg,
		icon: styles.icon,
	};
return (
<TouchableOpacity
activeOpacity={0.8}
disabled={disabled}
onPress={onPress}
style={[
styles.base,
styles[variant],
				sizeStyleMap[size],
disabled && styles.disabled,
style,
]}
>
<Text style={[styles.text, variant === "outline" && styles.outlineText]}>
{title || children}
</Text>
</TouchableOpacity>
);
}


const styles = StyleSheet.create({
base: {
alignItems: "center",
justifyContent: "center",
borderRadius: 8,
},
text: {
color: "#fff",
fontSize: 14,
fontWeight: "600",
},
default: { backgroundColor: "#1A5F7A" },
destructive: { backgroundColor: "#b91c1c" },
secondary: { backgroundColor: "#6b7280" },
ghost: { backgroundColor: "transparent" },
link: { backgroundColor: "transparent" },
outline: {
backgroundColor: "transparent",
borderWidth: 1,
borderColor: "#dc2626",
},


outlineText: { color: "#dc2626" },


 sizeDefault: { paddingVertical: 10, paddingHorizontal: 16 },
sm: { paddingVertical: 6, paddingHorizontal: 12 },
lg: { paddingVertical: 14, paddingHorizontal: 20 },
icon: { width: 40, height: 40 },

disabled: { opacity: 0.5 },
});

export default Button;