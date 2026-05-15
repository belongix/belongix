/**
 * Belongix — Bottom Tab Navigator
 * 5 tabs: Home | Jobs | Bexi (hero, centre) | Learn | Profile
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { Colors, FontFamily } from '../lib/theme';
import DashboardScreen   from '../screens/DashboardScreen';
import JobsScreen        from '../screens/JobsScreen';
import BexiScreen        from '../screens/BexiScreen';
import UpskillScreen     from '../screens/UpskillScreen';
import ProfileScreen     from '../screens/ProfileScreen';

export type TabParamList = {
  Home:    undefined;
  Jobs:    undefined;
  Bexi:    undefined;
  Learn:   undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

/** Custom centre Bexi tab icon — larger, purple circle */
function BexiTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.bexiBtn, focused && styles.bexiBtnActive]}>
      <Text style={styles.bexiEmoji}>🤖</Text>
    </View>
  );
}

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.brand,
        tabBarInactiveTintColor: Colors.muted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
        tabBarIcon: ({ focused, color, size }) => {
          switch (route.name) {
            case 'Home':
              return <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />;
            case 'Jobs':
              return <Ionicons name={focused ? 'briefcase' : 'briefcase-outline'} size={22} color={color} />;
            case 'Bexi':
              return <BexiTabIcon focused={focused} />;
            case 'Learn':
              return <Ionicons name={focused ? 'school' : 'school-outline'} size={22} color={color} />;
            case 'Profile':
              return <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Home"    component={DashboardScreen}  options={{ title: 'Home' }} />
      <Tab.Screen name="Jobs"    component={JobsScreen}       options={{ title: 'Jobs' }} />
      <Tab.Screen
        name="Bexi"
        component={BexiScreen}
        options={{
          title: 'Bexi AI',
          tabBarLabel: 'Bexi',
          tabBarItemStyle: { marginTop: -8 }, // lifts the centre button
        }}
      />
      <Tab.Screen name="Learn"   component={UpskillScreen}    options={{ title: 'Learn' }} />
      <Tab.Screen name="Profile" component={ProfileScreen}    options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopColor:  Colors.border,
    borderTopWidth:  1,
    height:          Platform.OS === 'ios' ? 84 : 64,
    paddingBottom:   Platform.OS === 'ios' ? 28 : 8,
    paddingTop:      8,
  },
  label: {
    fontFamily: FontFamily.dmSansMed,
    fontSize:   11,
    marginTop:  2,
  },
  bexiBtn: {
    width:           52,
    height:          52,
    borderRadius:    26,
    backgroundColor: Colors.brand,
    alignItems:      'center',
    justifyContent:  'center',
    marginTop:       -16,
    shadowColor:     Colors.brand,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.4,
    shadowRadius:    12,
    elevation:       8,
  },
  bexiBtnActive: {
    backgroundColor: Colors.brand2,
  },
  bexiEmoji: {
    fontSize: 24,
  },
});
