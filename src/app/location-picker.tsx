import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocationStore } from "../store/useLocationStore";

export default function LocationPickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setLocation } = useLocationStore();

  const [loadingMap, setLoadingMap] = useState(true);
  const [region, setRegion] = useState({
    latitude: 12.1328, // Managua por defecto
    longitude: -86.2504,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "No podemos acceder a tu ubicación. Puedes buscarla manualmente.",
      );
      setLoadingMap(false);
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setLoadingMap(false);
  };

  const confirmLocation = () => {
    setLocation("Ubicación Seleccionada", {
      latitude: region.latitude,
      longitude: region.longitude,
    });
    // Navegación absoluta segura: siempre te enviará al inicio de las pestañas
    router.replace("/");
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* HEADER Y BUSCADOR (zIndex 999 para Android) */}
      <View className="px-4 pb-2 bg-white" style={{ zIndex: 999 }}>
        <View className="flex-row items-center mb-4 mt-2">
          {/* BOTÓN DE CIERRE CON NAVEGACIÓN ABSOLUTA */}
          <TouchableOpacity
            onPress={() => router.replace("/")}
            className="mr-3"
          >
            <Ionicons name="close" size={28} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Selecciona tu ubicación</Text>
        </View>

        <GooglePlacesAutocomplete
          placeholder="Buscar calle, residencial, lugar..."
          fetchDetails={true}
          onPress={(data, details = null) => {
            if (details) {
              setRegion({
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
            }
          }}
          query={{
            key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
            language: "es",
            components: "country:ni", // Solo Nicaragua
          }}
          onFail={(error) => console.log("Error de Google Places: ", error)}
          styles={{
            textInput: {
              height: 50,
              borderRadius: 12,
              backgroundColor: "#F3F4F6",
              paddingHorizontal: 16,
            },
            container: { flex: 0 },
            listView: {
              position: "absolute",
              top: 55,
              backgroundColor: "white",
              borderRadius: 12,
              elevation: 5,
              zIndex: 1000,
            },
          }}
        />
      </View>

      {/* MAPA (Sin z-index negativo) */}
      <View className="flex-1 bg-gray-200">
        {loadingMap ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#E63946" />
            <Text className="mt-4 text-gray-500">Obteniendo tu GPS...</Text>
          </View>
        ) : (
          <MapView
            style={{ flex: 1 }}
            region={region}
            showsUserLocation={true}
            onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
          >
            <Marker
              coordinate={{
                latitude: region.latitude,
                longitude: region.longitude,
              }}
            />
          </MapView>
        )}
      </View>

      {/* BOTÓN INFERIOR */}
      <View className="p-6 bg-white border-t border-gray-100 pb-10">
        <TouchableOpacity
          onPress={confirmLocation}
          className="bg-[#E63946] p-4 rounded-2xl items-center shadow-md"
        >
          <Text className="text-white font-bold text-lg">
            Confirmar esta ubicación
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
