// components/BexiFAB.tsx — Floating Bexi button, appears on all screens except BexiScreen

import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Colors, FontFamily, Shadow } from '../lib/theme';

export default function BexiFAB() {
  const navigation = useNavigation<{ navigate: (s: string) => void }>();
  const scaleAnim  = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 200 }).start();
  };
  const onPress = async () => {
    await Haptics.selectionAsync();
    navigation.navigate('Bexi');
  };

  return (
    <Animated.View style={[s.wrap, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={s.fab}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <Text style={s.emoji}>🤖</Text>
        <Text style={s.label}>Bexi</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute', bottom: 24, right: 20, zIndex: 999,
  },
  fab: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.brand,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.lg,
    borderWidth: 2, borderColor: Colors.brand3,
  },
  emoji: { fontSize: 22 },
  label: { fontSize: 9, fontFamily: FontFamily.soraSemiBold, color: '#fff', marginTop: 1 },
});
