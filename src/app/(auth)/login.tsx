import { Ionicons } from '@expo/vector-icons';
import { makeRedirectUri } from 'expo-auth-session';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Genera automáticamente la URL 'exp://' para Expo Go
  const redirectUri = makeRedirectUri();

  // Función auxiliar para extraer los tokens de la URL de redirección
  const extractParamsFromUrl = (url: string) => {
    const queryString = url.split('#')[1] || url.split('?')[1];
    if (!queryString) return {};
    
    return queryString.split('&').reduce((acc, item) => {
      const [key, value] = item.split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
  };

  async function signInWithGoogle() {
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true, // Importante para evitar conflictos con WebBrowser
      },
    });

    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
      return;
    }

    const res = await WebBrowser.openAuthSessionAsync(data?.url ?? '', redirectUri);

    if (res.type === 'success' && res.url) {
      const params = extractParamsFromUrl(res.url);

      if (params.access_token && params.refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });

        if (sessionError) {
          Alert.alert('Error de sesión', sessionError.message);
        }
      }
    }
    
    setLoading(false);
  }

  async function signInWithApple() {
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
      return;
    }

    const res = await WebBrowser.openAuthSessionAsync(data?.url ?? '', redirectUri);

    if (res.type === 'success' && res.url) {
      const params = extractParamsFromUrl(res.url);

      if (params.access_token && params.refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });

        if (sessionError) {
          Alert.alert('Error de sesión', sessionError.message);
        }
      }
    }
    
    setLoading(false);
  }

  return (
    <View className="flex-1 bg-[#FFFBF5] justify-center px-6">
      
      <View className="items-center mb-12">
        <View className="w-24 h-24 bg-red-700 rounded-full items-center justify-center shadow-lg shadow-red-900/50 mb-6">
          <Text className="text-5xl">🛵</Text>
        </View>
        <Text className="text-red-700 font-bold text-4xl mb-2">NicAntojo</Text>
        <Text className="text-orange-400 text-center text-lg font-medium">
          Porque cocinar es opcional
        </Text>
      </View>

      <View className="mb-4 w-full">
        <TouchableOpacity 
          className="bg-white rounded-2xl h-14 flex-row items-center shadow-sm border border-gray-200 mb-4 px-6"
          onPress={signInWithGoogle}
          disabled={loading}
        >
          <View className="w-6 items-center">
            {loading ? (
              <Text>⏳</Text>
            ) : (
              <Ionicons name="logo-google" size={24} color="#4285F4" />
            )}
          </View>
          <Text className="flex-1 text-gray-700 font-bold text-lg text-center mr-6">
            {loading ? 'Cargando...' : 'Continuar con Google'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-white rounded-2xl h-14 flex-row items-center shadow-sm border border-gray-200 mb-4 px-6"
          onPress={() => router.push('/email-login')}
          disabled={loading}
        >
          <View className="w-6 items-center">
            <Text className="text-xl">✉️</Text>
          </View>
          <Text className="flex-1 text-gray-700 font-bold text-lg text-center mr-6">
            Continuar con correo
          </Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <TouchableOpacity 
            className="bg-black rounded-2xl h-14 flex-row items-center shadow-md mb-4 px-6"
            onPress={signInWithApple}
            disabled={loading}
          >
            <View className="w-6 items-center">
              <Ionicons name="logo-apple" size={24} color="white" />
            </View>
            <Text className="flex-1 text-white font-bold text-lg text-center mr-6">
              Continuar con Apple
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ENLACE DE REGISTRO */}
      <View className="flex-row justify-center items-center mb-8">
        <Text className="text-gray-500 font-medium text-base">¿No tienes cuenta? </Text>
        <TouchableOpacity onPress={() => router.push('/register')} disabled={loading}>
          <Text className="text-red-700 font-bold text-base">Regístrate</Text>
        </TouchableOpacity>
      </View>

      <View className="absolute bottom-8 w-full items-center self-center px-8">
        <Text className="text-gray-400 text-xs text-center mb-6 leading-5">
          Al continuar aceptas nuestros Términos de Servicio y Política de Privacidad
        </Text>
        <Text className="text-gray-400 text-xs">© 2026 NicAntojo · Nicaragua 🇳🇮</Text>
      </View>
      
    </View>
  );
}