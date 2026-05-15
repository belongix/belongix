import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, getTier, companyColor } from '../lib/theme';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

const { width: W } = Dimensions.get('window');

const QUICK_ACTIONS = [
  { icon: 'briefcase-outline', label: 'Find Jobs', color: '#EEF0FF', iconColor: Colors.brand, tab: 'Jobs' },
  { icon: 'sparkles-outline', label: 'Ask Bexi', color: '#F5F3FF', iconColor: Colors.brand2, tab: 'Bexi' },
  { icon: 'bar-chart-outline', label: 'Salary', color: '#ECFDF5', iconColor: Colors.green, tab: null },
  { icon: 'book-outline', label: 'Learn', color: '#FEF9C3', iconColor: '#A16207', tab: 'Learn' },
  { icon: 'people-outline', label: 'Mentors', color: '#FFF7ED', iconColor: Colors.orange, tab: null },
  { icon: 'chatbubbles-outline', label: 'Community', color: '#F0F9FF', iconColor: '#0EA5E9', tab: null },
  { icon: 'document-text-outline', label: 'Resume', color: '#FEF2F2', iconColor: Colors.red, tab: null },
  { icon: 'trophy-outline', label: 'Career Score', color: '#F5F3FF', iconColor: Colors.brand, tab: null },
];

const SEED_JOBS = [
  { id: '1', title: 'Senior Software Engineer', company: 'Google', city: 'Bangalore', salary_min: 25, salary_max: 40, is_exclusive: true },
  { id: '2', title: 'Data Scientist', company: 'Razorpay', city: 'Mumbai', salary_min: 18, salary_max: 32, is_exclusive: true },
  { id: '3', title: 'Product Manager', company: 'Swiggy', city: 'Bangalore', salary_min: 22, salary_max: 38, is_exclusive: false },
  { id: '4', title: 'ML Engineer', company: 'PhonePe', city: 'Bangalore', salary_min: 20, salary_max: 35, is_exclusive: false },
  { id: '5', title: 'DevOps Engineer', company: 'CRED', city: 'Bangalore', salary_min: 18, salary_max: 28, is_exclusive: true },
];

export default function DashboardScreen({ navigation }: any) {
  const { profile, user, loadProfile } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [appCount, setAppCount] = useState(0);
  const [jobs, setJobs] = useState(SEED_JOBS);

  const score = profile?.career_score ?? 30;
  const tier = getTier(score);
  const name = profile?.full_name?.split(' ')[0] ?? 'there';
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => { loadStats(); }, [user?.id]);

  const loadStats = async () => {
    if (!user?.id) return;
    try {
      const { count } = await supabase.from('applications').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      setAppCount(count ?? 0);
      const { data } = await supabase.from('jobs').select('id,title,company,city,salary_min,salary_max,is_exclusive').eq('status', 'active').limit(5);
      if (data && data.length > 0) setJobs(data as any);
    } catch {}
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfile();
    await loadStats();
    setRefreshing(false);
  }, [user?.id]);

  const pct = Math.min(100, [profile?.full_name, profile?.role, profile?.city, profile?.skills, profile?.bio, profile?.experience].filter(Boolean).length * 17);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand} />}>

        {/* Top bar */}
        <View style={s.topbar}>
          <View style={{ flex: 1 }}>
            <Text style={s.greetingTxt}>{greeting}, {name} 👋</Text>
            <Text style={s.greetingSub}>India Career Platform</Text>
          </View>
          <TouchableOpacity style={s.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.ink} />
            <View style={s.notifDot} />
          </TouchableOpacity>
          <View style={[s.avatarSmall, { backgroundColor: companyColor(name) }]}>
            <Text style={s.avatarSmallTxt}>{name.slice(0, 1).toUpperCase()}</Text>
          </View>
        </View>

        {/* Career Score Hero Card */}
        <LinearGradient colors={['#1A0B4B', '#2D1B69', '#4C2FAA']} style={s.heroCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {/* Decorative circles */}
          <View style={s.decCircle1} />
          <View style={s.decCircle2} />
          <View style={s.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={s.heroLabel}>Career Score</Text>
              <View style={s.heroScoreRow}>
                <Text style={s.heroScore}>{score}</Text>
                <Text style={s.heroScoreMax}>/100</Text>
              </View>
              <View style={[s.tierBadge, { backgroundColor: tier.color + '30' }]}>
                <View style={[s.tierDot, { backgroundColor: tier.color }]} />
                <Text style={[s.tierTxt, { color: tier.color }]}>{tier.label} Tier</Text>
              </View>
              <Text style={s.heroPercentile}>Better than {Math.min(95, score)}% of professionals</Text>
            </View>
            {/* Score ring */}
            <View style={s.scoreRingWrap}>
              <View style={s.scoreRingOuter}>
                <View style={s.scoreRingInner}>
                  <Text style={s.scoreRingNum}>{score}</Text>
                  <Text style={s.scoreRingLabel}>pts</Text>
                </View>
              </View>
              <Text style={s.ringTierLabel}>{tier.label}</Text>
            </View>
          </View>
          {/* Progress bar */}
          <View style={s.heroProgressWrap}>
            <View style={s.heroProgressRow}>
              <Text style={s.heroProgressLabel}>Next tier: {score < 40 ? 'Rising' : score < 60 ? 'Strong' : score < 80 ? 'Expert' : 'Max!'}</Text>
              <Text style={s.heroProgressPts}>{score < 40 ? 40 - score : score < 60 ? 60 - score : score < 80 ? 80 - score : 0} pts to go</Text>
            </View>
            <View style={s.heroProgressBar}>
              <LinearGradient colors={[Colors.orange, Colors.amber]} style={[s.heroProgressFill, { width: `${score}%` }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            </View>
          </View>
        </LinearGradient>

        {/* Bexi AI Nudge */}
        <LinearGradient colors={['#0F0830', '#1A0F40']} style={s.bexiCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <View style={s.bexiLeft}>
            <View style={s.bexiAvatarWrap}>
              <Text style={s.bexiAvatar}>🤖</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.bexiBadge}><Text style={s.bexiBadgeTxt}>Bexi AI</Text></View>
              <Text style={s.bexiTitle}>
                {score < 50 ? 'Boost your score by 20 pts today' :
                 appCount === 0 ? 'Apply to jobs and earn +15 pts each' :
                 'You are doing great! Ask me anything'}
              </Text>
              <Text style={s.bexiSub}>Unlimited queries · Always free</Text>
            </View>
          </View>
          <TouchableOpacity style={s.bexiBtn} onPress={() => navigation.navigate('Bexi')}>
            <Text style={s.bexiBtnTxt}>Ask →</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats row */}
        <View style={s.statsRow}>
          {[
            { label: 'Jobs Applied', value: appCount, icon: 'briefcase', color: Colors.brand },
            { label: 'Profile %', value: `${pct}%`, icon: 'person', color: Colors.green },
            { label: 'Score Pts', value: score, icon: 'trophy', color: Colors.amber },
            { label: 'Courses', value: 0, icon: 'book', color: Colors.sky },
          ].map(stat => (
            <View key={stat.label} style={s.statTile}>
              <View style={[s.statIcon, { backgroundColor: stat.color + '18' }]}>
                <Ionicons name={stat.icon as any} size={14} color={stat.color} />
              </View>
              <Text style={[s.statVal, { color: stat.color }]}>{stat.value}</Text>
              <Text style={s.statLbl}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Profile completeness */}
        {pct < 100 && (
          <View style={s.profileCard}>
            <View style={s.profileCardTop}>
              <View>
                <Text style={s.profileCardTitle}>Complete your profile</Text>
                <Text style={s.profileCardSub}>Get 3x more recruiter views</Text>
              </View>
              <Text style={[s.profileCardPct, { color: pct < 50 ? Colors.red : pct < 80 ? Colors.amber : Colors.green }]}>{pct}%</Text>
            </View>
            <View style={s.profileBar}>
              <LinearGradient colors={pct < 50 ? [Colors.red, Colors.orange] : pct < 80 ? [Colors.amber, Colors.green] : [Colors.green, Colors.sky]}
                style={[s.profileBarFill, { width: `${pct}%` }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            </View>
            <TouchableOpacity style={s.profileCardBtn} onPress={() => navigation.navigate('Profile')}>
              <Text style={s.profileCardBtnTxt}>Complete Profile → +30 pts</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={s.qaGrid}>
          {QUICK_ACTIONS.map(a => (
            <TouchableOpacity key={a.label} style={s.qaItem}
              onPress={() => { if (a.tab) navigation.navigate(a.tab); }}>
              <View style={[s.qaIcon, { backgroundColor: a.color }]}>
                <Ionicons name={a.icon as any} size={24} color={a.iconColor} />
              </View>
              <Text style={s.qaLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Jobs */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Live Jobs</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Jobs')} style={s.seeAllBtn}>
            <Text style={s.seeAllTxt}>See all</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.brand} />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.jobsScroll}>
          {jobs.map(job => (
            <TouchableOpacity key={job.id} style={s.jobCard} activeOpacity={0.85} onPress={() => navigation.navigate('Jobs')}>
              <View style={[s.jobLogo, { backgroundColor: companyColor(job.company) }]}>
                <Text style={s.jobLogoTxt}>{job.company.slice(0, 2).toUpperCase()}</Text>
              </View>
              {job.is_exclusive && (
                <View style={s.exclBadge}><Text style={s.exclTxt}>⭐ Exclusive</Text></View>
              )}
              <Text style={s.jobTitle} numberOfLines={2}>{job.title}</Text>
              <Text style={s.jobCompany}>{job.company}</Text>
              <View style={s.jobMeta}>
                <Ionicons name="location-outline" size={11} color={Colors.muted} />
                <Text style={s.jobCity}>{job.city}</Text>
              </View>
              {job.salary_min && (
                <View style={s.salaryBadge}>
                  <Text style={s.salaryTxt}>₹{job.salary_min}–{job.salary_max}L</Text>
                </View>
              )}
              <TouchableOpacity style={s.applyBtn} onPress={() => navigation.navigate('Jobs')}>
                <Ionicons name="flash" size={12} color="#fff" />
                <Text style={s.applyTxt}>Easy Apply</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Salary teaser */}
        <LinearGradient colors={['#064E3B', '#065F46']} style={s.salaryTeaser} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <View style={{ flex: 1 }}>
            <Text style={s.salaryTeaserTitle}>Know your market worth 💰</Text>
            <Text style={s.salaryTeaserSub}>Real salary data for 15+ roles across India</Text>
          </View>
          <TouchableOpacity style={s.salaryTeaserBtn}>
            <Text style={s.salaryTeaserBtnTxt}>Check →</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Mentor teaser */}
        <View style={s.mentorTeaser}>
          <View style={s.mentorTeaserLeft}>
            <Text style={s.mentorTeaserEmoji}>🤝</Text>
            <View>
              <Text style={s.mentorTeaserTitle}>1-on-1 Mentor Sessions</Text>
              <Text style={s.mentorTeaserSub}>50+ verified mentors from top companies</Text>
              <View style={s.mentorAvatarRow}>
                {['G', 'M', 'R', 'P', 'Z'].map((l, i) => (
                  <View key={i} style={[s.mentorAvatarSmall, { backgroundColor: ['#2D1B69','#10B981','#FF5C35','#F59E0B','#06B6D4'][i], marginLeft: i > 0 ? -8 : 0 }]}>
                    <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{l}</Text>
                  </View>
                ))}
                <Text style={s.mentorCount}>+45 more</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={s.mentorTeaserBtn}>
            <Text style={s.mentorTeaserBtnTxt}>Book →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  topbar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 12 },
  greetingTxt: { fontSize: 17, fontWeight: '800', color: Colors.ink },
  greetingSub: { fontSize: 11.5, color: Colors.muted, marginTop: 1 },
  notifBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  notifDot: { position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.orange, borderWidth: 1.5, borderColor: Colors.white },
  avatarSmall: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  avatarSmallTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },

  heroCard: { marginHorizontal: 16, borderRadius: 22, padding: 20, marginBottom: 12, overflow: 'hidden', shadowColor: Colors.brand, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 12 },
  decCircle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.04)', top: -40, right: -40 },
  decCircle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.03)', bottom: -20, left: -20 },
  heroTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  heroLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '500', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 },
  heroScoreRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginBottom: 8 },
  heroScore: { fontSize: 48, fontWeight: '800', color: '#fff', lineHeight: 52 },
  heroScoreMax: { fontSize: 20, color: 'rgba(255,255,255,0.5)', marginBottom: 6 },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 6 },
  tierDot: { width: 6, height: 6, borderRadius: 3 },
  tierTxt: { fontSize: 11, fontWeight: '700' },
  heroPercentile: { fontSize: 11.5, color: 'rgba(255,255,255,0.55)' },
  scoreRingWrap: { alignItems: 'center', gap: 6 },
  scoreRingOuter: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
  scoreRingInner: { alignItems: 'center' },
  scoreRingNum: { fontSize: 22, fontWeight: '800', color: '#fff' },
  scoreRingLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)' },
  ringTierLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  heroProgressWrap: {},
  heroProgressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  heroProgressLabel: { fontSize: 11.5, color: 'rgba(255,255,255,0.6)' },
  heroProgressPts: { fontSize: 11.5, color: Colors.orange, fontWeight: '600' },
  heroProgressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' },
  heroProgressFill: { height: '100%', borderRadius: 3 },

  bexiCard: { marginHorizontal: 16, borderRadius: 18, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
  bexiLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  bexiAvatarWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  bexiAvatar: { fontSize: 20 },
  bexiBadge: { backgroundColor: Colors.brand, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4 },
  bexiBadgeTxt: { fontSize: 9, color: '#fff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  bexiTitle: { fontSize: 13, color: '#fff', fontWeight: '600', lineHeight: 18, marginBottom: 2 },
  bexiSub: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  bexiBtn: { backgroundColor: Colors.orange, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  bexiBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  statTile: { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 11, alignItems: 'center', gap: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  statIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  statVal: { fontSize: 18, fontWeight: '800' },
  statLbl: { fontSize: 9, color: Colors.muted, textAlign: 'center', fontWeight: '500' },

  profileCard: { marginHorizontal: 16, backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  profileCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  profileCardTitle: { fontSize: 14, fontWeight: '700', color: Colors.ink },
  profileCardSub: { fontSize: 11.5, color: Colors.muted, marginTop: 2 },
  profileCardPct: { fontSize: 22, fontWeight: '800' },
  profileBar: { height: 7, backgroundColor: Colors.background, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  profileBarFill: { height: '100%', borderRadius: 4 },
  profileCardBtn: { backgroundColor: Colors.off, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.brand + '30' },
  profileCardBtnTxt: { fontSize: 13, fontWeight: '600', color: Colors.brand },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.ink },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllTxt: { fontSize: 13, fontWeight: '600', color: Colors.brand },

  qaGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, marginBottom: 20 },
  qaItem: { width: (W - 56) / 4, alignItems: 'center', gap: 7 },
  qaIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  qaLabel: { fontSize: 11, color: Colors.ink, textAlign: 'center', fontWeight: '600' },

  jobsScroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 4, marginBottom: 16 },
  jobCard: { width: 165, backgroundColor: Colors.white, borderRadius: 18, padding: 14, shadowColor: Colors.brand, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  jobLogo: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  jobLogoTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
  exclBadge: { backgroundColor: '#EEF0FF', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 6 },
  exclTxt: { fontSize: 9.5, fontWeight: '700', color: Colors.brand },
  jobTitle: { fontSize: 13, fontWeight: '700', color: Colors.ink, marginBottom: 3, lineHeight: 18 },
  jobCompany: { fontSize: 11.5, color: Colors.muted, marginBottom: 4 },
  jobMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6 },
  jobCity: { fontSize: 11, color: Colors.muted },
  salaryBadge: { backgroundColor: '#DCFCE7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 10 },
  salaryTxt: { fontSize: 11.5, fontWeight: '700', color: '#15803D' },
  applyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: Colors.green, borderRadius: 10, paddingVertical: 8 },
  applyTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },

  salaryTeaser: { marginHorizontal: 16, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  salaryTeaserTitle: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 3 },
  salaryTeaserSub: { fontSize: 11.5, color: 'rgba(255,255,255,0.7)' },
  salaryTeaserBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  salaryTeaserBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },

  mentorTeaser: { marginHorizontal: 16, backgroundColor: Colors.white, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  mentorTeaserLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  mentorTeaserEmoji: { fontSize: 32 },
  mentorTeaserTitle: { fontSize: 13.5, fontWeight: '700', color: Colors.ink, marginBottom: 2 },
  mentorTeaserSub: { fontSize: 11.5, color: Colors.muted, marginBottom: 6 },
  mentorAvatarRow: { flexDirection: 'row', alignItems: 'center' },
  mentorAvatarSmall: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.white },
  mentorCount: { fontSize: 10.5, color: Colors.muted, marginLeft: 6, fontWeight: '600' },
  mentorTeaserBtn: { backgroundColor: Colors.brand, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  mentorTeaserBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
