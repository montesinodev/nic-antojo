import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../providers/AuthProvider";

export default function Index() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && !inAuthGroup) {
      // Just to be safe, if we are at root and logged in, force tabs
      router.replace("/(tabs)");
    }
  }, [session, segments, isLoading]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFBF5",
      }}
    >
      <ActivityIndicator size="large" color="#E63946" />
    </View>
  );
}
