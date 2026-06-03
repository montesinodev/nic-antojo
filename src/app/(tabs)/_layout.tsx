import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#E63946",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 10, // Aumenta la elevación para que "flote" sobre los botones
          // Altura fija para Android
          height: Platform.OS === "android" ? 100 : 85,
          // Padding bottom más agresivo para compensar los botones
          paddingBottom: Platform.OS === "android" ? 20 : 25,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Pedidos",
          tabBarIcon: ({ color }) => (
            <Ionicons name="receipt" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
