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
}
