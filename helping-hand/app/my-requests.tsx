import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import BottomNav, { NavItem } from "./components/Navbar";
import MyRequests from "./components/Recipient/MyRequsts";

export default function MyRequestsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NavItem>("donations");

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <MyRequests 
        onBack={() => router.back()} 
        onNavigate={(screen) => console.log("Navigate to:", screen)} 
      />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}
