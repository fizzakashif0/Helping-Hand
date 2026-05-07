import { useEffect, useState } from "react";
import DonorHome from "./components/Donor/mainpage_user";
import { RecipientHome } from "./components/Recipient/mainpage_recipient";
import { getUserRole, subscribeToUserRole } from "./store/userStore";

export default function HomePage() {
  const [userRole, setUserRole] = useState<string>(getUserRole() || "donor");

  useEffect(() => {
    const unsubscribe = subscribeToUserRole((role) => {
      if (role) setUserRole(role);
    });
    return unsubscribe;
  }, []);

  const handleNavigate = (screen: string) => {
    console.log("Navigate to:", screen);
    // You can add actual navigation logic here if needed
  };

  // Show different home screens based on user role
  if (userRole === "recipient") {
    return <RecipientHome onNavigate={handleNavigate} />;
  }

  // Default to donor home (also handles "donor" role)
  return <DonorHome onNavigate={handleNavigate} />;
}
