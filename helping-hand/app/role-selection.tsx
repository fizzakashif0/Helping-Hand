import { Stack, useRouter } from "expo-router";
import { RoleSelection } from "./components/RoleSelectionScreen";
import { setUserRole } from "./store/userStore";

export default function RoleSelectionRoute() {
  const router = useRouter();

  const handleRoleSelect = (role: "donor" | "recipient") => {
    setUserRole(role);
    // Navigate to common home route
    router.push("/home");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <RoleSelection onRoleSelect={handleRoleSelect} />
    </>
  );
}
