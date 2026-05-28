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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { useCartStore } from "../store/useCartStore";

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, clearCart } = useCartStore();

  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // Calculamos subtotal y total con envío
  const cartSubtotal = items.reduce(
    (sum: number, item: any) => sum + item.price_cordobas * item.quantity,
    0,
  );
  const deliveryFee = 50;
  const finalTotal = cartSubtotal + deliveryFee;

  const placeOrder = async () => {
    console.log("🔵 1. Botón presionado. Iniciando validación...");

    if (!address.trim()) {
      console.log("🔴 Error: Dirección vacía");
      Alert.alert("Faltan datos", "Por favor ingresa tu dirección de entrega.");
      return;
    }

    if (items.length === 0) {
      console.log("🔴 Error: Carrito vacío");
      Alert.alert("Carrito vacío", "No tienes productos en tu carrito.");
      return;
    }

    setLoading(true);

    try {
      const restaurantId = items[0].restaurant_id;
      console.log("🔵 2. ID del Restaurante capturado:", restaurantId);

      // Si el ID es indefinido, el insert fallará
      if (!restaurantId) {
        throw new Error(
          "El producto no tiene un restaurant_id válido asignado.",
        );
      }

      console.log("🔵 3. Insertando en la tabla 'orders'...");
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            delivery_address: address,
            total: finalTotal,
            restaurant_id: restaurantId,
          },
        ])
        .select()
        .single();

      if (orderError) {
        console.log("🔴 Error al insertar orden:", orderError);
        throw orderError;
      }

      console.log("🟢 4. Orden creada con éxito. ID:", orderData?.id);
      console.log("🔵 5. Preparando items para 'order_items'...");

      const orderItemsToInsert = items.map((item: any) => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price_cordobas,
      }));

      console.log("🔵 6. Insertando items:", orderItemsToInsert);

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsToInsert);

      if (itemsError) {
        console.log("🔴 Error al insertar items:", itemsError);
        throw itemsError;
      }

      console.log("🟢 7. Proceso completo. Limpiando carrito y redirigiendo.");

      Alert.alert(
        "¡Pedido Confirmado!",
        "Tu comida ya se está preparando. El motorizado saldrá pronto.",
        [
          {
            text: "Excelente",
            onPress: () => {
              clearCart();
              router.replace("/");
            },
          },
        ],
      );
    } catch (error: any) {
      console.log("🔥 ERROR CRÍTICO CAPTURADO:", error);
      Alert.alert(
        "Error",
        "Hubo un problema al procesar tu orden. Revisa la terminal.",
      );
    } finally {
      setLoading(false);
      console.log("⚪ 8. Proceso finalizado (Loading apagado).");
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
        <View className="mt-4 mb-8">
          <Text className="text-3xl font-black text-gray-800">
            Finalizar Pedido
          </Text>
          <Text className="text-gray-500 text-base mt-2">
            Casi listo para disfrutar de tus antojos.
          </Text>
        </View>

        {/* Resumen Corto */}
        <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
          <Text className="font-bold text-gray-800 text-lg mb-4">Resumen</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">
              Subtotal ({items.length} productos)
            </Text>
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

        {/* Dirección de Envío */}
        <Text className="font-bold text-gray-800 text-lg mb-3 ml-1">
          Dirección de Entrega
        </Text>
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <TextInput
            className="text-gray-800 text-base"
            placeholder="Ej. Colonia Centroamérica, Casa 123, Managua..."
            multiline
            numberOfLines={3}
            value={address}
            onChangeText={setAddress}
            style={{ textAlignVertical: "top" }}
          />
        </View>

        {/* Método de Pago */}
        <Text className="font-bold text-gray-800 text-lg mb-3 ml-1">
          Método de Pago
        </Text>
        <View className="bg-white rounded-2xl shadow-sm border border-red-200 p-4 mb-8 flex-row items-center bg-red-50">
          <Ionicons name="cash-outline" size={24} color="#E63946" />
          <Text className="font-bold text-gray-800 ml-3">
            Efectivo al recibir
          </Text>
        </View>
      </ScrollView>

      {/* Botón de Enviar Pedido */}
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
