import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Shadow, companyColor } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface Job {
  id: string; title: string; company: string; city: string;
  salary_min: number | null; salary_max: number | null;
  job_type: string; skills: string[] | null; is_exclusive: boolean;
}

const SEED_JOBS: Job[] = [
  { id: '1', title: 'Software Engineer', company: 'Swiggy', city: 'Bangalore', salary_min: 20, salary_max: 35, job_type: 'Full Time', skills: ['React', 'Node.js', 'AWS'], is_exclusive: true },
  { id: '2', title: 'Product Manager', company: 'CRED', city: 'Bangalore', salary_min: 25, salary_max: 40, job_type: 'Full Time', skills: ['Product', 'Analytics', 'SQL'], is_exclusive: false },
  { id: '3', title: 'Data Scientist', company: 'PhonePe', city: 'Bangalore', salary_min: 18, salary_max: 30, job_type: 'Full Time', skills: ['Python', 'ML', 'SQL'], is_exclusive: true },
  { id: '4', title: 'DevOps Engineer', company: 'Razorpay', city: 'Bangalore', salary_min: 15, salary_max: 28, job_type: 'Full Time', skills: ['AWS', 'Kubernetes', 'Docker'], is_exclusive: false },
  { id: '5', title: 'ML Engineer', company: 'Zepto', city: 'Mumbai', salary_min: 20, salary_max: 35, job_type: 'Full Time', skills: ['Python', 'TensorFlow', 'MLOps'], is_exclusive: true },
];

export default function JobsScreen() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>(SEED_JOBS);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    try {
      const { data } = await supabase.from('jobs').select('*').eq('status', 'active').limit(30);
      if (data && data.length > 0) setJobs(data as Job[]);
    } catch { /* keep seed */ }
  };

  const applyJob = async (job: Job) => {
    if (!user) { Alert.alert('Sign in to apply'); return; }
    setApplying(job.id);
    try {
      await supabase.from('applications').insert({
        user_id: user.id, company: job.company, role: job.title,
        city: job.city, status: 'applied', applied_at: new Date().toISOString().split('T')[0],
      });
      Alert.alert('✅ Applied!', `Application sent to ${job.company}. +15 Career Score points!`);
    } catch { Alert.alert('Apply failed', 'Please try again.'); }
    finally { setApplying(null); }
  };

  const filtered = jobs.filter(j =>
    !search || j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Ionicons name="search" size={18} color={Colors.muted} />
          <TextInput style={s.searchInput} placeholder="Search role, company..."
            placeholderTextColor={Colors.muted} value={search} onChangeText={setSearch} />
        </View>
      </View>
      <Text style={s.count}>{filtered.length} jobs found</Text>
      <FlatList
        data={filtered}
        keyExtractor={j => j.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item: job }) => (
          <View style={s.card}>
            <View style={s.top}>
              <View style={[s.logo, { backgroundColor: companyColor(job.company) }]}>
                <Text style={s.logoTxt}>{job.company.slice(0, 2).toUpperCase()}</Text>
              </View>
              <View style={s.info}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={s.role} numberOfLines={1}>{job.title}</Text>
                  {job.is_exclusive && (
                    <View style={s.excl}><Text style={s.exclTxt}>⭐ Exclusive</Text></View>
                  )}
                </View>
                <Text style={s.company}>{job.company} · {job.city}</Text>
                {job.salary_min && <Text style={s.salary}>₹{job.salary_min}–{job.salary_max}L/yr</Text>}
              </View>
            </View>
            {job.skills && (
              <View style={s.skills}>
                {job.skills.slice(0, 3).map(sk => (
                  <View key={sk} style={s.chip}><Text style={s.chipTxt}>{sk}</Text></View>
                ))}
              </View>
            )}
            <TouchableOpacity style={s.applyBtn} onPress={() => applyJob(job)}
              disabled={applying === job.id}>
              {applying === job.id
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={s.applyTxt}>⚡ Easy Apply</Text>}
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 14, height: 44, borderWidth: 1.5, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: 14, fontFamily: FontFamily.dmSansRegular, color: Colors.ink },
  count: { fontSize: 12, color: Colors.muted, paddingHorizontal: 20, marginBottom: 8, fontFamily: FontFamily.dmSansRegular },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  top: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  logo: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoTxt: { color: '#fff', fontSize: 15, fontFamily: FontFamily.soraSemiBold },
  info: { flex: 1, gap: 2 },
  role: { flex: 1, fontSize: 14.5, fontFamily: FontFamily.soraSemiBold, color: Colors.ink },
  company: { fontSize: 12, fontFamily: FontFamily.dmSansRegular, color: Colors.muted },
  salary: { fontSize: 12.5, fontFamily: FontFamily.soraSemiBold, color: Colors.green },
  excl: { backgroundColor: '#EEF0FF', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  exclTxt: { fontSize: 10, fontFamily: FontFamily.soraSemiBold, color: Colors.brand },
  skills: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  chip: { backgroundColor: Colors.off, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  chipTxt: { fontSize: 11, fontFamily: FontFamily.dmSansMedium, color: Colors.brand },
  applyBtn: { backgroundColor: Colors.green, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  applyTxt: { color: '#fff', fontSize: 13.5, fontFamily: FontFamily.soraSemiBold },
});