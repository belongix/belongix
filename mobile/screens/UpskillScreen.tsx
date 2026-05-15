import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontFamily, Shadow } from '../lib/theme';

const COURSES = [
  { id: '1', track: '💻', title: 'Data Structures & Algorithms', sub: 'For FAANG India interviews', badge: 'HOT', free: true, url: 'https://takeuforward.org' },
  { id: '2', track: '🤖', title: 'Machine Learning Specialisation', sub: 'Andrew Ng — industry gold standard', badge: 'CERT', free: false, url: 'https://coursera.org' },
  { id: '3', track: '☁️', title: 'AWS Solutions Architect', sub: 'Most in-demand cloud cert in India', badge: 'CERT', free: false, url: 'https://aws.amazon.com/certification' },
  { id: '4', track: '📊', title: 'SQL for Data Analytics', sub: 'Used in 95% of Indian data roles', badge: 'FREE', free: true, url: 'https://mode.com/sql-tutorial' },
  { id: '5', track: '⚛️', title: 'React + TypeScript Masterclass', sub: 'Most hired frontend stack', badge: 'HOT', free: false, url: 'https://udemy.com' },
  { id: '6', track: '🐍', title: 'Python for Data Science', sub: 'Start here for any data role', badge: 'FREE', free: true, url: 'https://kaggle.com/learn/python' },
];

const BADGE_COLORS: Record<string, [string, string]> = {
  HOT:  ['#FEF2F2', '#BE123C'],
  FREE: ['#F0FDF4', '#15803D'],
  CERT: ['#FEF9C3', '#A16207'],
};

export default function UpskillScreen() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.title}>Upskilling Hub</Text>
          <Text style={s.sub}>Curated for Indian professionals</Text>
        </View>
        {COURSES.map(course => {
          const [badgeBg, badgeColor] = BADGE_COLORS[course.badge] ?? [Colors.off, Colors.muted];
          return (
            <TouchableOpacity key={course.id} style={s.card}
              onPress={() => Linking.openURL(course.url)} activeOpacity={0.85}>
              <View style={s.row}>
                <Text style={s.track}>{course.track}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <Text style={s.courseTitle} numberOfLines={1}>{course.title}</Text>
                    <View style={[s.badge, { backgroundColor: badgeBg }]}>
                      <Text style={[s.badgeTxt, { color: badgeColor }]}>{course.badge}</Text>
                    </View>
                  </View>
                  <Text style={s.courseSub}>{course.sub}</Text>
                  <Text style={s.provider}>{course.free ? '🆓 FREE' : '💳 Paid'}</Text>
                </View>
                <View style={s.startPill}>
                  <Text style={s.startTxt}>Start →</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14 },
  title: { fontSize: 20, fontFamily: FontFamily.soraExtraBold, color: Colors.ink },
  sub: { fontSize: 13, fontFamily: FontFamily.dmSansRegular, color: Colors.muted, marginTop: 2 },
  card: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  track: { fontSize: 28 },
  courseTitle: { flex: 1, fontSize: 13.5, fontFamily: FontFamily.soraSemiBold, color: Colors.ink },
  courseSub: { fontSize: 11.5, fontFamily: FontFamily.dmSansRegular, color: Colors.muted, marginBottom: 2 },
  provider: { fontSize: 11, fontFamily: FontFamily.dmSansMedium, color: Colors.muted },
  badge: { borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  badgeTxt: { fontSize: 9.5, fontFamily: FontFamily.soraSemiBold },
  startPill: { backgroundColor: Colors.off, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginLeft: 8 },
  startTxt: { fontSize: 12, fontFamily: FontFamily.soraSemiBold, color: Colors.brand },
});