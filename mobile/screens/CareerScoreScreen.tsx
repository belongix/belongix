/**
 * Belongix — Career Score Screen
 * Large score ring, history chart (SVG), benchmarking, action plan.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Line, Circle, Polyline, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

import { Colors, FontFamily, Spacing, Radius, Shadow, getTier } from '../lib/theme';
import { useAuthStore } from '../store/authStore';
import { supabase, CareerScoreHistory } from '../lib/supabase';
import ScoreRing from '../components/ScoreRing';
import TierBadge from '../components/TierBadge';

const TIERS = [
  { label: 'Expert',   min: 80, color: Colors.green },
  { label: 'Strong',   min: 60, color: Colors.sky   },
  { label: 'Rising',   min: 40, color: Colors.amber  },
  { label: 'Starter',  min: 0,  color: Colors.muted  },
];

const ACTIONS = [
  { icon: '👤', action: 'Complete your profile',   pts: 30, screen: 'Profile',     done: (s: number) => s >= 60 },
  { icon: '✉️', action: 'Verify your email',        pts: 10, screen: 'Profile',     done: (s: number) => s >= 40 },
  { icon: '⚡', action: 'Add 5+ skills',            pts: 10, screen: 'Profile',     done: (s: number) => s >= 55 },
  { icon: '💼', action: 'Apply to a job',           pts: 15, screen: 'Jobs',        done: (s: number) => s >= 65 },
  { icon: '🎓', action: 'Complete a course',        pts: 20, screen: 'Learn',       done: (s: number) => s >= 75 },
  { icon: '🤝', action: 'Book a mentor session',   pts: 20, screen: 'Mentors',     done: (s: number) => s >= 95 },
];

const RANGES = [7, 30, 90, 365];

export default function CareerScoreScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useAuthStore();
  const [history, setHistory]   = useState<CareerScoreHistory[]>([]);
  const [range, setRange]       = useState(30);

  const score    = profile?.career_score ?? 30;
  const tier     = getTier(score);
  const nextTier = TIERS.find((t) => t.min > score);
  const ptsNeeded = nextTier ? nextTier.min - score : 0;
  const role      = profile?.role ?? 'Professional';

  // Simulated percentile: score * 0.75
  const percentile = Math.min(99, Math.round(score * 0.75));

  useEffect(() => {
    loadHistory();
  }, [range]);

  const loadHistory = async () => {
    if (!profile) return;
    try {
      const cutoff = new Date(Date.now() - range * 86400000).toISOString();
      const { data } = await supabase
        .from('career_score_history')
        .select('*')
        .eq('user_id', profile.id)
        .gte('created_at', cutoff)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        setHistory(data as CareerScoreHistory[]);
      } else {
        // Demo data for new accounts
        setHistory(generateDemoHistory(score));
      }
    } catch {
      setHistory(generateDemoHistory(score));
    }
  };

  const generateDemoHistory = (currentScore: number): CareerScoreHistory[] => {
    const now = Date.now();
    const points = Math.min(range, 8);
    return Array.from({ length: points }, (_, i) => ({
      id: i,
      user_id: '',
      score: Math.max(25, currentScore - (points - 1 - i) * 5),
      delta: 5,
      reason: 'Activity',
      created_at: new Date(now - (points - 1 - i) * (range / points) * 86400000).toISOString(),
    }));
  };

  // Build SVG line chart points
  const chartW = 320;
  const chartH = 120;
  const pts = history.length >= 2 ? history : generateDemoHistory(score);
  const minS  = Math.min(...pts.map((h) => h.score)) - 5;
  const maxS  = Math.max(...pts.map((h) => h.score)) + 5;
  const xStep = chartW / (pts.length - 1 || 1);
  const toY   = (s: number) => chartH - ((s - minS) / (maxS - minS || 1)) * chartH;
  const polyPoints = pts.map((h, i) => `${i * xStep},${toY(h.score)}`).join(' ');

  const pendingActions = ACTIONS.filter((a) => !a.done(score)).slice(0, 4);
  const pendingPts     = pendingActions.reduce((s, a) => s + a.pts, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Back ── */}
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={Colors.brand} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <ScoreRing score={score} size={120} strokeWidth={10} />
          <TierBadge score={score} large />
          <Text style={styles.percentileText}>Better than {percentile}% of {role}s on Belongix</Text>
        </View>

        {/* ── Chart ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📈 Score History</Text>
            <View style={styles.rangeRow}>
              {RANGES.map((r) => (
                <TouchableOpacity key={r} style={[styles.rangeBtn, range === r && styles.rangeBtnActive]} onPress={() => setRange(r)}>
                  <Text style={[styles.rangeBtnText, range === r && styles.rangeBtnTextActive]}>
                    {r === 365 ? '1Y' : `${r}D`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <Svg width={chartW} height={chartH + 20} style={{ marginTop: 8 }}>
            <Defs>
              <SvgGrad id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor={Colors.brand} />
                <Stop offset="100%" stopColor={Colors.brand3} />
              </SvgGrad>
            </Defs>
            <Polyline
              points={polyPoints}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {pts.map((h, i) => (
              <Circle key={i} cx={i * xStep} cy={toY(h.score)} r={3} fill={Colors.brand} />
            ))}
          </Svg>
        </View>

        {/* ── Benchmarking ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏆 Industry Benchmark</Text>
          <View style={styles.benchRow}>
            <ScoreRing score={percentile} size={72} label={`${percentile}%`} />
            <View style={{ flex: 1, gap: 6 }}>
              {TIERS.map((t) => {
                const isHere = score >= t.min && score < (TIERS[TIERS.indexOf(t) - 1]?.min ?? 101);
                return (
                  <View key={t.label} style={styles.tierBar}>
                    <Text style={[styles.tierBarLabel, { color: t.color }]}>{t.label}</Text>
                    <View style={styles.tierBarBg}>
                      <View style={[styles.tierBarFill, { width: `${25 + Math.random() * 25}%` as any, backgroundColor: t.color }]} />
                    </View>
                    {isHere && <Text style={styles.youHere}>← You</Text>}
                  </View>
                );
              })}
            </View>
          </View>
          {nextTier && (
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>💡 You need <Text style={styles.tipBold}>{ptsNeeded} more points</Text> to reach <Text style={styles.tipBold}>{nextTier.label}</Text></Text>
            </View>
          )}
        </View>

        {/* ── Action plan ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Boost Your Score</Text>
          {nextTier && (
            <Text style={styles.actionSub}>
              These {pendingActions.length} actions give you <Text style={{ color: Colors.green, fontFamily: FontFamily.dmSansSemi }}>+{pendingPts} pts</Text> toward {nextTier.label}
            </Text>
          )}
          {pendingActions.map((a) => {
            const barPct = Math.round((a.pts / 30) * 100);
            return (
              <TouchableOpacity key={a.action} style={styles.actionRow} onPress={() => navigation.navigate(a.screen)}>
                <View style={styles.actionIcon}><Text style={{ fontSize: 18 }}>{a.icon}</Text></View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionLabel}>{a.action}</Text>
                  <View style={styles.actionBarBg}>
                    <View style={[styles.actionBarFill, { width: `${barPct}%` as any }]} />
                  </View>
                </View>
                <Text style={styles.actionPts}>+{a.pts} pts</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.muted} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: Colors.bg },
  back:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: 4 },
  backText:        { fontFamily: FontFamily.dmSansMed, fontSize: 14, color: Colors.brand },
  hero:            { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  percentileText:  { fontFamily: FontFamily.dmSans, fontSize: 13.5, color: Colors.muted, textAlign: 'center' },
  card:            { marginHorizontal: Spacing.lg, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadow.sm },
  cardHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  cardTitle:       { fontFamily: FontFamily.soraBold, fontSize: 15, color: Colors.ink, marginBottom: Spacing.sm },
  rangeRow:        { flexDirection: 'row', gap: 4 },
  rangeBtn:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.sm, backgroundColor: Colors.off },
  rangeBtnActive:  { backgroundColor: Colors.brand },
  rangeBtnText:    { fontFamily: FontFamily.dmSansMed, fontSize: 12, color: Colors.muted },
  rangeBtnTextActive: { color: Colors.white },
  benchRow:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.md },
  tierBar:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tierBarLabel:    { fontFamily: FontFamily.dmSansSemi, fontSize: 11, width: 52 },
  tierBarBg:       { flex: 1, height: 6, backgroundColor: Colors.off2, borderRadius: 3, overflow: 'hidden' },
  tierBarFill:     { height: '100%', borderRadius: 3 },
  youHere:         { fontFamily: FontFamily.dmSans, fontSize: 10, color: Colors.muted },
  tipCard:         { backgroundColor: Colors.off, borderRadius: Radius.md, padding: Spacing.sm, marginTop: Spacing.sm },
  tipText:         { fontFamily: FontFamily.dmSans, fontSize: 13, color: Colors.ink },
  tipBold:         { fontFamily: FontFamily.dmSansSemi, color: Colors.brand },
  actionSub:       { fontFamily: FontFamily.dmSans, fontSize: 13, color: Colors.muted, marginBottom: Spacing.md },
  actionRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  actionIcon:      { width: 36, height: 36, backgroundColor: Colors.off, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  actionInfo:      { flex: 1 },
  actionLabel:     { fontFamily: FontFamily.dmSansMed, fontSize: 13.5, color: Colors.ink, marginBottom: 5 },
  actionBarBg:     { height: 3, backgroundColor: Colors.off2, borderRadius: 3, overflow: 'hidden' },
  actionBarFill:   { height: '100%', backgroundColor: Colors.brand, borderRadius: 3 },
  actionPts:       { fontFamily: FontFamily.dmSansSemi, fontSize: 12, color: Colors.green },
});
