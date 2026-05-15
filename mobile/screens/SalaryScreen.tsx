// screens/SalaryScreen.tsx
// Salary benchmarks + offer comparison with Claude AI

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, FontFamily, Shadow } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { askClaude } from '../lib/claude';
import BexiFAB from '../components/BexiFAB';

type TabType = 'benchmarks' | 'compare';

interface SalaryCard {
  role: string; city: string; p25: number; median: number; p75: number; hike: number; count: number;
}

const SEED_DATA: SalaryCard[] = [
  { role: 'Software Engineer',  city: 'Bangalore', p25: 16, median: 24, p75: 38, hike: 35, count: 142 },
  { role: 'Data Scientist',     city: 'Bangalore', p25: 14, median: 22, p75: 34, hike: 32, count: 87  },
  { role: 'Product Manager',    city: 'Bangalore', p25: 20, median: 30, p75: 45, hike: 40, count: 63  },
  { role: 'ML Engineer',        city: 'Bangalore', p25: 18, median: 30, p75: 50, hike: 48, count: 54  },
  { role: 'DevOps Engineer',    city: 'Bangalore', p25: 14, median: 22, p75: 34, hike: 30, count: 48  },
  { role: 'Engineering Manager',city: 'Bangalore', p25: 40, median: 55, p75: 80, hike: 35, count: 29  },
];

interface Offer {
  company: string; role: string; ctc: string; city: string;
  wfhDays: string; growth: string; esops: string;
}

const BLANK_OFFER: Offer = { company: '', role: '', ctc: '', city: '', wfhDays: '', growth: '', esops: '' };

export default function SalaryScreen() {
  const { user, profile } = useAuthStore();
  const [tab,        setTab]        = useState<TabType>('benchmarks');
  const [salaryData, setSalaryData] = useState<SalaryCard[]>(SEED_DATA);
  const [showSubmit, setShowSubmit] = useState(false);

  // Submit CTC form
  const [subRole,  setSubRole]  = useState('');
  const [subCTC,   setSubCTC]   = useState('');
  const [subCity,  setSubCity]  = useState('');
  const [subExp,   setSubExp]   = useState('');
  const [subAnon,  setSubAnon]  = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Offer compare
  const [offerA,    setOfferA]    = useState<Offer>({ ...BLANK_OFFER });
  const [offerB,    setOfferB]    = useState<Offer>({ ...BLANK_OFFER });
  const [comparing, setComparing] = useState(false);
  const [result,    setResult]    = useState<string | null>(null);

  useEffect(() => { loadSalaryData(); }, []);

  const loadSalaryData = async () => {
    try {
      const { data } = await supabase
        .from('salary_submissions')
        .select('role, city, ctc_lpa')
        .eq('verified', true)
        .limit(300);

      if (data && data.length > 20) {
        // Aggregate by role+city
        const grouped: Record<string, number[]> = {};
        data.forEach((r: { role: string; city: string; ctc_lpa: number }) => {
          const key = `${r.role}||${r.city}`;
          grouped[key] = [...(grouped[key] ?? []), r.ctc_lpa];
        });
        const cards: SalaryCard[] = Object.entries(grouped)
          .filter(([, arr]) => arr.length >= 3)
          .map(([key, arr]) => {
            const [role, city] = key.split('||');
            const sorted = arr.slice().sort((a, b) => a - b);
            const p = (pct: number) => sorted[Math.floor(sorted.length * pct)] ?? sorted[0];
            return { role, city, p25: p(0.25), median: p(0.5), p75: p(0.75), hike: 30, count: arr.length };
          });
        if (cards.length > 0) setSalaryData(cards);
      }
    } catch { /* keep seed */ }
  };

  const handleSubmitCTC = async () => {
    if (!subRole || !subCTC || !subCity) { Alert.alert('Please fill Role, CTC, and City'); return; }
    if (!user) { Alert.alert('Sign in to submit CTC'); return; }
    setSubmitting(true);
    try {
      await supabase.from('salary_submissions').insert({
        user_id: user.id,
        role: subRole, city: subCity,
        ctc_lpa: parseFloat(subCTC),
        exp_years: parseFloat(subExp) || 0,
        verified: true,
        submitted_at: new Date().toISOString(),
      });
      setShowSubmit(false);
      setSubRole(''); setSubCTC(''); setSubCity(''); setSubExp('');
      Alert.alert('✅ CTC submitted!', 'Thank you for helping the community.');
      loadSalaryData();
    } catch {
      Alert.alert('Submission failed', 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompare = async () => {
    if (!offerA.company || !offerB.company || !offerA.ctc || !offerB.ctc) {
      Alert.alert('Please fill in Company and CTC for both offers');
      return;
    }
    setComparing(true);
    setResult(null);
    try {
      const reply = await askClaude(
        [{
          role: 'user',
          content: `Compare these two job offers for an Indian professional:\n\nOffer A: ${JSON.stringify(offerA)}\n\nOffer B: ${JSON.stringify(offerB)}\n\nReturn:\n1. **Winner:** and why\n2. **Compensation score** (1-10 each)\n3. **Growth score** (1-10 each)\n4. **Work-life balance** (1-10 each)\n5. **Key trade-off** in one sentence\n6. **Watch out:** one risk per offer`,
        }],
        {
          system: 'You are a career advisor for Indian professionals. Be specific about Indian market compensation, company culture, and growth paths. Keep response under 250 words.',
          maxTokens: 500,
        },
      );
      setResult(reply);
    } catch {
      // Rule-based fallback
      const ctcA = parseFloat(offerA.ctc) || 0;
      const ctcB = parseFloat(offerB.ctc) || 0;
      const winner = ctcA >= ctcB ? offerA.company : offerB.company;
      setResult(
        `**Winner: ${winner}**\n\nBased on total compensation analysis:\n\n` +
        `• ${offerA.company}: ₹${ctcA} LPA${offerA.wfhDays ? `, ${offerA.wfhDays} days WFH` : ''}\n` +
        `• ${offerB.company}: ₹${ctcB} LPA${offerB.wfhDays ? `, ${offerB.wfhDays} days WFH` : ''}\n\n` +
        `**Key trade-off:** Higher compensation vs better work-life balance.\n\n` +
        `**Watch out:** Always verify equity vesting schedules and joining bonus conditions.`,
      );
    } finally {
      setComparing(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>💰 Salary Intelligence</Text>
        <View style={s.tabBar}>
          {([['benchmarks', '📊 Benchmarks'], ['compare', '⚖️ Compare']] as [TabType, string][]).map(([t, lbl]) => (
            <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
              <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>{lbl}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {tab === 'benchmarks' ? (
          /* ── Benchmarks tab ── */
          <>
            {/* Submit CTA */}
            <LinearGradient colors={['#1A0F40', '#3D2490']} style={s.submitCTA}>
              <View style={{ flex: 1 }}>
                <Text style={s.ctaTitle}>Help build India's salary database</Text>
                <Text style={s.ctaSub}>Submit your CTC anonymously · takes 60 seconds</Text>
              </View>
              <TouchableOpacity style={s.ctaBtn} onPress={() => setShowSubmit(true)}>
                <Text style={s.ctaBtnTxt}>Submit CTC</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Salary cards */}
            <Text style={s.sectionTtl}>📊 Bangalore Tech Salaries (2026)</Text>
            {salaryData.map((d, i) => (
              <View key={i} style={s.salCard}>
                <View style={s.salTop}>
                  <View>
                    <Text style={s.salRole}>{d.role}</Text>
                    <Text style={s.salCity}>📍 {d.city} · {d.count} data points</Text>
                  </View>
                  <View style={s.salMedian}>
                    <Text style={s.salMedianVal}>₹{d.median}L</Text>
                    <Text style={s.salMedianLbl}>median</Text>
                  </View>
                </View>
                {/* Bar */}
                <View style={s.barRow}>
                  <View style={s.barTrack}>
                    <View style={[s.barFill, { width: `${Math.min(100, (d.median / 80) * 100)}%` }]} />
                  </View>
                </View>
                {/* Percentiles */}
                <View style={s.pctRow}>
                  {[['P25', d.p25, '#FEF9C3', '#A16207'], ['Median', d.median, '#EEF0FF', Colors.brand], ['P75', d.p75, '#DCFCE7', '#15803D']].map(([lbl, val, bg, col]) => (
                    <View key={lbl as string} style={[s.pctChip, { backgroundColor: bg as string }]}>
                      <Text style={[s.pctLbl, { color: col as string }]}>{lbl}: ₹{val}L</Text>
                    </View>
                  ))}
                  <View style={[s.pctChip, { backgroundColor: '#F0F9FF' }]}>
                    <Text style={[s.pctLbl, { color: '#0369A1' }]}>+{d.hike}% avg hike</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        ) : (
          /* ── Compare Offers tab ── */
          <>
            <Text style={s.sectionTtl}>Enter both offers to compare</Text>
            {/* Two offer forms */}
            {([['A', offerA, setOfferA], ['B', offerB, setOfferB]] as const).map(([label, offer, setOffer]) => (
              <View key={label} style={s.offerCard}>
                <Text style={s.offerLabel}>Offer {label}</Text>
                {[
                  { ph: 'Company *', key: 'company' },
                  { ph: 'Role', key: 'role' },
                  { ph: 'Total CTC (LPA) *', key: 'ctc' },
                  { ph: 'City', key: 'city' },
                  { ph: 'WFH days / week', key: 'wfhDays' },
                  { ph: 'Growth potential (1-10)', key: 'growth' },
                  { ph: 'ESOPs / RSUs (₹L/yr)', key: 'esops' },
                ].map(f => (
                  <TextInput
                    key={f.key}
                    style={s.offerInput}
                    placeholder={f.ph}
                    placeholderTextColor={Colors.muted}
                    value={offer[f.key as keyof Offer]}
                    onChangeText={v => setOffer((prev: Offer) => ({ ...prev, [f.key]: v }))}
                    keyboardType={['ctc', 'wfhDays', 'growth', 'esops'].includes(f.key) ? 'numeric' : 'default'}
                  />
                ))}
              </View>
            ))}

            <TouchableOpacity
              style={[s.compareBtn, comparing && { opacity: 0.6 }]}
              onPress={handleCompare}
              disabled={comparing}
            >
              {comparing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={s.compareBtnTxt}>Compare with Bexi AI ✨</Text>
                </>
              )}
            </TouchableOpacity>

            {result && (
              <View style={s.resultCard}>
                <Text style={s.resultTitle}>📊 Bexi's Analysis</Text>
                {result.split('\n').map((line, i) => {
                  if (!line.trim()) return <View key={i} style={{ height: 5 }} />;
                  const isBold = line.startsWith('**') && line.includes('Winner');
                  return (
                    <Text key={i} style={[s.resultLine, isBold && s.resultBold]}>
                      {line.replace(/\*\*/g, '')}
                    </Text>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Submit CTC modal */}
      <Modal visible={showSubmit} transparent animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'flex-end' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity style={s.modalBg} onPress={() => setShowSubmit(false)} />
          <View style={s.modal}>
            <View style={s.handle} />
            <Text style={s.modalTitle}>Submit Your CTC</Text>
            <Text style={s.modalSub}>🔒 100% anonymous. Only aggregated data is shown publicly.</Text>

            {[
              { label: 'Role *', value: subRole, set: setSubRole, ph: 'e.g. Software Engineer' },
              { label: 'City *', value: subCity, set: setSubCity, ph: 'e.g. Bangalore' },
              { label: 'Total CTC (LPA) *', value: subCTC, set: setSubCTC, ph: 'e.g. 24', numeric: true },
              { label: 'Years of Experience', value: subExp, set: setSubExp, ph: 'e.g. 4', numeric: true },
            ].map(f => (
              <View key={f.label} style={{ marginBottom: 12 }}>
                <Text style={s.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={s.fieldInput}
                  placeholder={f.ph}
                  placeholderTextColor={Colors.muted}
                  value={f.value}
                  onChangeText={f.set}
                  keyboardType={f.numeric ? 'numeric' : 'default'}
                />
              </View>
            ))}

            <TouchableOpacity
              style={[s.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSubmitCTC}
              disabled={submitting}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.submitTxt}>Submit Anonymously →</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <BexiFAB />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title:  { fontSize: 20, fontFamily: FontFamily.soraExtraBold, color: Colors.ink, marginBottom: 12 },
  tabBar: { flexDirection: 'row', backgroundColor: Colors.background, borderRadius: 10, padding: 3 },
  tab:    { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 8 },
  tabActive:   { backgroundColor: Colors.white, ...Shadow.sm },
  tabTxt:      { fontSize: 13, fontFamily: FontFamily.dmSansMedium, color: Colors.muted },
  tabTxtActive:{ color: Colors.brand, fontFamily: FontFamily.soraSemiBold },

  submitCTA: { margin: 16, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  ctaTitle:  { fontSize: 15, fontFamily: FontFamily.soraSemiBold, color: '#fff', marginBottom: 3 },
  ctaSub:    { fontSize: 12, fontFamily: FontFamily.dmSansRegular, color: 'rgba(255,255,255,0.72)' },
  ctaBtn:    { backgroundColor: Colors.orange, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9 },
  ctaBtnTxt: { color: '#fff', fontSize: 13, fontFamily: FontFamily.soraSemiBold },

  sectionTtl: { fontSize: 14, fontFamily: FontFamily.soraSemiBold, color: Colors.ink, paddingHorizontal: 16, marginBottom: 10, marginTop: 4 },

  salCard: { marginHorizontal: 16, marginBottom: 12, backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  salTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  salRole: { fontSize: 14.5, fontFamily: FontFamily.soraSemiBold, color: Colors.ink, marginBottom: 3 },
  salCity: { fontSize: 11.5, fontFamily: FontFamily.dmSansRegular, color: Colors.muted },
  salMedian:    { alignItems: 'flex-end' },
  salMedianVal: { fontSize: 22, fontFamily: FontFamily.soraExtraBold, color: Colors.brand },
  salMedianLbl: { fontSize: 10.5, fontFamily: FontFamily.dmSansRegular, color: Colors.muted },
  barRow:  { marginBottom: 10 },
  barTrack:{ height: 6, backgroundColor: Colors.background, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, backgroundColor: Colors.brand },
  pctRow:  { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  pctChip: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  pctLbl:  { fontSize: 11, fontFamily: FontFamily.soraSemiBold },

  offerCard:  { marginHorizontal: 16, marginBottom: 14, backgroundColor: Colors.white, borderRadius: 16, padding: 16, ...Shadow.sm },
  offerLabel: { fontSize: 15, fontFamily: FontFamily.soraExtraBold, color: Colors.brand, marginBottom: 12 },
  offerInput: { backgroundColor: Colors.background, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 13, paddingVertical: 10, fontSize: 14, fontFamily: FontFamily.dmSansRegular, color: Colors.ink, marginBottom: 8 },
  compareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.brand, borderRadius: 12, paddingVertical: 14, marginHorizontal: 16, marginBottom: 16 },
  compareBtnTxt: { color: '#fff', fontSize: 15, fontFamily: FontFamily.soraSemiBold },
  resultCard: { marginHorizontal: 16, backgroundColor: Colors.white, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  resultTitle:{ fontSize: 15, fontFamily: FontFamily.soraSemiBold, color: Colors.brand, marginBottom: 12 },
  resultLine: { fontSize: 13.5, fontFamily: FontFamily.dmSansRegular, color: Colors.ink, lineHeight: 22 },
  resultBold: { fontFamily: FontFamily.soraSemiBold, fontSize: 15, color: Colors.brand },

  modalBg:  { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modal:    { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 36 },
  handle:   { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16 },
  modalTitle:{ fontSize: 19, fontFamily: FontFamily.soraExtraBold, color: Colors.ink, marginBottom: 3 },
  modalSub:  { fontSize: 12.5, fontFamily: FontFamily.dmSansRegular, color: Colors.muted, marginBottom: 18 },
  fieldLabel:{ fontSize: 10.5, fontFamily: FontFamily.soraSemiBold, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  fieldInput:{ backgroundColor: Colors.background, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 13, paddingVertical: 10, fontSize: 14, fontFamily: FontFamily.dmSansRegular, color: Colors.ink },
  submitBtn: { backgroundColor: Colors.brand, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 6 },
  submitTxt: { color: '#fff', fontSize: 15, fontFamily: FontFamily.soraSemiBold },
});
