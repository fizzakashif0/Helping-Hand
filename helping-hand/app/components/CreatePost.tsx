import { useRouter } from "expo-router";
import { Droplet, MapPin, Phone, Shirt, Users, Utensils } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { addDonation } from "../store/donationStore";
import { Button } from "../ui/button";
import BottomNav, { NavItem } from "./Navbar";


export function CreatePost() {
	const router = useRouter();
	const [type, setType] = useState<"food" | "clothes" | "blood" | "financial">("food");
	const [activeTab, setActiveTab] = useState<NavItem>("create");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [urgency, setUrgency] = useState<"low" | "medium" | "high">("low");
	const [location, setLocation] = useState("");
	const [contact, setContact] = useState("");

	const handleSubmit = () => {
		if (!title || !description || !contact) {
			return;
		}
		addDonation({
			type,
			title,
			recipientName: contact,
			amount: undefined,
			date: new Date().toLocaleDateString(),
			location,
			status: "pending",
		});
		router.push("/donations");
	};

	return (
		<View style={styles.container}>
			<View style={styles.headerBar}>
				<Text style={styles.headerTitle}>Post Donation</Text>
				<Text style={styles.headerSubtitle}>Post your donation </Text>
			</View>

			<ScrollView contentContainerStyle={styles.form}>
				<Text style={styles.sectionLabel}>Select Donation Type *</Text>
				<View style={styles.typeGrid}>
					<TouchableOpacity
						style={[styles.typeCard, type === "food" && styles.typeCardActive]}
						onPress={() => setType("food")}
					>
						<Utensils size={18} color="#9ca3af" />
						<Text style={styles.typeCardTitle}>Food</Text>
						<Text style={styles.typeCardDesc}>post food items or meals</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.typeCard, type === "clothes" && styles.typeCardActive]}
						onPress={() => setType("clothes")}
					>
						<Shirt size={18} color="#9ca3af" />
						<Text style={styles.typeCardTitle}>Clothes</Text>
						<Text style={styles.typeCardDesc}>post clothing or textiles</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.typeCard, type === "blood" && styles.typeCardActive]}
						onPress={() => setType("blood")}
					>
						<Droplet size={18} color="#9ca3af" />
						<Text style={styles.typeCardTitle}>Blood</Text>
						<Text style={styles.typeCardDesc}>post blood donation</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.typeCard, type === "financial" && styles.typeCardActive]}
						onPress={() => setType("financial")}
					>
						<Users size={18} color="#9ca3af" />
						<Text style={styles.typeCardTitle}>Community Help</Text>
						<Text style={styles.typeCardDesc}>post community support</Text>
					</TouchableOpacity>
				</View>

				<Text style={styles.sectionLabel}>Donation Post Title *</Text>
				<TextInput
					style={styles.input}
					placeholder="e.g., Urgent: Food available "
					value={title}
					onChangeText={setTitle}
				/>

				<Text style={styles.sectionLabel}>Description *</Text>
				<TextInput
					style={[styles.input, styles.textarea]}
					placeholder="Provide detailed information about the donation..."
					multiline
					value={description}
					onChangeText={setDescription}
				/>

				<Text style={styles.sectionLabel}>Urgency Level</Text>
				<View style={styles.urgencyRow}>
					<TouchableOpacity
						style={[styles.urgencyBtn, urgency === "low" && styles.urgencyActive]}
						onPress={() => setUrgency("low")}
					>
						<Text style={[styles.urgencyTitle, urgency === "low" && styles.urgencyTitleActive]}>Low</Text>
						<Text style={styles.urgencyDesc}>Not time-sensitive</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.urgencyBtn, urgency === "medium" && styles.urgencyActive]}
						onPress={() => setUrgency("medium")}
					>
						<Text style={[styles.urgencyTitle, urgency === "medium" && styles.urgencyTitleActive]}>Medium</Text>
						<Text style={styles.urgencyDesc}> within a week</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.urgencyBtn, urgency === "high" && styles.urgencyActive]}
						onPress={() => setUrgency("high")}
					>
						<Text style={[styles.urgencyTitle, urgency === "high" && styles.urgencyTitleActive]}>Urgent</Text>
						<Text style={styles.urgencyDesc}>Available immediately</Text>
					</TouchableOpacity>
				</View>

				<Text style={styles.sectionLabel}>Location *</Text>
				<View style={styles.iconInputRow}>
					<MapPin size={18} color="#9ca3af" />
					<TextInput
						style={styles.iconInput}
						placeholder="Enter location or address"
						value={location}
						onChangeText={setLocation}
					/>
				</View>

				<Text style={styles.sectionLabel}>Contact Information *</Text>
				<View style={styles.iconInputRow}>
					<Phone size={18} color="#9ca3af" />
					<TextInput
						style={styles.iconInput}
						placeholder="Phone number or email"
						value={contact}
						onChangeText={setContact}
					/>
				</View>

				<View style={{ marginTop: 16 }}>
					<Button title="Post Donation" onPress={handleSubmit} />
				</View>
			</ScrollView>
            <BottomNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
		</View>
	);
}


const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#f9fafb" },
	headerBar: {
		backgroundColor:'#1A5F7A',
		paddingTop: 16,
		paddingBottom: 16,
		paddingHorizontal: 16,
		borderBottomLeftRadius: 12,
		borderBottomRightRadius: 12,
	},
	headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
	headerSubtitle: { color: "#fee2e2", fontSize: 12, marginTop: 4 },

	form: { padding: 16 },
	sectionLabel: { color: "#4b5563", fontSize: 12, marginBottom: 8 },

	typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
	typeCard: {
		width: "48%",
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 12,
		borderWidth: 1,
		borderColor: "#e5e7eb",
	},
	typeCardActive: { borderColor: "#104f68ff" },
	typeCardTitle: { marginTop: 8, fontWeight: "600", color: "#111827" },
	typeCardDesc: { color: "#6b7280", fontSize: 12 },

	input: { backgroundColor: "#fff", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 12 },
	textarea: { height: 120, textAlignVertical: "top" },

	urgencyRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
	urgencyBtn: {
		flex: 1,
		backgroundColor: "#fff",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#e5e7eb",
		paddingVertical: 10,
		paddingHorizontal: 8,
	},
	urgencyActive: { borderColor: "#dc2626" },
	urgencyTitle: { fontWeight: "600", color: "#111827" },
	urgencyTitleActive: { color: "#dc2626" },
	urgencyDesc: { color: "#6b7280", fontSize: 11 },

	iconInputRow: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb" },
	iconInput: { flex: 1 },
});

export default CreatePost;