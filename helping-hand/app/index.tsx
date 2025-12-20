import { Stack } from "expo-router";
import { useState } from "react";
import HelpingHandHomeScreen from "./components/Donor/mainpage_user";
import OpeningScreen from "./components/OpeningScreen";
import { RoleSelection } from "./components/RoleSelectionScreen";

type AppStage = "opening" | "roleSelection" | "home";

export default function Index() {
  const [stage, setStage] = useState<AppStage>("opening");
  const [userRole, setUserRole] = useState<"donor" | "recipient" | "ngo" | null>(null);

  const handleGetStarted = () => {
    setStage("roleSelection");
  };

  const handleRoleSelect = (role: "donor" | "recipient" | "ngo") => {
    setUserRole(role);
    setStage("home");
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {stage === "opening" && (
        <OpeningScreen onStart={handleGetStarted} />
      )}
      {stage === "roleSelection" && (
        <RoleSelection onRoleSelect={handleRoleSelect} />
      )}
      {stage === "home" && (
        <HelpingHandHomeScreen />
      )}
    </>
  );
}
