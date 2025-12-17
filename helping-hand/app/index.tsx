import { Stack } from "expo-router";
import { useState } from "react";
import HelpingHandHomeScreen from "./components/mainpage_user";
import OpeningScreen from "./components/OpeningScreen";

export default function Index() {
  const [started, setStarted] = useState(false);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {started ? (
        <HelpingHandHomeScreen />
      ) : (
        <OpeningScreen onStart={() => setStarted(true)} />
      )}
    </>
  );
}
