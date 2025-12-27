<<<<<<< HEAD
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
=======
import { Text, View } from "react-native";
import HelpingHandHomeScreen from "./components/mainpage_user";
import {Stack} from "expo-router";
export default function Index() {

  return <>
 <Stack.Screen
     options={{
        headerShown: false
      }}
    />
    <HelpingHandHomeScreen />;
    </>
>>>>>>> 5538bb4c6b447a597a5a96cb18d8888f1556697e
}
