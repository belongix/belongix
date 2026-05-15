import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView,
  Animated, Dimensions, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, companyColor } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

const { width: W } = Dimensions.get('window');

const FILTERS = ['All', 'Bangalore', 'Mumbai', 'Hyderabad', 'Remote'];
const EXP_FILTERS = ['Any XP', '0-1 yr', '1-3 yrs', '3-5 yrs', '5+ yrs'];

const SEED_JOBS = [
  { id: '1', title: 'Senior Software Engineer', company: 'Google', city: 'Bangalore', salary_min: 45, salary_max: 80, job_type: 'Full Time', skills: ['Python', 'Go', 'Kubernetes'], is_exclusive: true, experience: '3-5 yrs', posted_at: '2h ago' },
  { id: '2', title: 'Product Manager', company: 'Razorpay', city: 'Bangalore', salary_min: 28, salary_max: 45, job_type: 'Full Time', skills: ['Product', 'SQL', 'Figma'], is_exclusive: false, experience: '3-5 yrs', posted_at: '4h ago' },
  { id: '3', title: 'Data Scientist', company: 'PhonePe', city: 'Bangalore', salary_min: 22, salary_max: 38, job_type: 'Full Time', skills: ['Python', 'ML', 'SQL'], is_exclusive: true, experience: '1-3 yrs', posted_at: '6h ago' },
  { id: '4', title: 'ML Engineer', company: 'Swiggy', city: 'Bangalore', salary_min: 20, salary_max: 35, job_type: 'Full Time', skills: ['PyTorch', 'MLOps', 'AWS'], is_exclusive: false, experience: '1-3 yrs', posted_at: '1d ago' },
  { id: '5', title: 'DevOps Engineer', company: 'CRED', city: 'Bangalore', salary_min: 18, salary_max: 30, job_type: 'Full Time', skills: ['AWS', 'Docker', 'Terraform'], is_exclusive: true, experience: '3-5 yrs', posted_at: '1d ago' },
  { id: '6', title: 'Frontend Engineer', company: 'Zepto', city: 'Mumbai', salary_min: 15, salary_max: 28, job_type: 'Full Time', skills: ['React', 'TypeScript', 'CSS'], is_exclusive: false, experience: '1-3 yrs', posted_at: '2d ago' },
  { id: '7', title: 'Backend Engineer', company: 'Meesho', city: 'Bangalore', salary_min: 18, salary_max: 32, job_type: 'Full Time', skills: ['Java', 'Spring', 'MySQL'], is_exclusive: false, experience: '1-3 yrs', posted_at: '2d ago' },
  { id: '8', title: 'SDE-2 Android', company: 'Ola', city: 'Bangalore', salary_min: 20, salary_max: 35, job_type: 'Full Time', skills: ['Kotlin', 'Android', 'Jetpack'], is_exclusive: true, experience: '3-5 yrs', posted_at: '3d ago' },
];

export default function JobsScreen() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState(SEED_JOBS);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [expFilter, setExpFilter] = useState('Any XP');
  const [applying, setApplying] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<typeof SEED_JOBS[0] | null>(null);
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => { loadJobs(); loadApplied(); }, [user?.id]);

  const loadJobs = async () => {
    try {
      const { data } = await supabase.from('jobs').select('*').eq('status', 'active').limit(30);
      if (data && data.length > 0) setJobs(data as any);
    } catch {}
  };

  const loadApplied = async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase.from('applications').select('role,company').eq('user_id', user.id);
      if (data) setAppliedIds(new Set(data.map((a: any) => `${a.role}|${a.company}`)));
    } catch {}
  };

  const openJob = (job: typeof SEED_JOBS[0]) => {
    setSelectedJob(job);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 100, friction: 15 }).start();
  };

  const closeJob = () => {
    Animated.timing(slideAnim, { toValue: 300, useNativeDriver: true, duration: 200 }).start(() => setSelectedJob(null));
  };

  const applyJob = async (job: typeof SEED_JOBS[0]) => {
    if (!user) { Alert.alert('Sign in to apply'); return; }
    const key = `${job.title}|${job.company}`;
    if (appliedIds.has(key)) { Alert.alert('Already Applied', `You have already applied to ${job.company}.`); return; }
    setApplying(job.id);
    try {
      await supabase.from('applications').insert({
        user_id: user.id, company: job.company, role: job.title,
        city: job.city, status: 'applied', applied_at: new Date().toISOString().split('T')[0],
      });
      setAppliedIds(prev => new Set([...prev, key]));
      Alert.alert('Applied! 🎉', `Application sent to ${job.company}.\n+15 Career Score points!`);
      closeJob();
    } catch { Alert.alert('Error', 'Apply failed. Please try again.'); }
    finally { setApplying(null); }
  };

  const filtered = jobs.filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase());
    const matchCity = cityFilter === 'All' || j.city === cityFilter;
    const matchExp = expFilter === 'Any XP' || (j as any).experience === expFilter;
    return matchSearch && matchCity && matchExp;
  });

  const isApplied = (job: typeof SEED_JOBS[0]) => appliedIds.has(`${job.title}|${job.company}`);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Job Board</Text>
          <Text style={s.headerSub}>{filtered.length} live opportunities</Text>
        </View>
        <View style={s.headerBadge}>
          <View style={s.liveDot} />
          <Text style={s.liveTxt}>Live</Text>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Ionicons name="search" size={18} color={Colors.muted} />
          <TextInput style={s.searchInput} placeholder="Role, company, skill..."
            placeholderTextColor={Colors.muted} value={search} onChangeText={setSearch} />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* City filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} style={[s.filterChip, cityFilter === f && s.filterChipActive]} onPress={() => setCityFilter(f)}>
            <Text style={[s.filterTxt, cityFilter === f && s.filterTxtActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
        <View style={s.filterDivider} />
        {EXP_FILTERS.map(f => (
          <TouchableOpacity key={f} style={[s.filterChip, expFilter === f && s.filterChipActive, expFilter === f && { borderColor: Colors.green }]} onPress={() => setExpFilter(f)}>
            <Text style={[s.filterTxt, expFilter === f && s.filterTxtActive, expFilter === f && { color: Colors.green }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Job list */}
      <FlatList
        data={filtered}
        keyExtractor={j => j.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16, paddingTop: 4 }}
        renderItem={({ item: job }) => {
          const applied = isApplied(job);
          const color = companyColor(job.company);
          return (
            <TouchableOpacity style={s.card} activeOpacity={0.92} onPress={() => openJob(job)}>
              {/* Top row */}
              <View style={s.cardTop}>
                <View style={[s.logo, { backgroundColor: color }]}>
                  <Text style={s.logoTxt}>{job.company.slice(0, 2).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={s.titleRow}>
                    <Text style={s.jobTitle} numberOfLines={1}>{job.title}</Text>
                    {job.is_exclusive && (
                      <View style={s.exclBadge}><Text style={s.exclTxt}>⭐ Excl.</Text></View>
                    )}
                  </View>
                  <Text style={s.jobCompany}>{job.company} · {job.city}</Text>
                </View>
                <TouchableOpacity style={s.bookmarkBtn}>
                  <Ionicons name="bookmark-outline" size={18} color={Colors.muted} />
                </TouchableOpacity>
              </View>

              {/* Skills */}
              <View style={s.skillsRow}>
                {job.skills.slice(0, 3).map(sk => (
                  <View key={sk} style={s.skillChip}>
                    <Text style={s.skillTxt}>{sk}</Text>
                  </View>
                ))}
                <View style={s.expChip}>
                  <Ionicons name="time-outline" size={11} color={Colors.muted} />
                  <Text style={s.expTxt}>{(job as any).experience ?? '1-3 yrs'}</Text>
                </View>
              </View>

              {/* Bottom row */}
              <View style={s.cardBottom}>
                <View>
                  <Text style={s.salary}>₹{job.salary_min}–{job.salary_max}L/yr</Text>
                  <Text style={s.postedAt}>{(job as any).posted_at ?? '2d ago'}</Text>
                </View>
                <TouchableOpacity
                  style={[s.applyBtn, applied && s.appliedBtn]}
                  onPress={() => applyJob(job)}
                  disabled={applying === job.id || applied}>
                  {applying === job.id
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <>
                        <Ionicons name={applied ? 'checkmark' : 'flash'} size={13} color="#fff" />
                        <Text style={s.applyTxt}>{applied ? 'Applied' : 'Easy Apply'}</Text>
                      </>}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Job Detail Bottom Sheet */}
      {selectedJob && (
        <Modal transparent animationType="none" onRequestClose={closeJob}>
          <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={closeJob} />
          <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <View style={s.sheetHandle} />
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Company header */}
              <View style={s.sheetHeader}>
                <View style={[s.sheetLogo, { backgroundColor: companyColor(selectedJob.company) }]}>
                  <Text style={s.sheetLogoTxt}>{selectedJob.company.slice(0, 2).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.sheetTitle}>{selectedJob.title}</Text>
                  <Text style={s.sheetCompany}>{selectedJob.company} · {selectedJob.city}</Text>
                  {selectedJob.is_exclusive && (
                    <View style={[s.exclBadge, { marginTop: 6, alignSelf: 'flex-start' }]}>
                      <Text style={s.exclTxt}>⭐ Belongix Exclusive</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Key info pills */}
              <View style={s.infoPills}>
                {[
                  { icon: 'cash-outline', label: `₹${selectedJob.salary_min}–${selectedJob.salary_max}L/yr`, color: Colors.green },
                  { icon: 'time-outline', label: (selectedJob as any).experience ?? '1-3 yrs', color: Colors.brand },
                  { icon: 'briefcase-outline', label: selectedJob.job_type, color: Colors.sky },
                  { icon: 'location-outline', label: selectedJob.city, color: Colors.orange },
                ].map(p => (
                  <View key={p.label} style={[s.infoPill, { backgroundColor: p.color + '15' }]}>
                    <Ionicons name={p.icon as any} size={13} color={p.color} />
                    <Text style={[s.infoPillTxt, { color: p.color }]}>{p.label}</Text>
                  </View>
                ))}
              </View>

              {/* Skills */}
              <Text style={s.sheetSectionTitle}>Required Skills</Text>
              <View style={s.sheetSkills}>
                {selectedJob.skills.map(sk => (
                  <View key={sk} style={s.sheetSkillChip}>
                    <Text style={s.sheetSkillTxt}>{sk}</Text>
                  </View>
                ))}
              </View>

              {/* Job description */}
              <Text style={s.sheetSectionTitle}>About the Role</Text>
              <Text style={s.sheetDesc}>
                {`${selectedJob.company} is looking for a ${selectedJob.title} to join our growing team in ${selectedJob.city}.\n\nYou will work with a talented team building products used by millions of Indians. We offer competitive pay, great culture, and career growth.\n\nThis is a ${selectedJob.job_type} role requiring ${(selectedJob as any).experience ?? '1-3 years'} of experience.`}
              </Text>

              {/* Apply CTA */}
              <TouchableOpacity
                style={[s.sheetApplyBtn, isApplied(selectedJob) && s.sheetAppliedBtn]}
                onPress={() => applyJob(selectedJob)}
                disabled={applying === selectedJob.id || isApplied(selectedJob)}>
                {applying === selectedJob.id
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <Ionicons name={isApplied(selectedJob) ? 'checkmark-circle' : 'flash'} size={18} color="#fff" />
                      <Text style={s.sheetApplyTxt}>{isApplied(selectedJob) ? 'Applied Successfully' : 'Apply Now — Easy Apply'}</Text>
                    </>}
              </TouchableOpacity>
              <View style={{ height: 32 }} />
            </ScrollView>
          </Animated.View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 10, paddingBottom: 6 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.ink },
  headerSub: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#DCFCE7', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.green },
  liveTxt: { fontSize: 12, fontWeight: '700', color: Colors.green },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.white, borderRadius: 14, paddingHorizontal: 14, height: 46, borderWidth: 1.5, borderColor: Colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.ink },
  filterScroll: { paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
  filterChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  filterTxt: { fontSize: 12.5, fontWeight: '600', color: Colors.muted },
  filterTxtActive: { color: '#fff' },
  filterDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },
  card: { backgroundColor: Colors.white, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border, shadowColor: Colors.brand, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  logo: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  logoTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  jobTitle: { flex: 1, fontSize: 14.5, fontWeight: '700', color: Colors.ink },
  jobCompany: { fontSize: 12, color: Colors.muted },
  bookmarkBtn: { padding: 4 },
  exclBadge: { backgroundColor: '#EEF0FF', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  exclTxt: { fontSize: 9.5, fontWeight: '700', color: Colors.brand },
  skillsRow: { flexDirection: 'row', gap: 6, marginBottom: 12, flexWrap: 'wrap' },
  skillChip: { backgroundColor: Colors.off, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  skillTxt: { fontSize: 11.5, fontWeight: '600', color: Colors.brand },
  expChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FEF9C3', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  expTxt: { fontSize: 11, fontWeight: '600', color: '#A16207' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  salary: { fontSize: 14, fontWeight: '800', color: Colors.green },
  postedAt: { fontSize: 11, color: Colors.muted, marginTop: 2 },
  applyBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.green, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 9 },
  appliedBtn: { backgroundColor: Colors.muted },
  applyTxt: { color: '#fff', fontSize: 12.5, fontWeight: '700' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '85%', paddingHorizontal: 20, paddingTop: 12 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', gap: 14, marginBottom: 16, alignItems: 'flex-start' },
  sheetLogo: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sheetLogoTxt: { color: '#fff', fontSize: 18, fontWeight: '800' },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: Colors.ink, marginBottom: 3 },
  sheetCompany: { fontSize: 13, color: Colors.muted },
  infoPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  infoPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  infoPillTxt: { fontSize: 12, fontWeight: '700' },
  sheetSectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.ink, marginBottom: 10 },
  sheetSkills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  sheetSkillChip: { backgroundColor: Colors.off, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1.5, borderColor: Colors.border },
  sheetSkillTxt: { fontSize: 13, fontWeight: '600', color: Colors.brand },
  sheetDesc: { fontSize: 13.5, color: Colors.muted, lineHeight: 22, marginBottom: 20 },
  sheetApplyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.green, borderRadius: 16, paddingVertical: 16 },
  sheetAppliedBtn: { backgroundColor: Colors.muted },
  sheetApplyTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
