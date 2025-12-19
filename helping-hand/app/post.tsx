import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import DonationPost, { DonationPostData, DonationType } from "./components/Donor/DonationPost";
import BottomNav, { NavItem } from "./components/Navbar";

export default function PostPage() {
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<NavItem>("notifications");

  const sample: DonationPostData = {
    id: "sample",
    type: (params.type as DonationType) || "food",
    title: (params.title as string) || "Sample Donation Post",
    description:
      (params.description as string) ||
      "This is a sample donation post. Pass query params to customize.",
    location: (params.location as string) || "Downtown",
    timeAgo: (params.timeAgo as string) || "5 min ago",
    urgency: (params.urgency as "low" | "medium" | "high") || "medium",
    likes: Number(params.likes ?? 12),
    comments: Number(params.comments ?? 3),
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <DonationPost post={sample} />
      </ScrollView>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}
