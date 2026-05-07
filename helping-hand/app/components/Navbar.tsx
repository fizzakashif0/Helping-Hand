import { useRouter } from "expo-router";
import {
    Bell,
    Heart,
    Home,
    PlusCircle,
    User,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getUserRole, subscribeToUserRole } from "../store/userStore";

export type NavItem =
  | "home"
  | "donations"
  | "create"
  | "notifications"
  | "profile";

interface BottomNavProps {
  activeTab: NavItem;
  onTabChange: (tab: NavItem) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>(getUserRole() || "donor");

  useEffect(() => {
    const unsubscribe = subscribeToUserRole((role) => {
      if (role) setUserRole(role);
    });
    return unsubscribe;
  }, []);

  // Define navigation items based on user role
  const getDonorNavItems = () => [
    { id: "home" as NavItem, icon: Home, label: "Home", route: "/home" },
    { id: "donations" as NavItem, icon: Heart, label: "My Donations", route: "/donations" },
    { id: "create" as NavItem, icon: PlusCircle, label: "Create", route: "/create" },
    { id: "notifications" as NavItem, icon: Bell, label: "Messages", route: "/chat" },
    { id: "profile" as NavItem, icon: User, label: "Profile", route: "/profile" },
  ];

  const getRecipientNavItems = () => [
    { id: "home" as NavItem, icon: Home, label: "Home", route: "/home" },
    { id: "donations" as NavItem, icon: Heart, label: "My Requests", route: "/my-requests" },
    { id: "create" as NavItem, icon: PlusCircle, label: "Request", route: "/create-help-request" },
    { id: "notifications" as NavItem, icon: Bell, label: "Messages", route: "/chat" },
    { id: "profile" as NavItem, icon: User, label: "Profile", route: "/profile" },
  ];

  const navItems = userRole === "recipient" ? getRecipientNavItems() : getDonorNavItems();

  return (
    <View style={styles.container}>
      {navItems.map(({ id, icon: Icon, label, route }) => {
        const isActive = activeTab === id;

        return (
          <TouchableOpacity
            key={id}
            style={styles.navItem}
            onPress={() => {
              onTabChange(id);
              if (route) router.push(route as any);
            }}
            activeOpacity={0.7}
          >
            <Icon size={22} color={isActive ? "#dc2626" : "#6b7280"} />
            <Text style={[styles.label, { color: isActive ? "#dc2626" : "#6b7280" }]}> 
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingVertical: 8,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },
});
export default BottomNav;
