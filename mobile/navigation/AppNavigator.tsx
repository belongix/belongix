/**
 * Belongix — App Navigator
 * Handles auth/app split and deep link routing.
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import BottomTabs from './BottomTabs';
import CareerScoreScreen from '../screens/CareerScoreScreen';
import ApplicationsScreen from '../screens/ApplicationsScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Onboarding:   undefined;
  Auth:         { referralCode?: string };
  Main:         undefined;
  CareerScore:  undefined;
  Applications: undefined;
  ProfileEdit:  undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Deep link config — handles belongix.in/... URLs */
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'https://belongix.in', 'belongix://'],
  config: {
    screens: {
      Auth:         { path: '' },
      Main:         { path: 'dashboard' },
      CareerScore:  { path: 'score' },
    },
  },
};

export default function AppNavigator() {
  const { session, setSession, loading } = useAuthStore();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  // Listen to Supabase auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Check if onboarding has been shown
  useEffect(() => {
    AsyncStorage.getItem('onboarding_done').then((val) => {
      setShowOnboarding(!val);
    });
  }, []);

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('onboarding_done', 'true');
    setShowOnboarding(false);
  };

  if (loading || showOnboarding === null) return null;

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <>
            {showOnboarding && (
              <Stack.Screen name="Onboarding">
                {(props) => (
                  <OnboardingScreen
                    {...props}
                    onComplete={handleOnboardingComplete}
                  />
                )}
              </Stack.Screen>
            )}
            <Stack.Screen name="Auth" component={AuthScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={BottomTabs} />
            <Stack.Screen name="CareerScore" component={CareerScoreScreen} />
            <Stack.Screen name="Applications" component={ApplicationsScreen} />
            <Stack.Screen
              name="ProfileEdit"
              component={ProfileScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
