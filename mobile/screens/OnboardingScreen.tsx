import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, FontFamily } from '../lib/theme';
const { width: W } = Dimensions.get('window');
const SLIDES = [
  { emoji: '🤖', title: 'Bexi AI Career Guide', subtitle: 'Ask anything about jobs, salary, interviews.\nNo daily limits. Always free.' },
  { emoji: '💼', title: '1,500+ Live Indian Jobs', subtitle: 'Filter by city, role, experience.\nApply in one tap.' },
  { emoji: '🎯', title: 'Track Your Career Score', subtitle: 'Know exactly where you stand.\nBeat 71% of professionals in your field.' },
];
export default function OnboardingScreen({ navigation }: any) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const goToSlide = (idx: number) => { scrollRef.current?.scrollTo({ x: idx * W, animated: true }); setCurrentIdx(idx); };
  const finish = async () => { await AsyncStorage.setItem('bx_onboarding_done', '1'); navigation.replace('Auth', {}); };
  return (
    <LinearGradient colors={[Colors.brand, '#0F0830']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity style={s.skipBtn} onPress={finish}><Text style={s.skipTxt}>Skip</Text></TouchableOpacity>
        <ScrollView ref={scrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={e => setCurrentIdx(Math.round(e.nativeEvent.contentOffset.x / W))} style={{ flex: 1 }}>
          {SLIDES.map((slide, i) => (
            <View key={i} style={[s.slide, { width: W }]}>
              <Text style={s.emoji}>{slide.emoji}</Text>
              <Text style={s.title}>{slide.title}</Text>
              <Text style={s.subtitle}>{slide.subtitle}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={s.dots}>{SLIDES.map((_, i) => <View key={i} style={[s.dot, currentIdx === i && s.dotActive]} />)}</View>
        <View style={s.cta}>
          {currentIdx < SLIDES.length - 1
            ? <TouchableOpacity style={s.nextBtn} onPress={() => goToSlide(currentIdx + 1)}><Text style={s.nextTxt}>Next</Text></TouchableOpacity>
            : <TouchableOpacity style={s.startBtn} onPress={finish}><Text style={s.startTxt}>Get Started</Text></TouchableOpacity>}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
const s = StyleSheet.create({
  skipBtn: { position: 'absolute', top: 16, right: 20, zIndex: 10, padding: 8 },
  skipTxt: { color: 'rgba(255,255,255,0.65)', fontSize: 14 },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  emoji: { fontSize: 72, marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.72)', textAlign: 'center', lineHeight: 26 },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center', paddingVertical: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { width: 24, backgroundColor: '#fff' },
  cta: { paddingHorizontal: 28, paddingBottom: 32 },
  nextBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  nextTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  startBtn: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  startTxt: { color: '#2D1B69', fontSize: 16, fontWeight: '800' },
});
