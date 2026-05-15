// App.tsx — Root entry: fonts, auth listener, navigation

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import {
  useFonts, Sora_400Regular, Sora_600SemiBold,
  Sora_700Bold, Sora_800ExtraBold,
} from '@expo-google-fonts/sora';
import {
  DMSans_400Regular, DMSans_500Medium,
  DMSans_600SemiBold, DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';

import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';
import AppNavigator from './navigation/AppNavigator';
import { Colors, FontFamily } from './lib/theme';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: true,
  }),
});

export default function App() {
  const { setSession, loadProfile, setInitialized } = useAuthStore();
  const [authReady, setAuthReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Sora_400Regular, Sora_600SemiBold, Sora_700Bold, Sora_800ExtraBold,
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

  const onLayout = useCallback(async () => {
    if (fontsLoaded && authReady) await SplashScreen.hideAsync();
  }, [fontsLoaded, authReady]);

  if (!fontsLoaded || !authReady) {
    return (
      <View style={s.loading}>
        <Text style={s.logo}>Belong<Text style={s.accent}>ix</Text></Text>
        <ActivityIndicator color={Colors.orange} size="large" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <View style={{ flex: 1 }} onLayout={onLayout}>
            <AppNavigator />
          </View>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  loading: { flex: 1, backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center' },
  logo:    { fontSize: 38, fontFamily: FontFamily.soraExtraBold, color: '#fff' },
  accent:  { color: Colors.orange },
});
