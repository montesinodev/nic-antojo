import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  StyleSheet,
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
    latitude: 12.1328,
    longitude: -86.2504,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const leavePicker = React.useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }, [router]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        leavePicker();
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [leavePicker]),
  );

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Puedes buscar tu ubicación manualmente.",
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
    leavePicker();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={leavePicker}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Selecciona tu ubicación</Text>
      </View>

      {/* BUSCADOR */}
      <View style={styles.searchContainer}>
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
            components: "country:ni",
          }}
          styles={{
            textInput: styles.searchInput,
            container: { flex: 0 },
            listView: styles.listView,
          }}
        />
      </View>

      {/* MAPA */}
      <View style={styles.mapContainer}>
        {loadingMap ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E63946" />
            <Text style={styles.loadingText}>Obteniendo tu GPS...</Text>
          </View>
        ) : (
          <MapView
            style={StyleSheet.absoluteFillObject}
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
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={confirmLocation}
        >
          <Text style={styles.confirmButtonText}>Confirmar esta ubicación</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Estilos nativos de React Native (Inmunes a fallos de Tailwind)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 2,
  },
  closeButton: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1F2937" },
  searchContainer: { paddingHorizontal: 16, zIndex: 999, marginBottom: 10 },
  searchInput: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    fontSize: 16,
  },
  listView: {
    position: "absolute",
    top: 55,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 5,
    zIndex: 1000,
  },
  mapContainer: { flex: 1, backgroundColor: "#E5E7EB", zIndex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, color: "#6B7280" },
  footer: {
    padding: 24,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  confirmButton: {
    backgroundColor: "#E63946",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonText: { color: "white", fontWeight: "bold", fontSize: 18 },
});
