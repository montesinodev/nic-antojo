import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

  const { items, addItem, clearCart, restaurantId } = useCartStore();

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
      // Fire both queries simultaneously for maximum speed
      const [restaurantRes, menuRes] = await Promise.all([
        supabase.from("restaurants").select("*").eq("id", id).single(),
        supabase.from("menu_items").select("*").eq("restaurant_id", id),
      ]);

      if (restaurantRes.error) {
        console.error("Error fetching restaurant:", restaurantRes.error);
      }
      if (menuRes.error) {
        console.error("Error fetching menu:", menuRes.error);
      }

      // Manually stitch the data together exactly how the UI expects it
      if (restaurantRes.data) {
        setRestaurant({
          ...restaurantRes.data,
          menu_items: menuRes.data || [], // Inject the menu items array
        });
      }

      setLoading(false);
    }
    loadData();
  }, [id]);

  const handleAddToCart = (item: any) => {
    // 1. Check for conflicts
    if (restaurantId && restaurantId !== item.restaurant_id) {
      Alert.alert(
        "¿Reemplazar carrito?",
        "Tu carrito actual tiene productos de otro restaurante. ¿Deseas vaciarlo y agregar este producto?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Reemplazar",
            style: "destructive",
            onPress: () => {
              clearCart();
              addItem(item);
            },
          },
        ],
      );
      return; // Stop execution to prevent adding
    }

    // 2. Add item normally
    addItem(item);
  };

  if (loading)
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );

  return (
    <View className="flex-1 bg-[#FFFBF5]">
      <ScrollView className="flex-1">
        <Image
          source={{ uri: restaurant?.image_url }}
          className="w-full h-64"
        />

        <View className="p-6 -mt-10 bg-[#FFFBF5] rounded-t-3xl">
          <Text className="text-3xl font-extrabold text-gray-800">
            {restaurant?.name}
          </Text>
          <Text className="text-gray-500 mt-2 text-lg">
            {restaurant?.address}
          </Text>

          <View className="flex-row items-center mt-4 gap-2 flex-wrap">
            <View className="bg-red-100 px-3 py-1 rounded-lg">
              <Text className="text-red-700 font-bold">
                {restaurant?.categories}
              </Text>
            </View>
            {restaurant?.rating && (
              <View className="flex-row items-center bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-100">
                <Ionicons name="star" size={14} color="#FBBF24" />
                <Text className="text-yellow-700 font-bold ml-1">
                  {restaurant.rating.toFixed(1)}
                </Text>
              </View>
            )}
            {restaurant?.delivery_time && (
              <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-lg">
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text className="text-gray-600 font-medium ml-1">
                  {restaurant.delivery_time}
                </Text>
              </View>
            )}
          </View>

          {!restaurant?.is_open && (
            <View className="mt-6 bg-gray-100 border border-gray-200 rounded-2xl p-4 flex-row items-center gap-3">
              <Ionicons name="close-circle" size={22} color="#6B7280" />
              <View className="flex-1">
                <Text className="font-bold text-gray-700">
                  Restaurante cerrado
                </Text>
                <Text className="text-gray-500 text-sm mt-0.5">
                  Este restaurante no está aceptando pedidos en este momento.
                </Text>
              </View>
            </View>
          )}

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
                  onPress={() => handleAddToCart(item)}
                  disabled={!restaurant?.is_open}
                  className={`w-10 h-10 rounded-full items-center justify-center ml-2 shadow-sm ${
                    restaurant?.is_open ? "bg-[#E63946]" : "bg-gray-300"
                  }`}
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
