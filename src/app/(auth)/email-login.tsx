import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

export default function EmailLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      Alert.alert('Error de inicio de sesión', error.message);
    } 
    // Si es exitoso, el Auth Guard (_layout.tsx) lo detectará y lo enviará automáticamente a '/'
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FFFBF5]"
    >
      <View className="flex-1 px-6 justify-center">
        
        {/* Back Button & Header */}
        <View className="absolute top-16 left-6 z-10">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100"
          >
            <Ionicons name="arrow-back" size={24} color="#b91c1c" />
          </TouchableOpacity>
        </View>

        <View className="mb-10 mt-12">
          <Text className="text-red-700 font-bold text-4xl mb-2">
            ¡Hola de nuevo! 👋
          </Text>
          <Text className="text-gray-500 text-lg">
            Ingresa tus datos para continuar.
          </Text>
        </View>

        {/* Form Section */}
        <View className="mb-8">
          <TextInput
            className="bg-white rounded-2xl shadow-sm border border-gray-200 focus:border-red-700 px-4 py-4 text-base text-gray-800"
            placeholder="Correo electrónico"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            cursorColor="#b91c1c"
            selectionColor="#fca5a5"
          />
          <TextInput
            className="bg-white rounded-2xl shadow-sm border border-gray-200 focus:border-red-700 px-4 py-4 text-base text-gray-800 mt-4"
            placeholder="Contraseña"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            cursorColor="#b91c1c"
            selectionColor="#fca5a5"
          />
          
          {/* Forgot Password Placeholder */}
          <TouchableOpacity className="mt-4 self-end">
            <Text className="text-orange-400 font-medium">
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          className="bg-red-700 rounded-2xl py-4 w-full flex-row items-center justify-center shadow-md shadow-red-900/30"
          onPress={signInWithEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-bold text-lg mr-2">
                Entrar
              </Text>
              <Ionicons name="log-in-outline" size={26} color="white" />
            </>
          )}
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}