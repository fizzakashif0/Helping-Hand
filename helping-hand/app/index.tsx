import { Stack } from "expo-router";
import OpeningScreen from "./components/OpeningScreen";

export default function Index() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <OpeningScreen />
    </>
  );
}
