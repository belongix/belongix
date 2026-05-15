import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily } from '../lib/theme';
import DashboardScreen from '../screens/DashboardScreen';
import JobsScreen from '../screens/JobsScreen';
import BexiScreen from '../screens/BexiScreen';
import UpskillScreen from '../screens/UpskillScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.brand,
        tabBarInactiveTintColor: Colors.muted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen name="Home" component={DashboardScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} /> }} />
      <Tab.Screen name="Jobs" component={JobsScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="briefcase-outline" size={size} color={color} /> }} />
      <Tab.Screen name="Bexi" component={BexiScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.bexiBtn, focused && styles.bexiBtnActive]}>
              <Ionicons name="sparkles" size={24} color="#fff" />
            </View>
          ),
          tabBarLabel: 'Bexi AI',
        }} />
      <Tab.Screen name="Learn" component={UpskillScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="star-outline" size={size} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopColor: Colors.border,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10.5,
    fontFamily: FontFamily.dmSansMedium,
  },
  bexiBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.brand,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
    shadowColor: Colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  bexiBtnActive: { backgroundColor: Colors.brand2 },
});