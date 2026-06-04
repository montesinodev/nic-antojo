import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import "../../global.css";
import { AuthProvider, useAuth } from "../providers/AuthProvider";

// ADD THIS EXPORT: It forces the app to default to the tabs layout
// instead of getting stuck in a missing stack.
export const unstable_settings = {
  initialRouteName: "(tabs)",
};

function RootNavigation() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Espera a que Supabase responda

    // 1. UPDATE: Check if the user is anywhere inside the (auth) group
    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Si NO hay usuario y NO está en la zona de auth, envíalo a login
      router.replace("/login");
    } else if (user && inAuthGroup) {
      // Si HAY usuario y está atrapado en login/register, envíalo al inicio
      router.replace("/");
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.logoText}>NicAntojo</Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="location-picker"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen name="restaurant/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="cart" options={{ title: "Carrito" }} />
      <Stack.Screen name="checkout" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const segments = useSegments();

  // --- DEBUGGER SNIPPET ---
  useEffect(() => {
    console.log("Current Navigation Segments:", segments);
  }, [segments]);
  // -------------------------
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#b91c1c",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 1,
  },
});
