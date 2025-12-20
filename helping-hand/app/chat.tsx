import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { ChatScreen } from "./components/Chat";

export default function ChatPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleComplete = () => {
    Alert.alert("Success", "Donation marked as complete!");
  };

  return (
    <ChatScreen
      onBack={handleBack}
      onComplete={handleComplete}
      userRole="donor"
    />
  );
}
