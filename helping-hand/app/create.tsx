import { Stack } from "expo-router";
import { View } from "react-native";
import CreatePost from "./components/CreatePost";

export default function CreateDonation() {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <CreatePost />
    </View>
  );
}
