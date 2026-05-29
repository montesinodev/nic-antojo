import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { useCartStore } from "../store/useCartStore";

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, clearCart } = useCartStore();

  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // Estado para capturar las coordenadas exactas del mapa
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 12.1328, // Centro de Managua por defecto
    longitude: -86.2504,
  });

  // Cálculos de precios
  const cartSubtotal = items.reduce(
    (sum: number, item: any) => sum + item.price_cordobas * item.quantity,
    0,
  );
  const deliveryFee = 50;
  const finalTotal = cartSubtotal + deliveryFee;

  const placeOrder = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert(
        "Acceso necesario",
        "Debes iniciar sesión para finalizar tu pedido.",
      );
      router.push("/(auth)/login");
      return;
    }

    if (!address.trim()) {
      Alert.alert(
        "Faltan datos",
        "Por favor escribe las referencias de tu dirección.",
      );
      return;
    }

    if (items.length === 0) {
      Alert.alert("Carrito vacío", "No tienes productos en tu carrito.");
      return;
    }

    setLoading(true);

    try {
      const restaurantId = items[0].restaurant_id;

      // Insertar orden con las coordenadas reales capturadas del mapa
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            delivery_address: address,
            total: finalTotal,
            restaurant_id: restaurantId,
            customer_id: user.id,
            lat: selectedLocation.latitude,
            lng: selectedLocation.longitude,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItemsToInsert = items.map((item: any) => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price_cordobas,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      Alert.alert("¡Pedido Confirmado!", "Tu comida ya se está preparando.", [
        {
          text: "Excelente",
          onPress: () => {
            clearCart();
            router.replace("/");
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        "Hubo un problema al procesar tu orden: " + error.message,
      );
      console.log("Supabase Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1 bg-[#FFFBF5]"
        contentContainerStyle={{ padding: 20 }}
      >
        <View className="mt-4 mb-6">
          <Text className="text-3xl font-black text-gray-800">
            Finalizar Pedido
          </Text>
          <Text className="text-gray-500 text-base mt-2">
            Confirma tu ubicación de entrega.
          </Text>
        </View>

        {/* --- SECCIÓN DEL MAPA --- */}
        <Text className="font-bold text-gray-800 text-lg mb-3 ml-1">
          Ubicación exacta
        </Text>
        <View className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <View className="h-48 w-full relative">
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: 12.1328,
                longitude: -86.2504,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              onRegionChangeComplete={(region) => {
                // Cada vez que el mapa se detiene, actualizamos las coordenadas
                setSelectedLocation({
                  latitude: region.latitude,
                  longitude: region.longitude,
                });
              }}
            />
            {/* El pin falso que se queda siempre en el centro */}
            <View className="absolute top-1/2 left-1/2 -mt-8 -ml-4 pointer-events-none items-center shadow-lg">
              <View className="bg-red-700 w-8 h-8 rounded-full items-center justify-center">
                <Ionicons name="restaurant" size={16} color="white" />
              </View>
              <View className="w-1 h-3 bg-red-900" />
              <View className="w-2 h-1 bg-black/30 rounded-full mt-1" />
            </View>
          </View>
          <View className="p-4 bg-red-50">
            <Text className="text-red-800 text-xs text-center font-medium">
              Mueve el mapa para ubicar el pin exactamente en tu casa o trabajo.
            </Text>
          </View>
        </View>

        {/* --- SECCIÓN DE DIRECCIÓN TEXTUAL --- */}
        <Text className="font-bold text-gray-800 text-lg mb-3 ml-1">
          Referencias de la dirección
        </Text>
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <TextInput
            className="text-gray-800 text-base"
            placeholder="Ej. Casa esquinera color verde, portón negro..."
            multiline
            numberOfLines={3}
            value={address}
            onChangeText={setAddress}
            style={{ textAlignVertical: "top" }}
          />
        </View>

        {/* --- RESUMEN DE PAGO --- */}
        <Text className="font-bold text-gray-800 text-lg mb-3 ml-1">
          Resumen
        </Text>
        <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-8">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Subtotal</Text>
            <Text className="font-bold text-gray-800">C$ {cartSubtotal}</Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text className="text-gray-500">Envío</Text>
            <Text className="font-bold text-gray-800">C$ {deliveryFee}</Text>
          </View>
          <View className="h-[1px] bg-gray-100 mb-4" />
          <View className="flex-row justify-between">
            <Text className="font-black text-gray-800 text-xl">Total</Text>
            <Text className="font-black text-[#E63946] text-xl">
              C$ {finalTotal}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* --- BOTÓN FLOTANTE --- */}
      <View
        className="bg-white w-full px-6 pt-4 border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : 24 }}
      >
        <TouchableOpacity
          onPress={placeOrder}
          disabled={loading}
          className={`p-4 rounded-2xl items-center shadow-md flex-row justify-center ${loading ? "bg-red-400" : "bg-[#E63946]"}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              Hacer Pedido por C$ {finalTotal}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
