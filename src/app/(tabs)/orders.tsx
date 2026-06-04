import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);

  const fetchOrders = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUser(user);

      // Fetch orders and join with the restaurant table to get the name
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          restaurant:restaurants(name)
        `,
        )
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // --- SUPABASE REALTIME CONFIG ---
    let activeChannel: any = null;

    const setupRealtime = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Use a unique channel name per user to completely prevent cross-talk collisions
      const channelName = `user-orders-${user.id}`;

      // Remove it first if a stale instance accidentally lingered in memory
      supabase.removeChannel(supabase.channel(channelName));

      activeChannel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `customer_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("Order updated in realtime!", payload);
            // Update the specific order in our local state instantly
            setOrders((currentOrders) =>
              currentOrders.map((order) =>
                order.id === payload.new.id
                  ? { ...order, ...payload.new }
                  : order,
              ),
            );
          },
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
      }
    };
  }, []);

  // Helper function to translate and style statuses
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "pending":
        return {
          text: "Pendiente",
          color: "bg-orange-100 text-orange-800",
          icon: "time-outline",
        };
      case "preparing":
        return {
          text: "Preparando",
          color: "bg-yellow-100 text-yellow-800",
          icon: "restaurant-outline",
        };
      case "ready":
        return {
          text: "Listo para enviar",
          color: "bg-blue-100 text-blue-800",
          icon: "checkmark-circle-outline",
        };
      case "on_the_way":
        return {
          text: "En camino",
          color: "bg-purple-100 text-purple-800",
          icon: "bicycle-outline",
        };
      case "delivered":
        return {
          text: "Entregado",
          color: "bg-green-100 text-green-800",
          icon: "home-outline",
        };
      case "cancelled":
        return {
          text: "Cancelado",
          color: "bg-red-100 text-red-800",
          icon: "close-circle-outline",
        };
      default:
        return {
          text: status,
          color: "bg-gray-100 text-gray-800",
          icon: "alert-circle-outline",
        };
    }
  };

  // Format date to something readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-NI", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FFFBF5]">
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FFFBF5] px-6">
        <Ionicons name="receipt-outline" size={80} color="#ccc" />
        <Text className="text-xl font-bold text-gray-800 mt-4 mb-2 text-center">
          Inicia sesión para ver tus pedidos
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          className="bg-[#E63946] px-8 py-3 rounded-xl mt-4 shadow-sm"
        >
          <Text className="text-white font-bold text-lg">Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FFFBF5]" style={{ paddingTop: insets.top }}>
      <View className="px-6 pt-4 pb-2">
        <Text className="text-3xl font-black text-gray-800">Mis Pedidos</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchOrders();
            }}
          />
        }
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-20">
            <Ionicons name="fast-food-outline" size={60} color="#ccc" />
            <Text className="text-gray-500 text-lg mt-4 text-center">
              Aún no tienes pedidos.{"\n"}¡Anímate a probar algo rico!
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const statusUI = getStatusDisplay(item.status);
          const itemCount = item.order_items?.length || 0;

          return (
            <View className="bg-white p-5 rounded-3xl mb-4 shadow-sm border border-gray-100">
              {/* Header: Restaurant & Total */}
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 pr-4">
                  <Text
                    className="font-bold text-lg text-gray-800"
                    numberOfLines={1}
                  >
                    {item.restaurant?.name || "Restaurante"}
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1">
                    {formatDate(item.created_at)} • {itemCount}{" "}
                    {itemCount === 1 ? "producto" : "productos"}
                  </Text>
                </View>
                <Text className="font-black text-[#E63946] text-lg">
                  C$ {item.total_amount}
                </Text>
              </View>

              {/* Status Badge */}
              <View className="flex-row items-center mt-2">
                <View
                  className={`px-3 py-1.5 rounded-lg flex-row items-center ${statusUI.color}`}
                >
                  <Ionicons
                    name={statusUI.icon as any}
                    size={16}
                    color="inherit"
                    style={{ marginRight: 4 }}
                  />
                  <Text className="font-bold ml-1">{statusUI.text}</Text>
                </View>
              </View>

              {/* Order ID Footer */}
              <View className="mt-4 pt-3 border-t border-gray-100">
                <Text className="text-gray-300 text-xs font-mono uppercase">
                  ID: {item.id.split("-")[0]}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
