import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import BottomTabs from './BottomTabs';
import SalaryScreen from '../screens/SalaryScreen';
import MentorsScreen from '../screens/MentorsScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ResumeScreen from '../screens/ResumeScreen';
import CareerScoreScreen from '../screens/CareerScoreScreen';

const Stack = createNativeStackNavigator();

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
        <>
          <Stack.Screen name="MainTabs" component={BottomTabs} />
          <Stack.Screen name="Salary"      component={SalaryScreen}      />
          <Stack.Screen name="Mentors"     component={MentorsScreen}     />
          <Stack.Screen name="Community"   component={CommunityScreen}   />
          <Stack.Screen name="Resume"      component={ResumeScreen}      />
          <Stack.Screen name="Score"       component={CareerScoreScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
