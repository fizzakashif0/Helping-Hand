import { Stack } from "expo-router";
import { View } from "react-native";
import DonationFeed from "./components/Donor/DonationFeed";

export default function DonationFeedPage() {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <DonationFeed 
        onBack={() => {}} 
        onNavigate={() => {}} 
      />
    </View>
  );
}
