import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import BottomNav, { NavItem } from "./components/Navbar";
import { RecipientNotifications } from "./components/Recipient/NotificationScreen";

export default function RecipientNotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NavItem>("notifications");

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <RecipientNotifications 
        onNavigate={(screen) => {
          console.log("Navigate to:", screen);
          // Add navigation logic based on screen parameter
        }} 
      />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}
