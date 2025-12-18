
import { Clock, Heart, MapPin, MessageCircle, Share2 } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useRouter } from "expo-router";

export type DonationType = "clothes" | "food" | "blood" | "financial";

export interface DonationPostData {
	id: string;
	type: DonationType;
	title: string;
	description: string;
	location: string;
	timeAgo: string;
	urgency: "low" | "medium" | "high";
	likes: number;
	comments: number;
}

const typeLabels = {
clothes: "Clothes",
food: "Food",
blood: "Blood",
financial: "Financial",
};


export function DonationPost({ post }: { post: DonationPostData }) {
const router = useRouter();
return (
<View style={styles.card}>
<View style={styles.header}>
<Badge label={typeLabels[post.type]} />
{post.urgency === "high" && <Badge label="Urgent" style={{ backgroundColor: "#b91c1c" }} />}
</View>


<Text style={styles.title}>{post.title}</Text>
<Text style={styles.description}>{post.description}</Text>


<View style={styles.meta}>
<View style={styles.metaItem}><MapPin size={14} /><Text>{post.location}</Text></View>
<View style={styles.metaItem}><Clock size={14} /><Text>{post.timeAgo}</Text></View>
</View>
<View style={styles.actions}>
<View style={styles.actionLeft}>
<TouchableOpacity style={styles.iconRow}><Heart size={18} /><Text>{post.likes}</Text></TouchableOpacity>
<TouchableOpacity style={styles.iconRow}><MessageCircle size={18} /><Text>{post.comments}</Text></TouchableOpacity>
<TouchableOpacity><Share2 size={18} /></TouchableOpacity>
</View>
<Button title="Donate" onPress={() => router.push('/create')} />
</View>
</View>
);
}


const styles = StyleSheet.create({
card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12 },
header: { flexDirection: "row", gap: 8, marginBottom: 8 },
title: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
description: { color: "#4b5563", marginBottom: 8 },
meta: { flexDirection: "row", gap: 12, marginBottom: 12 },
metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
actions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
actionLeft: { flexDirection: "row", gap: 16 },
iconRow: { flexDirection: "row", gap: 4 },
});