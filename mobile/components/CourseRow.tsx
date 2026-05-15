// components/CourseRow.tsx — Course item with progress pill

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontFamily, Shadow } from '../lib/theme';

export interface CourseItem {
  id: string; track: string; title: string; sub: string;
  badge: string; free: boolean; provider: string; url: string;
}

type Status = 'not_started' | 'in_progress' | 'completed';

interface Props {
  course: CourseItem;
  status: Status;
  progress: number;  // 0-100
  onPress: () => void;
}

const BADGE_COLORS: Record<string, [string, string]> = {
  HOT:  ['#FEF2F2', '#BE123C'],
  FREE: ['#F0FDF4', '#15803D'],
  CERT: ['#FEF9C3', '#A16207'],
  INDIA:['#FFF7ED', '#C2410C'],
};

export default memo(function CourseRow({ course, status, progress, onPress }: Props) {
  const [badgeBg, badgeColor] = BADGE_COLORS[course.badge] ?? [Colors.off, Colors.muted];
  const statusConfig = {
    not_started: { label: 'Start', bg: Colors.off,    color: Colors.muted },
    in_progress:  { label: 'Active', bg: '#FEF9C3',   color: '#A16207' },
    completed:    { label: 'Done',  bg: '#DCFCE7',    color: '#15803D' },
  }[status];

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
      <View style={s.row}>
        <Text style={s.track}>{course.track}</Text>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={s.titleRow}>
            <Text style={s.title} numberOfLines={1}>{course.title}</Text>
            <View style={[s.badge, { backgroundColor: badgeBg }]}>
              <Text style={[s.badgeTxt, { color: badgeColor }]}>{course.badge}</Text>
            </View>
          </View>
          <Text style={s.sub} numberOfLines={1}>{course.sub}</Text>
          <Text style={s.provider}>{course.provider} · {course.free ? 'FREE' : 'Paid'}</Text>
        </View>
        <View style={[s.status, { backgroundColor: statusConfig.bg }]}>
          <Text style={[s.statusTxt, { color: statusConfig.color }]}>{statusConfig.label}</Text>
        </View>
      </View>
      {status === 'in_progress' && (
        <View style={s.bar}>
          <View style={[s.fill, { width: `${progress}%` }]} />
        </View>
      )}
    </TouchableOpacity>
  );
});

const s = StyleSheet.create({
  card: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  row:  { flexDirection: 'row', alignItems: 'center' },
  track:{ fontSize: 28 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  title:{ flex: 1, fontSize: 13.5, fontFamily: FontFamily.soraSemiBold, color: Colors.ink },
  sub:  { fontSize: 11.5, fontFamily: FontFamily.dmSansRegular, color: Colors.muted, marginBottom: 2 },
  provider: { fontSize: 11, fontFamily: FontFamily.dmSansRegular, color: Colors.subtle },
  badge:    { borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  badgeTxt: { fontSize: 9.5, fontFamily: FontFamily.soraSemiBold },
  status:   { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 8 },
  statusTxt:{ fontSize: 11, fontFamily: FontFamily.soraSemiBold },
  bar:  { height: 3, backgroundColor: Colors.border, borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: Colors.brand, borderRadius: 3 },
});
