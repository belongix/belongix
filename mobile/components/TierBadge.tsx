// components/TierBadge.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontFamily, getTier } from '../lib/theme';

interface Props { score: number; size?: 'sm' | 'md' | 'lg'; }

export default function TierBadge({ score, size = 'md' }: Props) {
  const tier = getTier(score);
  const fz = size === 'sm' ? 10 : size === 'lg' ? 13 : 11;
  const ph = size === 'sm' ? 7  : size === 'lg' ? 14 : 10;
  const pv = size === 'sm' ? 2  : size === 'lg' ? 5  : 3;
  return (
    <View style={[s.badge, { backgroundColor: tier.bg, paddingHorizontal: ph, paddingVertical: pv }]}>
      <Text style={[s.txt, { fontSize: fz, color: tier.color }]}>{tier.label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: { borderRadius: 20, alignSelf: 'flex-start' },
  txt:   { fontFamily: FontFamily.soraSemiBold },
});
