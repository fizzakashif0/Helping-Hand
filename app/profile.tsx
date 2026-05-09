import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import About from "./components/MyProfile/About";
import AccountSettings from "./components/MyProfile/AccountSettings";
import DeactivateAccount from "./components/MyProfile/DeactivateAccount";
import DonorProfile from "./components/MyProfile/DonorProfile";
import EditProfile from "./components/MyProfile/EditProfile";
import HelpSupport from "./components/MyProfile/HelpSupport";
import NotificationPreferences from "./components/MyProfile/NotificationPreferences";
import PrivacySetting from "./components/MyProfile/PrivacySetting";
import RecipientProfile from "./components/MyProfile/RecipientProfile";
import BottomNav, { NavItem } from "./components/Navbar";
import { getUserRole, subscribeToUserRole } from "./store/userStore";

type UserRole = "donor" | "recipient" | "ngo";
type ScreenType =
  | "main"
  | "edit-profile"
  | "account-settings"
  | "notification-preferences"
  | "privacy-settings"
  | "help-support"
  | "about"
  | "deactivate-account";

export default function Profile() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole>(getUserRole() as UserRole || "donor");
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("main");
  const [activeTab, setActiveTab] = useState<NavItem>("profile");

  useEffect(() => {
    const unsubscribe = subscribeToUserRole((role) => {
      if (role) setUserRole(role as UserRole);
    });
    return unsubscribe;
  }, []);

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as ScreenType);
  };

  const handleTabChange = (tab: NavItem) => {
    setActiveTab(tab);
  };

  const handleBack = () => {
    if (currentScreen !== "main") {
      setCurrentScreen("main");
    } else {
      router.back();
    }
  };

  const handleLogout = () => {
    // Handle logout logic
    router.replace("/login");
  };

  const handleSave = () => {
    setCurrentScreen("main");
  };

  const handleDeactivate = () => {
    router.replace("/login");
  };

  // Render different screens based on currentScreen
  switch (currentScreen) {
    case "about":
      return (
        <View style={styles.container}>
          <About onBack={handleBack} onNavigate={handleNavigate} />
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </View>
      );
    case "edit-profile":
      return (
        <View style={styles.container}>
          <EditProfile onBack={handleBack} onSave={handleSave} userRole={userRole} />
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </View>
      );
    case "account-settings":
      return (
        <View style={styles.container}>
          <AccountSettings onBack={handleBack} onNavigate={handleNavigate} />
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </View>
      );
    case "notification-preferences":
      return (
        <View style={styles.container}>
          <NotificationPreferences onBack={handleBack} onSave={handleSave} />
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </View>
      );
    case "privacy-settings":
      return (
        <View style={styles.container}>
          <PrivacySetting onBack={handleBack} onSave={handleSave} />
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </View>
      );
    case "help-support":
      return (
        <View style={styles.container}>
          <HelpSupport onBack={handleBack} onNavigate={handleNavigate} />
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </View>
      );
    case "deactivate-account":
      return (
        <View style={styles.container}>
          <DeactivateAccount onBack={handleBack} onDeactivate={handleDeactivate} />
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </View>
      );
    case "main":
    default:
      return (
        <View style={styles.container}>
          {userRole === "donor" ? (
            <DonorProfile onNavigate={handleNavigate} onLogout={handleLogout} />
          ) : (
            <RecipientProfile onNavigate={handleNavigate} onLogout={handleLogout} />
          )}
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
