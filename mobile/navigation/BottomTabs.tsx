import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import JobsScreen from '../screens/JobsScreen';
import BexiScreen from '../screens/BexiScreen';
import UpskillScreen from '../screens/UpskillScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const BRAND = '#2D1B69';

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BRAND,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tab.Screen name="Home" component={DashboardScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} /> }} />
      <Tab.Screen name="Jobs" component={JobsScreen}
        options={{ tabBarLabel: 'Jobs', tabBarIcon: ({ color, size }) => <Ionicons name="briefcase-outline" size={size} color={color} /> }} />
      <Tab.Screen name="Bexi" component={BexiScreen}
        options={{
          tabBarLabel: 'Bexi',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.fab, focused && styles.fabActive]}>
              <Ionicons name="sparkles" size={20} color="#fff" />
            </View>
          ),
        }} />
      <Tab.Screen name="Learn" component={UpskillScreen}
        options={{ tabBarLabel: 'Learn', tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    height: Platform.OS === 'ios' ? 82 : 62,
    paddingBottom: Platform.OS === 'ios' ? 22 : 8,
    paddingTop: 8,
  },
  label: { fontSize: 11, fontWeight: '600' },
  fab: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: BRAND,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  fabActive: { backgroundColor: '#4C2FAA' },
});