/**
 * Belongix — Upskill / Learn Screen
 * Skill gap analyser, course tracks, progress pills, completion flow.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontFamily, Spacing, Radius, Shadow } from '../lib/theme';
import { useAuthStore } from '../store/authStore';
import CourseRow from '../components/CourseRow';

const COURSES = [
  { id: '1', track: '🐍 Python & Data',      title: 'Python for Data Science',       provider: 'Coursera',    free: true,  hot: false, cert: true,  url: 'https://www.coursera.org/learn/python-for-applied-data-science-ai' },
  { id: '2', track: '🐍 Python & Data',      title: 'SQL for Analytics',             provider: 'Mode',        free: true,  hot: true,  cert: false, url: 'https://mode.com/sql-tutorial' },
  { id: '3', track: '⚛️ Full Stack Dev',     title: 'React + Node.js Full Course',   provider: 'The Odin Project', free: true, hot: true, cert: false, url: 'https://www.theodinproject.com' },
  { id: '4', track: '⚛️ Full Stack Dev',     title: 'TypeScript Fundamentals',       provider: 'Scrimba',     free: true,  hot: false, cert: false, url: 'https://scrimba.com/learn/typescript' },
  { id: '5', track: '☁️ Cloud & DevOps',     title: 'AWS Cloud Practitioner',        provider: 'AWS',         free: false, hot: true,  cert: true,  url: 'https://aws.amazon.com/training/' },
  { id: '6', track: '☁️ Cloud & DevOps',     title: 'Docker & Kubernetes',           provider: 'Udemy',       free: false, hot: true,  cert: true,  url: 'https://www.udemy.com' },
  { id: '7', track: '🤖 AI/ML',              title: 'Machine Learning — Andrew Ng',  provider: 'Coursera',    free: true,  hot: true,  cert: true,  url: 'https://www.coursera.org/learn/machine-learning' },
  { id: '8', track: '🤖 AI/ML',              title: 'LLM Engineering',               provider: 'DeepLearning.AI', free: true, hot: true, cert: false, url: 'https://www.deeplearning.ai' },
  { id: '9', track: '🎯 Product Management', title: 'Product Management Basics',     provider: 'Google',      free: true,  hot: false, cert: true,  url: 'https://grow.google/certificates/' },
  { id: '10', track: '📊 System Design',     title: 'System Design Interview Prep',  provider: 'ByteByteGo',  free: false, hot: true,  cert: false, url: 'https://bytebytego.com' },
  { id: '11', track: '💼 Soft Skills',       title: 'Public Speaking & Comm.',       provider: 'Coursera',    free: true,  hot: false, cert: true,  url: 'https://www.coursera.org' },
  { id: '12', track: '💰 Finance & BFSI',    title: 'Financial Modeling',            provider: 'CFI',         free: false, hot: false, cert: true,  url: 'https://corporatefinanceinstitute.com' },
];

const FILTERS = ['All', 'Trending', 'Free', 'Beginner', 'Certifications'];

export default function UpskillScreen() {
  const { profile, updateProfile } = useAuthStore();
  const [filter, setFilter]     = useState('All');
  const [progress, setProgress] = useState<Record<string, 'not_started' | 'in_progress' | 'completed'>>({});

  const filtered = COURSES.filter((c) => {
    if (filter === 'Free')    return c.free;
    if (filter === 'Trending') return c.hot;
    if (filter === 'Certifications') return c.cert;
    return true;
  });

  const handleCoursePress = async (courseId: string, url: string) => {
    const status = progress[courseId] ?? 'not_started';
    if (status === 'in_progress') {
      Alert.alert(
        'Mark Complete?',
        "Did you finish this course? Mark it complete to earn +20 career score points! 🎓",
        [
          { text: 'Not yet', onPress: () => Linking.openURL(url) },
          {
            text: 'Yes, mark complete! 🎉',
            onPress: async () => {
              setProgress((p) => ({ ...p, [courseId]: 'completed' }));
              const newScore = Math.min(100, (profile?.career_score ?? 30) + 20);
              await updateProfile({ career_score: newScore });
              Alert.alert('🎉 Congratulations!', `Course completed! +20 points earned. Score: ${newScore}/100`);
            },
          },
        ]
      );
    } else if (status === 'not_started') {
      setProgress((p) => ({ ...p, [courseId]: 'in_progress' }));
      await Linking.openURL(url);
    } else {
      await Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Upskilling Hub 🎓</Text>
        <Text style={styles.sub}>48+ curated courses for Indian professionals</Text>

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.active]} onPress={() => setFilter(f)}>
              <Text style={[styles.filterText, filter === f && styles.activeText]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Courses */}
        {filtered.map((course) => (
          <CourseRow
            key={course.id}
            course={course}
            status={progress[course.id] ?? 'not_started'}
            onPress={() => handleCoursePress(course.id, course.url)}
          />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.bg },
  header:     { fontFamily: FontFamily.soraBlack, fontSize: 22, color: Colors.ink, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, marginBottom: 2 },
  sub:        { fontFamily: FontFamily.dmSans, fontSize: 13, color: Colors.muted, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  filterRow:  { paddingHorizontal: Spacing.lg, gap: 8, marginBottom: Spacing.md },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.white, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border },
  active:     { backgroundColor: Colors.brand, borderColor: Colors.brand },
  filterText: { fontFamily: FontFamily.dmSansMed, fontSize: 13, color: Colors.muted },
  activeText: { color: Colors.white },
});
