import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/(auth)/login");
        return;
      }

      // Traemos las órdenes del usuario, ordenadas por la más reciente
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.log("Error al obtener órdenes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para darle color a la etiqueta según el estado
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return (
          <View className="bg-yellow-100 px-3 py-1 rounded-full">
            <Text className="text-yellow-700 font-bold text-xs">Pendiente</Text>
          </View>
        );
      case "preparing":
        return (
          <View className="bg-blue-100 px-3 py-1 rounded-full">
            <Text className="text-blue-700 font-bold text-xs">Preparando</Text>
          </View>
        );
      case "delivered":
        return (
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-700 font-bold text-xs">Entregado</Text>
          </View>
        );
      default:
        return (
          <View className="bg-gray-100 px-3 py-1 rounded-full">
            <Text className="text-gray-700 font-bold text-xs">{status}</Text>
          </View>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-NI", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderOrder = ({ item }: { item: any }) => (
    <TouchableOpacity className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="font-bold text-gray-500 text-sm">
          Orden #{item.id.substring(0, 8).toUpperCase()}
        </Text>
        {getStatusBadge(item.status)}
      </View>

      <View className="flex-row items-center mb-3">
        <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
        <Text className="text-gray-600 ml-2">
          {formatDate(item.created_at)}
        </Text>
      </View>

      <View className="flex-row items-center mb-3">
        <Ionicons name="location-outline" size={16} color="#9CA3AF" />
        <Text className="text-gray-600 ml-2" numberOfLines={1}>
          {item.delivery_address}
        </Text>
      </View>

      <View className="h-[1px] bg-gray-100 my-2" />

      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-gray-500">Total pagado</Text>
        <Text className="font-black text-[#E63946] text-lg">
          C$ {item.total}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#FFFBF5]" style={{ paddingTop: insets.top }}>
      <View className="px-6 py-4 mb-2">
        <Text className="text-3xl font-black text-gray-800">Mis Pedidos</Text>
        <Text className="text-gray-500 text-base mt-1">
          Revisa el estado de tus antojos
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E63946" />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
          <Text className="text-gray-500 text-lg mt-4 text-center">
            Aún no has hecho ningún pedido.
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchOrders}
              tintColor="#E63946"
            />
          }
        />
      )}
    </View>
  );
}
