import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, getTier, companyColor } from '../lib/theme';
import { navigationRef } from '../lib/navigationRef';

import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

const { width: W } = Dimensions.get('window');
const CARD_W = (W - 16 * 2 - 10) / 2.2;

const QA = [
  { icon:'briefcase-outline',     label:'Jobs',      bg:'#EEF2FF', ic:'#4F46E5', tab:'Jobs'  },
  { icon:'sparkles-outline',      label:'Ask Bexi',  bg:'#F5F3FF', ic:'#7C3AED', tab:'Bexi'  },
  { icon:'bar-chart-outline',     label:'Salary',    bg:'#ECFDF5', ic:'#059669', tab:'Salary'  },
  { icon:'book-outline',          label:'Learn',     bg:'#FFF7ED', ic:'#D97706', tab:'Learn'  },
  { icon:'people-outline',        label:'Mentors',   bg:'#FFF1F2', ic:'#E11D48', tab:'Mentors' },
  { icon:'chatbubbles-outline',   label:'Community', bg:'#F0F9FF', ic:'#0284C7', tab:'Community'},
  { icon:'document-text-outline', label:'Resume',    bg:'#FEF2F2', ic:'#DC2626', tab:'Resume'  },
  { icon:'trophy-outline',        label:'Score',     bg:'#FFFBEB', ic:'#B45309', tab:'Score'   },
];

const SEED = [
  { id:'1', title:'Senior SWE',      company:'Google',   city:'Bangalore', salary_min:45, salary_max:80,  is_exclusive:true  },
  { id:'2', title:'Product Manager', company:'Razorpay', city:'Bangalore', salary_min:28, salary_max:45,  is_exclusive:false },
  { id:'3', title:'Data Scientist',  company:'PhonePe',  city:'Mumbai',    salary_min:22, salary_max:38,  is_exclusive:true  },
  { id:'4', title:'ML Engineer',     company:'Swiggy',   city:'Bangalore', salary_min:20, salary_max:35,  is_exclusive:false },
];

export default function DashboardScreen({ navigation }: any) {
  const { profile, user, loadProfile } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [appCount,   setAppCount]   = useState(0);
  const [jobs,       setJobs]       = useState(SEED);

  const score    = profile?.career_score ?? 30;
  const tier     = getTier(score);
  const name     = profile?.full_name?.split(' ')[0] ?? 'there';
  const h        = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const pct      = Math.min(100,
    [profile?.full_name, profile?.role, profile?.city,
     profile?.skills, profile?.bio, profile?.experience]
    .filter(Boolean).length * 17);

  useEffect(() => { loadStats(); }, [user?.id]);

  const loadStats = async () => {
    if (!user?.id) return;
    try {
      const { count } = await supabase.from('applications')
        .select('id', { count:'exact', head:true }).eq('user_id', user.id);
      setAppCount(count ?? 0);
      const { data } = await supabase.from('jobs')
        .select('id,title,company,city,salary_min,salary_max,is_exclusive')
        .eq('status','active').limit(4);
      if (data && data.length > 0) setJobs(data as any);
    } catch {}
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfile(); await loadStats();
    setRefreshing(false);
  }, [user?.id]);

  const bexiMsg =
    score < 50        ? 'Boost your score by 20 pts today' :
    appCount === 0    ? 'Apply to jobs and earn +15 pts each' :
                        "You're doing great! Ask me anything";

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand} />}
      >

        {/* ─── TOP BAR ─── */}
        <View style={s.topbar}>
          <View style={{ flex: 1 }}>
            <Text style={s.greet}>{greeting}, {name} 👋</Text>
            <Text style={s.greetSub}>Belongix · India Career Platform</Text>
          </View>
          <TouchableOpacity style={s.iconBtn}>
            <Ionicons name="notifications-outline" size={19} color="#555" />
            <View style={s.badgeDot} />
          </TouchableOpacity>
          <View style={[s.avatarC, { backgroundColor: companyColor(name) }]}>
            <Text style={s.avatarTxt}>{name.slice(0,1).toUpperCase()}</Text>
          </View>
        </View>

        {/* ─── CAREER SCORE ─── */}
        <LinearGradient colors={['#1C0F4A','#2D1B69','#3D2A8A']}
          style={s.scoreCard} start={{ x:0,y:0 }} end={{ x:1,y:1 }}>
          <View style={s.deco1} /><View style={s.deco2} />
          <View style={s.scoreRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.scoreLbl}>CAREER SCORE</Text>
              <View style={{ flexDirection:'row', alignItems:'flex-end', gap:3, marginBottom:7 }}>
                <Text style={s.scoreN}>{score}</Text>
                <Text style={s.scoreOf}>/100</Text>
              </View>
              <View style={[s.tierPill, { backgroundColor: tier.color+'28' }]}>
                <View style={[s.tierDot, { backgroundColor: tier.color }]} />
                <Text style={[s.tierTxt, { color: tier.color }]}>{tier.label} Tier</Text>
              </View>
              <Text style={s.pctTxt}>Better than {Math.min(95,score)}% of professionals</Text>
            </View>
            <View style={s.ring}>
              <Text style={s.ringN}>{score}</Text>
              <Text style={s.ringPts}>pts</Text>
              <Text style={s.ringLbl}>{tier.label}</Text>
            </View>
          </View>
          <View style={{ marginTop:10 }}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:5 }}>
              <Text style={s.nextLbl}>
                Next tier: {score<40?'Rising':score<60?'Strong':score<80?'Expert':'Max 🏆'}
              </Text>
              <Text style={s.nextPts}>
                {score<40?40-score:score<60?60-score:score<80?80-score:0} pts to go
              </Text>
            </View>
            <View style={s.track}>
              <LinearGradient colors={['#FF8C42','#FFB347']}
                style={[s.trackFill, { width:`${score}%` as any }]}
                start={{ x:0,y:0 }} end={{ x:1,y:0 }} />
            </View>
          </View>
        </LinearGradient>

        {/* ─── STATS ─── */}
        <View style={s.stats}>
          {[
            { l:'Applied', v:appCount,  c:'#4F46E5' },
            { l:'Profile', v:`${pct}%`, c:'#059669' },
            { l:'Score',   v:score,     c:'#D97706' },
            { l:'Courses', v:0,         c:'#0284C7' },
          ].map((st,i) => (
            <React.Fragment key={st.l}>
              <View style={s.statItem}>
                <Text style={[s.statV, { color:st.c }]}>{st.v}</Text>
                <Text style={s.statL}>{st.l}</Text>
              </View>
              {i < 3 && <View style={s.statSep} />}
            </React.Fragment>
          ))}
        </View>

        {/* ─── BEXI ─── fixed width so text never clips ─── */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('Bexi')}
          style={s.bexiWrap}
        >
          <LinearGradient colors={['#0D0826','#1A1040']}
            style={s.bexiCard} start={{ x:0,y:0 }} end={{ x:1,y:0 }}>
            {/* avatar */}
            <View style={s.bexiAvatar}>
              <Text style={{ fontSize:15 }}>🤖</Text>
            </View>
            {/* text — flex:1 + width:0 forces proper wrapping */}
            <View style={{ flex:1, width:0 }}>
              <View style={s.bexiTag}>
                <Text style={s.bexiTagTxt}>BEXI AI</Text>
              </View>
              <Text style={s.bexiMsg}>{bexiMsg}</Text>
              <Text style={s.bexiSub}>Unlimited · Always free</Text>
            </View>
            {/* button — fixed width, never shrinks */}
            <TouchableOpacity
              style={s.bexiBtn}
              onPress={() => navigation.navigate('Bexi')}
            >
              <Text style={s.bexiBtnTxt}>Ask →</Text>
            </TouchableOpacity>
          </LinearGradient>
        </TouchableOpacity>

        {/* ─── QUICK ACTIONS ─── */}
        <Text style={s.secTitle}>Quick Actions</Text>
        <View style={s.qaGrid}>
          {QA.map(a => (
            <TouchableOpacity key={a.label} style={s.qaItem}
              activeOpacity={0.7}
              onPress={() => { if (!a.tab) return; const stackScreens=['Salary','Mentors','Community','Resume','Score']; if(stackScreens.includes(a.tab)){navigationRef.navigate(a.tab as never);}else{navigation.navigate(a.tab as any);} }}>
              <View style={[s.qaBox, { backgroundColor: a.bg }]}>
                <Ionicons name={a.icon as any} size={18} color={a.ic} />
              </View>
              <Text style={s.qaLbl}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── LIVE JOBS ─── */}
        <View style={s.secRow}>
          <Text style={s.secTitle2}>Live Jobs</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Jobs')}
            style={{ flexDirection:'row', alignItems:'center', gap:2 }}>
            <Text style={s.seeAll}>See all</Text>
            <Ionicons name="chevron-forward" size={12} color={Colors.brand} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.jobsRow}>
          {jobs.map(job => (
            <TouchableOpacity key={job.id} style={s.jobCard}
              activeOpacity={0.88} onPress={() => navigation.navigate('Jobs')}>
              <View style={{ flexDirection:'row', alignItems:'center', gap:7, marginBottom:7 }}>
                <View style={[s.jobLogo, { backgroundColor: companyColor(job.company) }]}>
                  <Text style={s.jobLogoTxt}>{job.company.slice(0,2).toUpperCase()}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={s.jobCo} numberOfLines={1}>{job.company}</Text>
                  <Text style={s.jobCity}>{job.city}</Text>
                </View>
                {job.is_exclusive && <Text style={{ fontSize:11 }}>⭐</Text>}
              </View>
              <Text style={s.jobTitle} numberOfLines={2}>{job.title}</Text>
              <Text style={s.jobSal}>₹{job.salary_min}–{job.salary_max}L/yr</Text>
              <View style={s.applyBtn}>
                <Ionicons name="flash" size={11} color="#fff" />
                <Text style={s.applyTxt}>Easy Apply</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ─── SALARY TEASER ─── */}
        <LinearGradient colors={['#064E3B','#065F46']} style={s.teaser}
          start={{ x:0,y:0 }} end={{ x:1,y:0 }}>
          <View style={{ flex:1 }}>
            <Text style={s.teaserTitle}>Know your market worth 💰</Text>
            <Text style={s.teaserSub}>Real salary data · 15+ roles across India</Text>
          </View>
          <View style={s.teaserBtn}>
            <Text style={s.teaserBtnTxt}>Check →</Text>
          </View>
        </LinearGradient>

        <View style={{ height:28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── STYLES ── */
const SH = {
  shadowColor:'#000',
  shadowOffset:{ width:0, height:2 },
  shadowOpacity:0.07,
  shadowRadius:8,
  elevation:3,
};

const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:'#F3F2F7' },

  /* top bar */
  topbar:   { flexDirection:'row', alignItems:'center', gap:8, paddingHorizontal:16, paddingTop:6, paddingBottom:10 },
  greet:    { fontSize:15, fontWeight:'700', color:'#111827', letterSpacing:-0.2 },
  greetSub: { fontSize:11, color:'#9CA3AF', marginTop:1 },
  iconBtn:  { width:34, height:34, borderRadius:17, backgroundColor:'#fff', alignItems:'center', justifyContent:'center', ...SH },
  badgeDot: { position:'absolute', top:7, right:7, width:6, height:6, borderRadius:3, backgroundColor:'#FF5C35', borderWidth:1, borderColor:'#fff' },
  avatarC:  { width:34, height:34, borderRadius:17, alignItems:'center', justifyContent:'center' },
  avatarTxt:{ color:'#fff', fontSize:13, fontWeight:'700' },

  /* score */
  scoreCard: { marginHorizontal:16, borderRadius:16, padding:16, marginBottom:10, overflow:'hidden', ...SH, shadowOpacity:0.2, shadowColor:'#2D1B69' },
  deco1:     { position:'absolute', width:130, height:130, borderRadius:65, backgroundColor:'rgba(255,255,255,0.04)', top:-35, right:-25 },
  deco2:     { position:'absolute', width:75,  height:75,  borderRadius:38, backgroundColor:'rgba(255,255,255,0.04)', bottom:-15, left:5 },
  scoreRow:  { flexDirection:'row', alignItems:'center' },
  scoreLbl:  { fontSize:9.5, color:'rgba(255,255,255,0.45)', fontWeight:'700', letterSpacing:1.2, marginBottom:2 },
  scoreN:    { fontSize:42, fontWeight:'800', color:'#fff', lineHeight:46 },
  scoreOf:   { fontSize:15, color:'rgba(255,255,255,0.4)', marginBottom:5 },
  tierPill:  { flexDirection:'row', alignItems:'center', gap:4, alignSelf:'flex-start', borderRadius:20, paddingHorizontal:8, paddingVertical:3 },
  tierDot:   { width:5, height:5, borderRadius:3 },
  tierTxt:   { fontSize:10.5, fontWeight:'700' },
  pctTxt:    { fontSize:10.5, color:'rgba(255,255,255,0.45)', marginTop:4 },
  ring:      { width:70, height:70, borderRadius:35, borderWidth:2, borderColor:'rgba(255,255,255,0.18)', alignItems:'center', justifyContent:'center', backgroundColor:'rgba(255,255,255,0.07)' },
  ringN:     { fontSize:20, fontWeight:'800', color:'#fff' },
  ringPts:   { fontSize:8.5, color:'rgba(255,255,255,0.5)', marginTop:-2 },
  ringLbl:   { fontSize:8.5, color:'rgba(255,255,255,0.5)', marginTop:1 },
  nextLbl:   { fontSize:10.5, color:'rgba(255,255,255,0.5)' },
  nextPts:   { fontSize:10.5, color:'#FFB347', fontWeight:'700' },
  track:     { height:4, backgroundColor:'rgba(255,255,255,0.12)', borderRadius:2, overflow:'hidden' },
  trackFill: { height:'100%', borderRadius:2 },

  /* stats */
  stats:    { flexDirection:'row', alignItems:'center', marginHorizontal:16, marginBottom:10, backgroundColor:'#fff', borderRadius:12, paddingVertical:12, paddingHorizontal:8, ...SH },
  statItem: { flex:1, alignItems:'center' },
  statV:    { fontSize:17, fontWeight:'800', letterSpacing:-0.4 },
  statL:    { fontSize:10, color:'#9CA3AF', marginTop:2, fontWeight:'500' },
  statSep:  { width:1, height:26, backgroundColor:'#F1F5F9' },

  /* bexi — key fix: flex row with width:0 on text view */
  bexiWrap: { marginHorizontal:16, marginBottom:10, borderRadius:12, overflow:'hidden', ...SH, shadowColor:'#1A1040', shadowOpacity:0.2 },
  bexiCard: { flexDirection:'row', alignItems:'center', padding:13, gap:10 },
  bexiAvatar:{ width:34, height:34, borderRadius:17, backgroundColor:'rgba(255,255,255,0.08)', alignItems:'center', justifyContent:'center', flexShrink:0 },
  bexiTag:  { backgroundColor:'rgba(124,58,237,0.25)', alignSelf:'flex-start', borderRadius:20, paddingHorizontal:6, paddingVertical:1, marginBottom:3 },
  bexiTagTxt:{ fontSize:8, color:'#A78BFA', fontWeight:'800', letterSpacing:0.8 },
  bexiMsg:  { fontSize:12.5, color:'#fff', fontWeight:'600', lineHeight:18, marginBottom:1 },
  bexiSub:  { fontSize:10, color:'rgba(255,255,255,0.4)' },
  bexiBtn:  { backgroundColor:'#FF5C35', borderRadius:18, paddingHorizontal:12, paddingVertical:7, flexShrink:0 },
  bexiBtnTxt:{ color:'#fff', fontSize:12, fontWeight:'700' },

  /* quick actions */
  secTitle: { fontSize:14, fontWeight:'700', color:'#111827', paddingHorizontal:16, marginBottom:8, marginTop:2 },
  qaGrid:   { flexDirection:'row', flexWrap:'wrap', paddingHorizontal:8, marginBottom:12 },
  qaItem:   { width:(W-16)/4, alignItems:'center', paddingVertical:8, gap:5 },
  qaBox:    { width:40, height:40, borderRadius:11, alignItems:'center', justifyContent:'center' },
  qaLbl:    { fontSize:10.5, fontWeight:'600', color:'#374151', textAlign:'center' },

  /* live jobs */
  secRow:   { flexDirection:'row', alignItems:'center', paddingHorizontal:16, marginBottom:8 },
  secTitle2:{ fontSize:14, fontWeight:'700', color:'#111827', flex:1 },
  seeAll:   { fontSize:12.5, fontWeight:'600', color:Colors.brand },
  jobsRow:  { paddingHorizontal:16, gap:10, paddingBottom:4, marginBottom:12 },
  jobCard:  { width:CARD_W, backgroundColor:'#fff', borderRadius:12, padding:12, ...SH },
  jobLogo:  { width:30, height:30, borderRadius:9, alignItems:'center', justifyContent:'center', flexShrink:0 },
  jobLogoTxt:{ color:'#fff', fontSize:11, fontWeight:'800' },
  jobCo:    { fontSize:11.5, fontWeight:'700', color:'#111827' },
  jobCity:  { fontSize:10, color:'#9CA3AF' },
  jobTitle: { fontSize:12, fontWeight:'600', color:'#1E293B', lineHeight:16, marginBottom:5 },
  jobSal:   { fontSize:11.5, fontWeight:'800', color:'#059669', marginBottom:8 },
  applyBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:4, backgroundColor:'#059669', borderRadius:7, paddingVertical:6 },
  applyTxt: { color:'#fff', fontSize:11, fontWeight:'700' },

  /* teaser */
  teaser:      { marginHorizontal:16, borderRadius:12, padding:14, flexDirection:'row', alignItems:'center', marginBottom:10, ...SH },
  teaserTitle: { fontSize:13, fontWeight:'700', color:'#fff', marginBottom:2 },
  teaserSub:   { fontSize:11, color:'rgba(255,255,255,0.65)' },
  teaserBtn:   { backgroundColor:'rgba(255,255,255,0.15)', borderRadius:18, paddingHorizontal:12, paddingVertical:7 },
  teaserBtnTxt:{ color:'#fff', fontSize:12, fontWeight:'700' },
});







