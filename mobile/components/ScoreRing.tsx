// components/ScoreRing.tsx — Animated SVG score ring

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { Colors, FontFamily, getTier } from '../lib/theme';

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  animated?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ScoreRing({
  score, size = 80, strokeWidth = 8, showLabel = true, animated: doAnim = true,
}: Props) {
  const tier   = getTier(score);
  const radius = (size - strokeWidth) / 2;
  const circ   = 2 * Math.PI * radius;
  const target = circ * (1 - score / 100);
  const anim   = useRef(new Animated.Value(circ)).current;
  const center = size / 2;

  useEffect(() => {
    if (!doAnim) { anim.setValue(target); return; }
    anim.setValue(circ);
    Animated.timing(anim, { toValue: target, duration: 1200, useNativeDriver: false }).start();
  }, [score]);

  const scoreFontSize = size < 60 ? 13 : size < 90 ? 18 : 26;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGrad id="sg" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor={Colors.brand} />
            <Stop offset="100%" stopColor={Colors.brand3} />
          </SvgGrad>
        </Defs>
        <Circle cx={center} cy={center} r={radius} fill="none"
          stroke={Colors.border} strokeWidth={strokeWidth} />
        <AnimatedCircle cx={center} cy={center} r={radius} fill="none"
          stroke="url(#sg)" strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={anim}
          transform={`rotate(-90 ${center} ${center})`} />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <Text style={[s.score, { fontSize: scoreFontSize, color: tier.color }]}>{score}</Text>
        {showLabel && <Text style={s.label}>/ 100</Text>}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  score: { fontFamily: FontFamily.soraExtraBold },
  label: { fontSize: 10, fontFamily: FontFamily.dmSansRegular, color: Colors.muted, marginTop: -2 },
});
