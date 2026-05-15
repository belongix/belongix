/**
 * Belongix — Onboarding Screen
 * 3 slides with Reanimated swipe. Shown only on first launch.
 * Stores onboarding_done in AsyncStorage on completion.
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, Spacing, Radius } from '../lib/theme';

const { width } = Dimensions.get('window');

interface Slide {
  emoji: string;
  title: string;
  body:  string;
  bg:    [string, string];
}

const SLIDES: Slide[] = [
  {
    emoji: '🤖',
    title: 'Bexi AI Career Guide',
    body:  'Ask anything about jobs, salary, interviews, and career growth.\nNo daily limits. Always free. India-specific answers.',
    bg:    [Colors.brand, Colors.brand2],
  },
  {
    emoji: '💼',
    title: '1,500+ Live Indian Jobs',
    body:  'Filter by city, role, and experience level.\nApply in one tap. Get real-time alerts for new matches.',
    bg:    ['#0D6EFD', '#0A58CA'],
  },
  {
    emoji: '🎯',
    title: 'Track Your Career Score',
    body:  "Know exactly where you stand.\nBeat 71% of professionals in your field with a personalised action plan.",
    bg:    ['#0F766E', '#065F46'],
  },
];

interface Props {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [current, setCurrent] = useState(0);
  const flatRef = useRef<FlatList<Slide>>(null);

  const goNext = () => {
    if (current < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: current + 1 });
      setCurrent(current + 1);
    } else {
      onComplete();
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrent(idx);
  };

  return (
    <View style={styles.container}>
      {/* Skip */}
      <TouchableOpacity style={styles.skipBtn} onPress={onComplete}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <LinearGradient colors={item.bg} style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </LinearGradient>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity style={styles.cta} onPress={goNext}>
        <Text style={styles.ctaText}>
          {current === SLIDES.length - 1 ? '🚀 Get Started' : 'Next →'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.brand },
  skipBtn:   { position: 'absolute', top: 56, right: 24, zIndex: 10 },
  skipText:  { fontFamily: FontFamily.dmSansMed, fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  slide:     { width, flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emoji:     { fontSize: 80, marginBottom: 24 },
  title:     { fontFamily: FontFamily.soraBlack, fontSize: 26, color: Colors.white, textAlign: 'center', letterSpacing: -0.5, marginBottom: 16 },
  body:      { fontFamily: FontFamily.dmSans, fontSize: 16, color: 'rgba(255,255,255,0.82)', textAlign: 'center', lineHeight: 26 },
  dotsRow:   { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 20, backgroundColor: Colors.brand },
  dot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { width: 24, backgroundColor: Colors.white },
  cta:       { marginHorizontal: 24, marginBottom: 48, backgroundColor: Colors.white, borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center' },
  ctaText:   { fontFamily: FontFamily.soraBold, fontSize: 16, color: Colors.brand },
});
