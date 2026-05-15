import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts, Sora_700Bold, Sora_800ExtraBold,
  Sora_600SemiBold, Sora_400Regular,
} from '@expo-google-fonts/sora';
import {
  DMSans_400Regular, DMSans_500Medium,
  DMSans_600SemiBold, DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';
import AppNavigator from './navigation/AppNavigator';
import { Colors } from './lib/theme';

export default function App() {
  const { setSession, loadProfile, setInitialized } = useAuthStore();
  const [authReady, setAuthReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Sora_700Bold, Sora_800ExtraBold, Sora_600SemiBold, Sora_400Regular,
    DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile();
      setAuthReady(true);
      setInitialized();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile();
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!fontsLoaded || !authReady) {
    return (
      <View style={s.loading}>
        <Text style={s.logo}>Belong<Text style={s.accent}>ix</Text></Text>
        <ActivityIndicator color="#FF5C35" size="large" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  loading: { flex: 1, backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 38, color: '#fff', fontWeight: '800' },
  accent: { color: '#FF5C35' },
});