import { Stack, useRouter } from "expo-router";
import { View } from "react-native";
import CreateDonationForm from "./components/Donor/DonationPost";

export default function CreateDonation() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <CreateDonationForm 
        onSubmit={() => router.back()} 
        onBack={() => router.back()} 
      />
    </View>
  );
}
