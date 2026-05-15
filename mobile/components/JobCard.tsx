// components/JobCard.tsx — Full job listing card

import React, { memo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Shadow, companyColor } from '../lib/theme';
import type { Job } from '../lib/supabase';

interface Props { job: Job; applied?: boolean; onApply: (job: Job) => void; }

export default memo(function JobCard({ job, applied, onApply }: Props) {
  const [expanded, setExpanded] = useState(false);
  const skills    = (job.skills ?? []).slice(0, 3);
  const logoColor = companyColor(job.company);

  return (
    <View style={s.card}>
      <View style={s.top}>
        <View style={[s.logo, { backgroundColor: logoColor }]}>
          <Text style={s.logoTxt}>{job.company.slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={s.info}>
          <View style={s.titleRow}>
            <Text style={s.role} numberOfLines={1}>{job.title}</Text>
            {job.is_exclusive && (
              <View style={s.exclusiveBadge}><Text style={s.exclusiveTxt}>⭐ Exclusive</Text></View>
            )}
          </View>
          <Text style={s.company}>{job.company} · {job.city}</Text>
          {job.salary_min && (
            <Text style={s.salary}>₹{job.salary_min}–{job.salary_max ?? '?'}L/yr</Text>
          )}
        </View>
      </View>

      {job.has_referral && (
        <View style={s.referralRow}>
          <Ionicons name="people-outline" size={12} color={Colors.green} />
          <Text style={s.referralTxt}>🤝 Referral Available</Text>
        </View>
      )}

      {skills.length > 0 && (
        <View style={s.skills}>
          {skills.map(sk => (
            <View key={sk} style={s.chip}><Text style={s.chipTxt}>{sk}</Text></View>
          ))}
        </View>
      )}

      {job.description && (
        <>
          <TouchableOpacity onPress={() => setExpanded(e => !e)} style={s.expandRow}>
            <Text style={s.expandTxt}>Company Info {expanded ? '▲' : '▾'}</Text>
          </TouchableOpacity>
          {expanded && (
            <Text style={s.desc} numberOfLines={5}>{job.description}</Text>
          )}
        </>
      )}

      <TouchableOpacity
        style={[s.applyBtn, applied && s.appliedBtn]}
        onPress={() => !applied && onApply(job)}
        activeOpacity={0.85}
      >
        <Ionicons name={applied ? 'checkmark-circle' : 'flash'} size={15} color="#fff" />
        <Text style={s.applyTxt}>{applied ? 'Applied ✓' : '⚡ Easy Apply'}</Text>
      </TouchableOpacity>
    </View>
  );
});

const s = StyleSheet.create({
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  top:  { flexDirection: 'row', gap: 12, marginBottom: 10 },
  logo: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoTxt:  { color: '#fff', fontSize: 15, fontFamily: FontFamily.soraSemiBold },
  info:     { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  role:     { flex: 1, fontSize: 14.5, fontFamily: FontFamily.soraSemiBold, color: Colors.ink },
  company:  { fontSize: 12, fontFamily: FontFamily.dmSansRegular, color: Colors.muted },
  salary:   { fontSize: 12.5, fontFamily: FontFamily.soraSemiBold, color: Colors.green },
  exclusiveBadge: { backgroundColor: '#EEF0FF', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  exclusiveTxt:   { fontSize: 10, fontFamily: FontFamily.soraSemiBold, color: Colors.brand },
  referralRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  referralTxt: { fontSize: 11.5, fontFamily: FontFamily.dmSansMedium, color: Colors.green },
  skills: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 10 },
  chip:   { backgroundColor: Colors.off, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  chipTxt:{ fontSize: 11, fontFamily: FontFamily.dmSansMedium, color: Colors.brand },
  expandRow: { paddingVertical: 4, marginBottom: 4 },
  expandTxt: { fontSize: 12, fontFamily: FontFamily.dmSansMedium, color: Colors.brand },
  desc:      { fontSize: 13, fontFamily: FontFamily.dmSansRegular, color: Colors.muted, lineHeight: 20, marginBottom: 10 },
  applyBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.green, borderRadius: 10, paddingVertical: 10, marginTop: 4 },
  appliedBtn:{ backgroundColor: Colors.muted },
  applyTxt:  { color: '#fff', fontSize: 13.5, fontFamily: FontFamily.soraSemiBold },
});
