import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import BottomTabs from './BottomTabs';

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: { referralCode?: string };
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { session } = useAuthStore();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
        </>
      ) : (
        <Stack.Screen name="MainTabs" component={BottomTabs} />
      )}
    </Stack.Navigator>
  );
}