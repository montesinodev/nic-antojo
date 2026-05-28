import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { useCartStore } from "../../store/useCartStore";

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Obtenemos los márgenes seguros del dispositivo (notch arriba, barra de navegación abajo)
  const insets = useSafeAreaInsets();

  const { items, addItem } = useCartStore();

  const cartItemsCount = items.reduce(
    (sum: number, item: any) => sum + item.quantity,
    0,
  );
  const cartTotal = items.reduce(
    (sum: number, item: any) => sum + item.price_cordobas * item.quantity,
    0,
  );

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from("restaurants")
        .select("*, menu_items(*)")
        .eq("id", id)
        .single();
      setRestaurant(data);
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading)
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );

  return (
    <View className="flex-1 bg-[#FFFBF5]">
      <ScrollView className="flex-1">
        <Image source={{ uri: restaurant?.logo_url }} className="w-full h-64" />

        <View className="p-6 -mt-10 bg-[#FFFBF5] rounded-t-3xl">
          <Text className="text-3xl font-extrabold text-gray-800">
            {restaurant?.name}
          </Text>
          <Text className="text-gray-500 mt-2 text-lg">
            {restaurant?.address}
          </Text>

          <View className="flex-row items-center mt-4">
            <View className="bg-red-100 px-3 py-1 rounded-lg">
              <Text className="text-red-700 font-bold">
                {restaurant?.category}
              </Text>
            </View>
          </View>

          <Text className="text-xl font-bold mt-8 mb-4">Menú disponible</Text>
          {restaurant?.menu_items && restaurant.menu_items.length > 0 ? (
            restaurant.menu_items.map((item: any) => (
              <View
                key={item.id}
                className="bg-white p-4 rounded-2xl mb-4 flex-row items-center shadow-sm border border-gray-100"
              >
                <Image
                  source={{ uri: item.image_url }}
                  className="w-20 h-20 rounded-xl"
                />

                <View className="flex-1 ml-4">
                  <Text className="font-bold text-gray-800">{item.name}</Text>
                  <Text className="text-gray-500 text-sm" numberOfLines={2}>
                    {item.description}
                  </Text>
                  <Text className="text-red-700 font-bold mt-1">
                    C$ {item.price_cordobas}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => addItem(item)}
                  className="bg-[#E63946] w-10 h-10 rounded-full items-center justify-center ml-2 shadow-sm"
                >
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text className="text-gray-400 italic">
              No hay platos disponibles en este momento.
            </Text>
          )}

          {/* Aumentamos un poco el espacio final para asegurar que se pueda hacer scroll hasta el último plato */}
          <View className="h-32" />
        </View>
      </ScrollView>

      {/* BOTÓN FLOTANTE DEL CARRITO */}
      {cartItemsCount > 0 && (
        <View
          className="absolute w-full px-6"
          // Aquí aplicamos el margen seguro de la parte inferior, sumando 16px para que quede flotando
          style={{ bottom: insets.bottom > 0 ? insets.bottom + 16 : 24 }}
        >
          <TouchableOpacity
            onPress={() => router.push("/cart")}
            className="bg-[#E63946] p-4 rounded-2xl flex-row justify-between items-center shadow-lg"
          >
            <View className="bg-red-800 w-8 h-8 rounded-full items-center justify-center">
              <Text className="text-white font-bold">{cartItemsCount}</Text>
            </View>
            <Text className="text-white font-bold text-lg">Ver Carrito</Text>
            <Text className="text-white font-bold text-lg">C$ {cartTotal}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
