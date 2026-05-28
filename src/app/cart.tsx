import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCartStore } from "../store/useCartStore";

export default function CartScreen() {
  const { items, removeItem, addItem } = useCartStore();
  const router = useRouter();

  // Obtenemos los márgenes seguros del dispositivo
  const insets = useSafeAreaInsets();

  // Calculamos el total dinámicamente sumando (precio * cantidad) de cada ítem
  const total = items.reduce(
    (sum: number, item: any) => sum + item.price_cordobas * item.quantity,
    0,
  );

  // Pantalla cuando el carrito está vacío
  if (items.length === 0) {
    return (
      <View className="flex-1 bg-[#FFFBF5] justify-center items-center p-6">
        <Ionicons name="cart-outline" size={80} color="#D1D5DB" />
        <Text className="text-xl font-bold text-gray-800 mt-4">
          Tu carrito está vacío
        </Text>
        <Text className="text-gray-500 text-center mt-2 mb-8">
          ¡Agrega unos deliciosos platillos para empezar!
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-[#E63946] px-8 py-4 rounded-2xl shadow-sm"
        >
          <Text className="text-white font-bold text-lg">Volver al menú</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FFFBF5]">
      {/* Lista de productos en el carrito */}
      <FlatList
        data={items}
        keyExtractor={(item: any) => item.id.toString()}
        // Añadimos más espacio al final de la lista para que el contenedor flotante no tape los últimos ítems
        contentContainerStyle={{ padding: 20, paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-3xl mb-4 flex-row items-center shadow-sm border border-gray-100">
            {/* Imagen del producto */}
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                className="w-16 h-16 rounded-2xl mr-4 bg-gray-100"
              />
            ) : (
              <View className="w-16 h-16 rounded-2xl mr-4 bg-gray-200 items-center justify-center">
                <Ionicons name="restaurant-outline" size={24} color="#9CA3AF" />
              </View>
            )}

            {/* Detalles del producto */}
            <View className="flex-1">
              <Text
                className="font-bold text-gray-800 text-base mb-1"
                numberOfLines={2}
              >
                {item.name}
              </Text>
              <Text className="text-red-700 font-extrabold">
                C$ {item.price_cordobas}
              </Text>
            </View>

            {/* Controles de cantidad */}
            <View className="flex-row items-center bg-gray-50 rounded-2xl p-1 ml-2 border border-gray-100">
              <TouchableOpacity
                onPress={() => removeItem(item.id)}
                className="w-8 h-8 bg-white rounded-xl items-center justify-center shadow-sm"
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </TouchableOpacity>

              <Text className="font-bold text-gray-800 mx-3">
                {item.quantity}
              </Text>

              <TouchableOpacity
                onPress={() => addItem(item)}
                className="w-8 h-8 bg-[#E63946] rounded-xl items-center justify-center shadow-sm"
              >
                <Ionicons name="add" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Resumen final flotante con Safe Area aplicado al padding inferior */}
      <View
        className="absolute bottom-0 w-full px-6 pt-6 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-gray-100"
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : 24 }}
      >
        <View className="flex-row justify-between mb-4 items-end">
          <Text className="text-gray-500 text-base font-medium">
            Total a pagar
          </Text>
          <Text className="text-3xl font-black text-gray-800">C$ {total}</Text>
        </View>

        <TouchableOpacity className="bg-[#E63946] p-4 rounded-2xl items-center shadow-md">
          <Text className="text-white font-bold text-lg">Confirmar Orden</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
