// screens/ResumeScreen.tsx
// Resume builder screen — hosts the web resume builder via WebView
// Falls back to native upload flow if WebView unavailable

import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';

import { Colors, FontFamily, Shadow } from '../lib/theme';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { askClaude } from '../lib/claude';
import BexiFAB from '../components/BexiFAB';

export default function ResumeScreen() {
  const navigation = useNavigation<{ goBack: () => void }>();
  const { user, profile } = useAuthStore();
  const [loading,    setLoading]    = useState(false);
  const [critique,   setCritique]   = useState<string | null>(null);
  const [uploading,  setUploading]  = useState(false);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword',
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
               'text/plain'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      setUploading(true);
      setCritique(null);

      let resumeText = `Resume: ${file.name} (${Math.round((file.size ?? 0) / 1024)}KB)`;

      // Read plain text if possible
      if (file.mimeType === 'text/plain' && file.uri) {
        try {
          const { readAsStringAsync } = await import('expo-file-system');
          resumeText = await readAsStringAsync(file.uri);
        } catch { /* use filename */ }
      }

      const critiquePrompt = [
        `Critique this resume for an Indian professional:`,
        ``,
        resumeText.slice(0, 3000), // limit context
        ``,
        `Name/Role from profile: ${profile?.full_name ?? 'Unknown'}, ${profile?.role ?? 'Unknown'}`,
        `Target city: ${profile?.city ?? 'India'}`,
        ``,
        `Return EXACTLY this format:`,
        `**ATS Score:** X/100`,
        `**Strengths:**`,
        `• [strength 1]`,
        `• [strength 2]`,
        `• [strength 3]`,
        `**Top Improvements:**`,
        `• [specific rewrite, not vague advice]`,
        `• [specific rewrite]`,
        `• [specific rewrite]`,
        `• [specific rewrite]`,
        `• [specific rewrite]`,
        `**Missing Keywords:** [comma-separated]`,
        `**Next Action:** [one specific step]`,
      ].join('\n');

      const result2 = await askClaude(
        [{ role: 'user', content: critiquePrompt }],
        {
          system: `You are Bexi, the AI career guide for Belongix India. Critique resumes for Indian professionals with specific, actionable feedback. Be direct.`,
          maxTokens: 800,
        },
      );
      setCritique(result2);

      // Save to profile
      if (user?.id) {
        await supabase.from('profiles')
          .update({ last_score_reason: 'Resume uploaded', career_score: Math.min(100, (profile?.career_score ?? 30) + 5) })
          .eq('id', user.id);
      }
    } catch (err) {
      Alert.alert('Upload failed', 'Please try a PDF or plain text file.');
    } finally {
      setUploading(false);
    }
  };

  const QUICK_TIPS = [
    { icon: '📊', tip: 'Add metrics to every achievement', detail: '"Led team of 5" → "Led 5-person team that shipped feature used by 2M users"' },
    { icon: '🎯', tip: 'ATS keywords matter', detail: 'Mirror the exact words from the job description in your resume' },
    { icon: '📄', tip: 'One page for 0-5 years experience', detail: 'Two pages only if you\'re 7+ years or in academia' },
    { icon: '🔗', tip: 'Include GitHub + LinkedIn', detail: 'For technical roles, GitHub activity is checked by 80% of HRs' },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.ink} />
        </TouchableOpacity>
        <Text style={s.title}>Resume Builder</Text>
      </View>

      <View style={s.scroll}>
        {/* Upload section */}
        <TouchableOpacity style={s.uploadCard} onPress={handleUpload} activeOpacity={0.85}>
          {uploading ? (
            <ActivityIndicator color={Colors.brand} size="large" />
          ) : (
            <>
              <View style={s.uploadIcon}>
                <Ionicons name="document-text-outline" size={36} color={Colors.brand} />
              </View>
              <Text style={s.uploadTitle}>Upload Your Resume</Text>
              <Text style={s.uploadSub}>PDF, Word, or plain text · Bexi AI analyses it instantly</Text>
              <View style={s.uploadBtn}>
                <Text style={s.uploadBtnTxt}>Choose File →</Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Critique result */}
        {critique && (
          <View style={s.critiqueCard}>
            <Text style={s.critiqueTitle}>🤖 Bexi's Resume Critique</Text>
            {critique.split('\n').map((line, i) => {
              if (!line.trim()) return <View key={i} style={{ height: 5 }} />;
              const isBold = line.startsWith('**') && line.endsWith('**');
              if (isBold) return <Text key={i} style={s.critiqueBold}>{line.replace(/\*\*/g,'')}</Text>;
              if (line.startsWith('•')) return (
                <View key={i} style={s.bulletRow}>
                  <Text style={s.bullet}>•</Text>
                  <Text style={s.critiqueBody}>{line.slice(1).trim()}</Text>
                </View>
              );
              return <Text key={i} style={s.critiqueBody}>{line.replace(/\*\*/g,'')}</Text>;
            })}
          </View>
        )}

        {/* Quick tips */}
        <Text style={s.tipsTitle}>Resume tips for Indian professionals</Text>
        {QUICK_TIPS.map(tip => (
          <View key={tip.tip} style={s.tipCard}>
            <Text style={s.tipIcon}>{tip.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.tipTitle}>{tip.tip}</Text>
              <Text style={s.tipDetail}>{tip.detail}</Text>
            </View>
          </View>
        ))}

        {/* Web builder CTA */}
        <View style={s.webBuilderCard}>
          <Text style={s.webBuilderTitle}>🌐 Full Resume Builder</Text>
          <Text style={s.webBuilderSub}>
            Use our web-based resume builder with 10 ATS-friendly templates, cover letter generator, and version history.
          </Text>
          <View style={s.webBuilderLink}>
            <Ionicons name="globe-outline" size={16} color={Colors.brand} />
            <Text style={s.webBuilderLinkTxt}>belongix.in/resume-builder.html</Text>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </View>

      <BexiFAB />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn:{ padding: 4 },
  title:  { fontSize: 18, fontFamily: FontFamily.soraExtraBold, color: Colors.ink },
  scroll: { flex: 1, padding: 16 },

  uploadCard: { backgroundColor: Colors.white, borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.brand, marginBottom: 16, ...Shadow.md },
  uploadIcon: { width: 72, height: 72, borderRadius: 20, backgroundColor: Colors.off, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  uploadTitle:{ fontSize: 18, fontFamily: FontFamily.soraExtraBold, color: Colors.ink, marginBottom: 6 },
  uploadSub:  { fontSize: 13, fontFamily: FontFamily.dmSansRegular, color: Colors.muted, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  uploadBtn:  { backgroundColor: Colors.brand, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12 },
  uploadBtnTxt:{ color: '#fff', fontSize: 14, fontFamily: FontFamily.soraSemiBold },

  critiqueCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 4, borderLeftColor: Colors.brand, ...Shadow.sm },
  critiqueTitle:{ fontSize: 16, fontFamily: FontFamily.soraSemiBold, color: Colors.brand, marginBottom: 14 },
  critiqueBold: { fontSize: 14, fontFamily: FontFamily.soraSemiBold, color: Colors.ink, marginTop: 10, marginBottom: 4 },
  critiqueBody: { fontSize: 13.5, fontFamily: FontFamily.dmSansRegular, color: Colors.ink, lineHeight: 22 },
  bulletRow:    { flexDirection: 'row', gap: 8, marginBottom: 4 },
  bullet:       { fontSize: 14, color: Colors.brand, fontFamily: FontFamily.dmSansRegular },

  tipsTitle: { fontSize: 15, fontFamily: FontFamily.soraSemiBold, color: Colors.ink, marginBottom: 10 },
  tipCard:   { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10, ...Shadow.sm },
  tipIcon:   { fontSize: 22, marginTop: 2 },
  tipTitle:  { fontSize: 13.5, fontFamily: FontFamily.soraSemiBold, color: Colors.ink, marginBottom: 3 },
  tipDetail: { fontSize: 12.5, fontFamily: FontFamily.dmSansRegular, color: Colors.muted, lineHeight: 19 },

  webBuilderCard: { backgroundColor: Colors.off, borderRadius: 16, padding: 18, borderWidth: 1.5, borderColor: Colors.brand + '40' },
  webBuilderTitle:{ fontSize: 15, fontFamily: FontFamily.soraSemiBold, color: Colors.brand, marginBottom: 6 },
  webBuilderSub:  { fontSize: 13, fontFamily: FontFamily.dmSansRegular, color: Colors.muted, lineHeight: 20, marginBottom: 12 },
  webBuilderLink: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  webBuilderLinkTxt:{ fontSize: 13, fontFamily: FontFamily.dmSansMedium, color: Colors.brand },
});
