import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Shadow, getTier } from '../lib/theme';
import { useAuthStore } from '../store/authStore';
const ACTIONS = [
  { icon: 'briefcase-outline', label: 'Find Jobs' },
  { icon: 'sparkles-outline', label: 'Ask Bexi' },
  { icon: 'bar-chart-outline', label: 'Salary' },
  { icon: 'book-outline', label: 'Learn' },
  { icon: 'people-outline', label: 'Mentors' },
  { icon: 'chatbubbles-outline', label: 'Community' },
  { icon: 'document-text-outline', label: 'Resume' },
  { icon: 'star-outline', label: 'Upgrade' },
];
export default function DashboardScreen({ navigation }: any) {
  const { profile } = useAuthStore();
  const score = profile?.career_score ?? 30;
  const tier = getTier(score);
  const name = profile?.full_name?.split(' ')[0] ?? 'there';
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{greeting}, {name}!</Text>
            <Text style={s.sub}>Your career dashboard</Text>
          </View>
          <View style={s.ring}>
            <Text style={[s.ringNum, { color: tier.color }]}>{score}</Text>
          </View>
        </View>
        <View style={s.scoreCard}>
          <View>
            <Text style={s.scoreLbl}>Career Score</Text>
            <Text style={s.scoreVal}>{score}<Text style={s.scoreMax}>/100</Text></Text>
            <View style={[s.tierBadge, { backgroundColor: tier.bg }]}>
              <Text style={[s.tierTxt, { color: tier.color }]}>{tier.label}</Text>
            </View>
          </View>
          <Text style={{ fontSize: 48 }}>🎯</Text>
        </View>
        <View style={s.statsRow}>
          {[{ label: 'Jobs Applied', value: 0 }, { label: 'Score Pts', value: score }, { label: 'Courses', value: 0 }, { label: 'Profile %', value: 40 }].map(stat => (
            <View key={stat.label} style={s.stat}>
              <Text style={s.statVal}>{stat.value}</Text>
              <Text style={s.statLbl}>{stat.label}</Text>
            </View>
          ))}
        </View>
        <Text style={s.sectionTitle}>Quick Actions</Text>
        <View style={s.grid}>
          {ACTIONS.map(a => (
            <TouchableOpacity key={a.label} style={s.item}
              onPress={() => { if (a.label === 'Ask Bexi') navigation.navigate('Bexi'); if (a.label === 'Find Jobs') navigation.navigate('Jobs'); }}>
              <View style={s.icon}><Ionicons name={a.icon as any} size={22} color={Colors.brand} /></View>
              <Text style={s.itemLbl}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  greeting: { fontSize: 18, fontWeight: '800', color: Colors.ink },
  sub: { fontSize: 12.5, color: Colors.muted, marginTop: 2 },
  ring: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, borderColor: Colors.brand, alignItems: 'center', justifyContent: 'center' },
  ringNum: { fontSize: 16, fontWeight: '800' },
  scoreCard: { marginHorizontal: 16, marginTop: 8, borderRadius: 18, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.brand },
  scoreLbl: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  scoreVal: { fontSize: 36, fontWeight: '800', color: '#fff' },
  scoreMax: { fontSize: 18, color: 'rgba(255,255,255,0.6)' },
  tierBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 6 },
  tierTxt: { fontSize: 11, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 14 },
  stat: { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 12, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: Colors.brand },
  statLbl: { fontSize: 9.5, color: Colors.muted, textAlign: 'center', marginTop: 3 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: Colors.ink, paddingHorizontal: 16, marginTop: 20, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
  item: { width: '22%', alignItems: 'center', gap: 6 },
  icon: { width: 50, height: 50, borderRadius: 16, backgroundColor: Colors.off, alignItems: 'center', justifyContent: 'center' },
  itemLbl: { fontSize: 11, color: Colors.ink, textAlign: 'center' },
});
