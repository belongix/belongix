/**
 * Belongix — Dashboard (Home) Screen
 * Greeting + score ring + Bexi nudge + stats + quick actions + recent jobs.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, FontFamily, Spacing, Radius, Shadow, getTier, companyColor, initials } from '../lib/theme';
import { useAuthStore } from '../store/authStore';
import { useJobStore } from '../store/jobStore';
import ScoreRing from '../components/ScoreRing';
import TierBadge from '../components/TierBadge';
import JobCard from '../components/JobCard';
import { Job } from '../lib/supabase';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const QUICK_ACTIONS = [
  { icon: '💼', label: 'Find Jobs',   screen: 'Jobs'   },
  { icon: '🤖', label: 'Ask Bexi',    screen: 'Bexi'   },
  { icon: '💰', label: 'Salary',      screen: 'Salary'  },
  { icon: '🎓', label: 'Learn',       screen: 'Learn'   },
  { icon: '🤝', label: 'Mentors',     screen: 'Mentors' },
  { icon: '👥', label: 'Community',   screen: 'Community' },
  { icon: '📄', label: 'Resume',      screen: 'Resume'  },
  { icon: '⚡', label: 'Upgrade',     screen: 'Upgrade' },
];

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { profile, loadProfile } = useAuthStore();
  const { jobs, loadJobs } = useJobStore();
  const [refreshing, setRefreshing] = useState(false);
  const [appliedCount, setAppliedCount] = useState(0);

  const score = profile?.career_score ?? 30;
  const tier  = getTier(score);
  const name  = profile?.full_name?.split(' ')[0] ?? 'there';

  useEffect(() => {
    loadJobs();
    loadProfile();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadJobs(), loadProfile()]);
    setRefreshing(false);
  }, []);

  // Smart Bexi nudge logic
  const getNudge = () => {
    if (!profile?.skills) return { text: "Add your skills to get personalised Bexi advice", cta: "Add Skills →" };
    if (score < 50) return { text: "Do 3 things to reach the Strong tier and unlock recruiter visibility", cta: "Show me how →" };
    return { text: "You haven't applied to a job in a while. Check today's fresh listings!", cta: "View Jobs →" };
  };
  const nudge = getNudge();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand} />}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}, {name} 👋</Text>
            <Text style={styles.subGreeting}>Ready to level up your career?</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color={Colors.ink} />
          </TouchableOpacity>
        </View>

        {/* ── Score card ── */}
        <TouchableOpacity style={styles.scoreCard} onPress={() => navigation.navigate('CareerScore')} activeOpacity={0.85}>
          <View style={styles.scoreLeft}>
            <ScoreRing score={score} size={70} />
            <View style={styles.scoreInfo}>
              <TierBadge score={score} />
              <Text style={styles.scoreLink}>View full score →</Text>
            </View>
          </View>
          <View style={styles.scoreRight}>
            <Text style={styles.scoreBig}>{score}</Text>
            <Text style={styles.scoreOf}>/100</Text>
          </View>
        </TouchableOpacity>

        {/* ── Bexi nudge ── */}
        <View style={styles.nudgeCard}>
          <View style={styles.nudgeLeft}>
            <Text style={styles.nudgeEmoji}>🤖</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.nudgeTitle}>Bexi tip for you</Text>
              <Text style={styles.nudgeBody}>{nudge.text}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.nudgeBtn} onPress={() => navigation.navigate('Bexi')}>
            <Text style={styles.nudgeBtnText}>{nudge.cta}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          {[
            { label: 'Applied', value: appliedCount },
            { label: 'Profile Views', value: '--' },
            { label: 'Courses Done', value: 0 },
            { label: 'Score Pts', value: score },
          ].map((s) => (
            <View key={s.label} style={styles.statTile}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Quick actions ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={styles.actionTile}
              onPress={() => navigation.navigate(a.screen)}
            >
              <Text style={styles.actionEmoji}>{a.icon}</Text>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Recent jobs ── */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent Jobs</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={jobs.slice(0, 5)}
          keyExtractor={(j) => j.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.jobsRow}
          renderItem={({ item }: { item: Job }) => (
            <JobCard job={item} compact onApply={() => navigation.navigate('Jobs')} />
          )}
        />

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.bg },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  headerLeft:    {},
  greeting:      { fontFamily: FontFamily.soraBold, fontSize: 20, color: Colors.ink, letterSpacing: -0.3 },
  subGreeting:   { fontFamily: FontFamily.dmSans, fontSize: 13, color: Colors.muted, marginTop: 2 },
  scoreCard:     { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...Shadow.md },
  scoreLeft:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  scoreInfo:     { gap: 6 },
  scoreLink:     { fontFamily: FontFamily.dmSansMed, fontSize: 12, color: Colors.brand },
  scoreRight:    { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  scoreBig:      { fontFamily: FontFamily.soraBlack, fontSize: 40, color: Colors.brand, lineHeight: 44 },
  scoreOf:       { fontFamily: FontFamily.dmSans, fontSize: 14, color: Colors.muted, paddingBottom: 6 },
  nudgeCard:     { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: Colors.off, borderWidth: 1.5, borderColor: Colors.brand + '30', borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm },
  nudgeLeft:     { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  nudgeEmoji:    { fontSize: 22, marginTop: 2 },
  nudgeTitle:    { fontFamily: FontFamily.dmSansSemi, fontSize: 12, color: Colors.brand, marginBottom: 2 },
  nudgeBody:     { fontFamily: FontFamily.dmSans, fontSize: 13, color: Colors.ink, lineHeight: 19 },
  nudgeBtn:      { alignSelf: 'flex-end', backgroundColor: Colors.brand, borderRadius: Radius.sm, paddingHorizontal: 14, paddingVertical: 7 },
  nudgeBtnText:  { fontFamily: FontFamily.dmSansSemi, fontSize: 12.5, color: Colors.white },
  statsRow:      { flexDirection: 'row', marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, gap: Spacing.sm },
  statTile:      { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', ...Shadow.sm },
  statValue:     { fontFamily: FontFamily.soraBlack, fontSize: 20, color: Colors.brand },
  statLabel:     { fontFamily: FontFamily.dmSans, fontSize: 10, color: Colors.muted, textAlign: 'center', marginTop: 2 },
  sectionTitle:  { fontFamily: FontFamily.soraBold, fontSize: 15, color: Colors.ink, marginHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  actionsGrid:   { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: Spacing.md, marginBottom: Spacing.lg, gap: Spacing.sm },
  actionTile:    { width: '23%', backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', gap: 5, ...Shadow.sm },
  actionEmoji:   { fontSize: 22 },
  actionLabel:   { fontFamily: FontFamily.dmSans, fontSize: 11, color: Colors.ink, textAlign: 'center' },
  recentHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginRight: Spacing.lg },
  seeAll:        { fontFamily: FontFamily.dmSansMed, fontSize: 13, color: Colors.brand },
  jobsRow:       { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
});
