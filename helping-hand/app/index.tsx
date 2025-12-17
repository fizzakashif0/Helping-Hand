import { Stack } from "expo-router";
import HelpingHandHomeScreen from "./components/mainpage_user";
export default function Index() {

  return <>
 <Stack.Screen
     options={{
        headerShown: false
      }}
    />
    <HelpingHandHomeScreen />
    </>
}
