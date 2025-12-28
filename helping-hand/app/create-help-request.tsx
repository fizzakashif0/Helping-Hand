import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import BottomNav, { NavItem } from "./components/Navbar";
import CreateHelpRequestForm from "./components/Recipient/HelpRequestForm";

export default function CreateHelpRequest() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NavItem>("create");

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <CreateHelpRequestForm 
        onSubmit={() => router.back()} 
        onBack={() => router.back()} 
      />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}
