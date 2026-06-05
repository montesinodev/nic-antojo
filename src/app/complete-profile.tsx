import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { useAuth } from "../providers/AuthProvider";

export default function CompleteProfileScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  const handleUpdate = async () => {
    // 1. Basic validation
    if (!phone || phone.trim().length < 8) {
      return Alert.alert(
        "Número inválido",
        "Por favor ingresa un número de teléfono válido (ej. 8888-8888).",
      );
    }

    if (!user) {
      return Alert.alert("Error", "No se encontró el usuario actual.");
    }

    setLoading(true);

    try {
      const formattedPhone = phone.trim();

      // 2. Update the profiles table in your database
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ phone: formattedPhone })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // 3. Update the Auth metadata so the app's session remembers the phone
      const { error: authError } = await supabase.auth.updateUser({
        data: { phone: formattedPhone },
      });

      if (authError) throw authError;

      // 4. Success! Redirect back to the main app flow
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Error al guardar",
        error.message || "Hubo un problema al guardar tu número.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FFFBF5] justify-center p-6">
      <View className="mb-10">
        <Text className="text-3xl font-extrabold text-gray-800 mb-3">
          ¡Casi listo! 🚀
        </Text>
        <Text className="text-gray-500 text-lg">
          Para poder entregar tus pedidos, necesitamos un número de teléfono
          donde podamos contactarte.
        </Text>
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 font-bold mb-2 ml-1">
          Número de Teléfono
        </Text>
        <View className="flex-row items-center bg-white h-16 rounded-2xl px-4 shadow-sm border border-gray-100">
          <Text className="text-gray-500 font-bold text-lg mr-2">+505</Text>
          <View className="h-8 w-[1px] bg-gray-300 mr-3" />
          <TextInput
            placeholder="8888-8888"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            className="flex-1 text-lg text-gray-800 font-medium"
            placeholderTextColor="#9CA3AF"
            maxLength={9} // Assuming 8 digits + optional hyphen
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={handleUpdate}
        disabled={loading}
        className={`h-16 rounded-2xl items-center justify-center shadow-sm ${
          loading ? "bg-red-400" : "bg-[#E63946]"
        }`}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text className="text-white text-lg font-bold">
            Guardar y Continuar
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
