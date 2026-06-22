import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../providers/AuthProvider";
import { useLocationStore } from "../../store/useLocationStore";

type Restaurant = {
  id: string;
  name: string;
  address: string;
  category: string;
  categories: string;
  logo_url: string;
  image_url: string;
  is_open: boolean;
  rating: number | null;
  delivery_time: string | null;
};

export default function HomeScreen() {
  // 1. ALL HOOKS DECLARED AT THE TOP LEVEL
  const router = useRouter();
  const { user } = useAuth();
  const { address } = useLocationStore();
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Usuario";

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Gatekeeper state to prevent UI from rendering until phone is verified
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  // 2. GATEKEEPER EFFECT
  useEffect(() => {
    const verifyProfile = async () => {
      if (!user) {
        setIsCheckingProfile(false);
        return;
      }

      try {
        // Use maybeSingle() instead of single() to avoid PGRST116 errors on new accounts
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("phone")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;

        // If no row exists yet, or phone is missing/placeholder -> Redirect
        if (
          !profile ||
          !profile.phone ||
          profile.phone.trim() === "" ||
          profile.phone === "Sin teléfono" ||
          profile.phone === "No registrado"
        ) {
          router.replace("/complete-profile");
        } else {
          // Phone is valid, unlock the screen
          setIsCheckingProfile(false);
        }
      } catch (err) {
        console.error("Profile verification error:", err);
        // Default to showing the app if there's a network error so it doesn't freeze
        setIsCheckingProfile(false);
      }
    };

    verifyProfile();
  }, [user]);

  // 3. FETCH DATA EFFECT
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("is_open", true);

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      Alert.alert("Error fetching restaurants", message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas salir de NicAntojo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) Alert.alert("Error", error.message);
          },
        },
      ],
    );
  };

  // Derive unique categories from all restaurants
  const allCategories = Array.from(
    new Set(
      restaurants
        .flatMap((r) => (r.categories ? r.categories.split(',').map((c) => c.trim()) : [r.category].filter(Boolean)))
    )
  ).filter(Boolean);

  // Filter restaurants by search + category
  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch = searchQuery.trim() === '' ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase());

    const restaurantCategories = r.categories
      ? r.categories.split(',').map((c) => c.trim())
      : [r.category];

    const matchesCategory = !selectedCategory ||
      restaurantCategories.some((c) => c.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  // Category emoji map
  const categoryEmoji: Record<string, string> = {
    fritanga: '🌮', asados: '🥩', pizza: '🍕', postres: '🍰',
    bebidas: '🥤', mariscos: '🦐', pollo: '🍗', hamburguesas: '🍔',
    sushi: '🍱', tacos: '🌮', pasta: '🍝', ensaladas: '🥗',
  };

  const getEmoji = (cat: string) =>
    categoryEmoji[cat.toLowerCase()] || '🍽️';

  // 4. CONDITIONAL RETURN (Must be placed AFTER all hooks)
  if (isCheckingProfile) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FFFBF5]">
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  // 5. MAIN UI RENDER
  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFBF5]"
      edges={["top", "left", "right"]}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-gray-500 text-sm font-medium mb-1">
              Entregar a
            </Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => router.push("/location-picker")}
            >
              <Text className="text-gray-800 font-bold text-lg mr-1">
                {address}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#E63946" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSignOut}
            className="w-12 h-12 bg-red-100 rounded-full items-center justify-center border-2 border-red-700"
          >
            <Text className="text-red-700 font-bold text-lg">
              {firstName.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="px-6 mb-6">
          <Text className="text-3xl font-extrabold text-gray-800">
            Hola, {firstName} 👋
          </Text>
          <Text className="text-gray-500 text-lg mt-1">
            ¿Qué se te antoja hoy?
          </Text>
        </View>

        <View className="px-6 mb-8">
          <View className="flex-row items-center bg-white h-14 rounded-2xl px-4 shadow-sm border border-gray-100">
            <Ionicons name="search" size={24} color="#9CA3AF" />
            <TextInput
              placeholder="Buscar restaurantes, asados, fritanga..."
              className="flex-1 ml-3 text-base text-gray-700 font-medium"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View className="mb-8">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
          >
            {/* All button */}
            <TouchableOpacity
              className="items-center"
              onPress={() => setSelectedCategory(null)}
            >
              <View className={`w-16 h-16 rounded-2xl items-center justify-center shadow-sm border mb-2 ${
                selectedCategory === null
                  ? 'bg-[#E63946] border-[#E63946]'
                  : 'bg-white border-gray-100'
              }`}>
                <Text className="text-2xl">🍽️</Text>
              </View>
              <Text className={`font-medium text-sm ${selectedCategory === null ? 'text-[#E63946]' : 'text-gray-700'}`}>
                Todos
              </Text>
            </TouchableOpacity>

            {allCategories.map((category) => (
              <TouchableOpacity
                key={category}
                className="items-center"
                onPress={() => setSelectedCategory(
                  selectedCategory === category ? null : category
                )}
              >
                <View className={`w-16 h-16 rounded-2xl items-center justify-center shadow-sm border mb-2 ${
                  selectedCategory === category
                    ? 'bg-[#E63946] border-[#E63946]'
                    : 'bg-white border-gray-100'
                }`}>
                  <Text className="text-2xl">{getEmoji(category)}</Text>
                </View>
                <Text className={`font-medium text-sm ${
                  selectedCategory === category ? 'text-[#E63946]' : 'text-gray-700'
                }`}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="px-6 pb-12">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            {selectedCategory ? selectedCategory : searchQuery ? 'Resultados' : 'Recomendados para ti'}
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#E63946" className="mt-4" />
          ) : filteredRestaurants.length === 0 ? (
            <Text className="text-gray-500 text-center mt-4">
              {searchQuery || selectedCategory
                ? 'No hay restaurantes con ese filtro.'
                : 'No hay restaurantes disponibles.'}
            </Text>
          ) : (
            <View className="gap-y-4">
              {filteredRestaurants.map((restaurant) => (
                <TouchableOpacity
                  key={restaurant.id}
                  className="bg-white rounded-3xl p-3 flex-row items-center shadow-sm border border-gray-100"
                  onPress={() => router.push(`/restaurant/${restaurant.id}`)}
                >
                  <Image
                    source={{ uri: restaurant.image_url || restaurant.logo_url }}
                    className="w-20 h-20 rounded-2xl bg-gray-200"
                    resizeMode="cover"
                  />
                  <View className="flex-1 ml-4">
                    <Text className="text-lg font-bold text-gray-800 mb-1">
                      {restaurant.name}
                    </Text>
                    <Text
                      className="text-gray-500 text-sm mb-2"
                      numberOfLines={1}
                    >
                      {restaurant.address}
                    </Text>

                    <View className="flex-row items-center">
                      <View className="bg-red-100 px-2 py-1 rounded-md mr-2">
                        <Text className="text-red-700 text-xs font-bold">
                          {restaurant.category}
                        </Text>
                      </View>
                      <View className="flex-row items-center mr-3">
                        <Ionicons name="star" size={14} color="#FBBF24" />
                        <Text className="text-gray-600 text-xs font-bold ml-1">
                          {restaurant.rating ? restaurant.rating.toFixed(1) : '—'}
                        </Text>
                      </View>
                      {restaurant.delivery_time && (
                        <View className="flex-row items-center">
                          <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                          <Text className="text-gray-500 text-xs ml-1">
                            {restaurant.delivery_time}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}