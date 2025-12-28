import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import BottomNav, { NavItem } from "./components/Navbar";
import BrowseDonations from "./components/Recipient/BrowseDonation";

export default function BrowseDonationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NavItem>("donations");

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <BrowseDonations 
        onBack={() => router.back()} 
        onNavigate={(screen) => console.log("Navigate to:", screen)} 
      />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}
