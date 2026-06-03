import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signUpWithEmail() {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { 
        data: { 
          full_name: name,
          phone: phone,
          role: 'customer' 
        } 
      }
    });
    
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Éxito', 'Revisa tu correo para confirmar tu cuenta.');
      router.replace('/login');
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FFFBF5]"
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 justify-center px-6">
        
        {/* Header Section */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-red-700 rounded-full items-center justify-center shadow-lg shadow-red-900/50 mb-4">
            <Text className="text-4xl">🛵</Text>
          </View>
          <Text className="text-red-700 font-bold text-3xl mb-2">Crear Cuenta</Text>
          <Text className="text-orange-400 text-center text-base">Únete y antójate</Text>
        </View>

        {/* Form Section */}
        <View className="mb-8">
          <TextInput
            className="bg-white rounded-2xl shadow-sm border border-gray-200 focus:border-red-700 px-4 py-4 text-base text-gray-800"
            placeholder="Nombre completo"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            cursorColor="#b91c1c"
          />
          <TextInput
            className="bg-white rounded-2xl shadow-sm border border-gray-200 focus:border-red-700 px-4 py-4 text-base text-gray-800 mt-4"
            placeholder="Correo electrónico"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            cursorColor="#b91c1c"
          />
          <TextInput
            className="bg-white rounded-2xl shadow-sm border border-gray-200 focus:border-red-700 px-4 py-4 text-base text-gray-800 mt-4"
            placeholder="Teléfono"
            placeholderTextColor="#9CA3AF"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            cursorColor="#b91c1c"
          />
          <TextInput
            className="bg-white rounded-2xl shadow-sm border border-gray-200 focus:border-red-700 px-4 py-4 text-base text-gray-800 mt-4"
            placeholder="Contraseña"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            cursorColor="#b91c1c"
          />
          <TextInput
            className="bg-white rounded-2xl shadow-sm border border-gray-200 focus:border-red-700 px-4 py-4 text-base text-gray-800 mt-4"
            placeholder="Confirmar contraseña"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            cursorColor="#b91c1c"
          />
        </View>

        {/* Buttons Section */}
        <TouchableOpacity 
          className="bg-red-700 rounded-2xl py-4 w-full flex-row items-center justify-center shadow-md shadow-red-900/30 mb-6"
          onPress={signUpWithEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-bold text-lg mr-2">Registrarse</Text>
              <Ionicons name="arrow-forward" size={24} color="white" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/login")
          }
          className="py-2"
        >
          <Text className="text-gray-500 font-bold text-center text-base">
            ¿Ya tienes cuenta? <Text className="text-red-700">Inicia sesión</Text>
          </Text>
        </TouchableOpacity>

      </View>

      {/* Footer */}
      <View className="absolute bottom-8 w-full items-center">
        <Text className="text-gray-400 text-xs">© 2025 NicAntojo · Nicaragua 🇳🇮</Text>
      </View>
      
    </KeyboardAvoidingView>
  );
}