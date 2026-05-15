/**
 * Belongix — Profile Screen
 * Editable profile with avatar, career score, sections, and settings.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Switch, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, FontFamily, Spacing, Radius, Shadow, getTier, initials, companyColor } from '../lib/theme';
import { useAuthStore } from '../store/authStore';
import ScoreRing from '../components/ScoreRing';
import TierBadge from '../components/TierBadge';

interface EditField { label: string; key: keyof EditState; placeholder: string; multiline?: boolean; }

interface EditState {
  full_name:     string;
  role:          string;
  company:       string;
  city:          string;
  bio:           string;
  skills:        string;
  experience:    string;
  notice_period: string;
  linkedin_url:  string;
  phone:         string;
}

const SECTIONS: { title: string; fields: EditField[] }[] = [
  {
    title: 'Basic Info',
    fields: [
      { label: 'Full Name',     key: 'full_name',     placeholder: 'Arjun Sharma' },
      { label: 'Current Role',  key: 'role',           placeholder: 'Software Engineer' },
      { label: 'Company',       key: 'company',        placeholder: 'Google' },
      { label: 'City',          key: 'city',           placeholder: 'Bangalore' },
      { label: 'Phone',         key: 'phone',          placeholder: '+91 98765 43210' },
    ],
  },
  {
    title: 'Career Summary',
    fields: [
      { label: 'Bio / Summary', key: 'bio',            placeholder: 'Briefly describe your experience and goals...', multiline: true },
      { label: 'Skills',        key: 'skills',         placeholder: 'Python, React, AWS, SQL (comma separated)' },
    ],
  },
  {
    title: 'Work Details',
    fields: [
      { label: 'Experience',    key: 'experience',     placeholder: '3-5 yrs' },
      { label: 'Notice Period', key: 'notice_period',  placeholder: '30 days' },
      { label: 'LinkedIn URL',  key: 'linkedin_url',   placeholder: 'https://linkedin.com/in/yourname' },
    ],
  },
];

export default function ProfileScreen() {
  const { profile, user, updateProfile, signOut } = useAuthStore();

  const [editing, setEditing] = useState<string | null>(null);
  const [openToWork, setOpenToWork] = useState(profile?.open_to_work ?? false);
  const [editState, setEditState] = useState<EditState>({
    full_name:     profile?.full_name     ?? '',
    role:          profile?.role          ?? '',
    company:       profile?.company       ?? '',
    city:          profile?.city          ?? '',
    bio:           profile?.bio           ?? '',
    skills:        profile?.skills        ?? '',
    experience:    profile?.experience    ?? '',
    notice_period: profile?.notice_period ?? '',
    linkedin_url:  profile?.linkedin_url  ?? '',
    phone:         profile?.phone         ?? '',
  });

  const score    = profile?.career_score ?? 30;
  const tier     = getTier(score);
  const userName = profile?.full_name ?? user?.email ?? 'User';
  const avatarBg = companyColor(userName);
  const avatarTxt = initials(userName);

  // Completeness %
  const completedFields = Object.values(editState).filter(Boolean).length;
  const completeness    = Math.round((completedFields / Object.keys(editState).length) * 100);

  const saveSection = async () => {
    await updateProfile(editState);
    setEditing(null);
    Alert.alert('✅ Saved', 'Your profile has been updated.');
  };

  const handleShareProfile = async () => {
    const username = user?.email?.split('@')[0] ?? 'user';
    await Share.share({
      message: `Check out my Belongix profile: https://belongix.in/u/${username}`,
    });
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Banner + Avatar ── */}
        <LinearGradient colors={[Colors.brand, Colors.brand2]} style={styles.banner}>
          <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
            <Text style={styles.avatarText}>{avatarTxt}</Text>
          </View>
          {openToWork && (
            <View style={styles.openBadge}>
              <Text style={styles.openBadgeText}>✅ Open to Work</Text>
            </View>
          )}
        </LinearGradient>

        {/* ── Profile header ── */}
        <View style={styles.profileHead}>
          <View style={styles.profileLeft}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileRole}>{profile?.role ?? 'Add your role'}</Text>
            <Text style={styles.profileCompany}>{profile?.company ?? ''} {profile?.city ? `· ${profile.city}` : ''}</Text>
          </View>
          <ScoreRing score={score} size={64} />
        </View>

        {/* ── Tier + percentile ── */}
        <View style={styles.tierRow}>
          <TierBadge score={score} />
          <Text style={styles.percentile}>Top {100 - Math.round(score * 0.7)}% in your field</Text>
        </View>

        {/* ── Completeness bar ── */}
        <View style={styles.completeCard}>
          <View style={styles.completeRow}>
            <Text style={styles.completeLabel}>Profile Completeness</Text>
            <Text style={styles.completePct}>{completeness}%</Text>
          </View>
          <View style={styles.completeBarBg}>
            <View style={[styles.completeBarFill, { width: `${completeness}%` as any }]} />
          </View>
        </View>

        {/* ── Open to work toggle ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Open to Work</Text>
            <Switch
              value={openToWork}
              onValueChange={async (v) => {
                setOpenToWork(v);
                await updateProfile({ open_to_work: v });
              }}
              trackColor={{ true: Colors.green, false: Colors.border }}
              thumbColor={Colors.white}
            />
          </View>
          <Text style={styles.sectionHint}>Recruiters can see you're looking for opportunities.</Text>
        </View>

        {/* ── Editable sections ── */}
        {SECTIONS.map((sec) => (
          <View key={sec.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{sec.title}</Text>
              <TouchableOpacity onPress={() => setEditing(editing === sec.title ? null : sec.title)}>
                <Text style={styles.editBtn}>{editing === sec.title ? 'Cancel' : '+ Edit'}</Text>
              </TouchableOpacity>
            </View>

            {sec.fields.map((field) => (
              <View key={field.key} style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                {editing === sec.title ? (
                  <TextInput
                    style={[styles.fieldInput, field.multiline && styles.fieldInputMulti]}
                    value={editState[field.key]}
                    onChangeText={(v) => setEditState((s) => ({ ...s, [field.key]: v }))}
                    placeholder={field.placeholder}
                    placeholderTextColor={Colors.muted}
                    multiline={field.multiline}
                    numberOfLines={field.multiline ? 3 : 1}
                  />
                ) : (
                  <Text style={styles.fieldValue}>
                    {editState[field.key] || <Text style={styles.fieldEmpty}>{field.placeholder}</Text>}
                  </Text>
                )}
              </View>
            ))}

            {editing === sec.title && (
              <TouchableOpacity style={styles.saveBtn} onPress={saveSection}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* ── Share + Settings ── */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.settingRow} onPress={handleShareProfile}>
            <Ionicons name="share-social-outline" size={20} color={Colors.brand} />
            <Text style={styles.settingText}>Share My Profile</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.muted} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <Ionicons name="gift-outline" size={20} color={Colors.brand} />
            <Text style={styles.settingText}>Referral Program</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.muted} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <Ionicons name="rocket-outline" size={20} color={Colors.orange} />
            <Text style={[styles.settingText, { color: Colors.orange }]}>Upgrade to Pro</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.muted} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color={Colors.red} />
            <Text style={[styles.settingText, { color: Colors.red }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: Colors.bg },
  banner:             { height: 120, justifyContent: 'flex-end', alignItems: 'center' },
  avatar:             { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.white, marginBottom: -40 },
  avatarText:         { fontFamily: FontFamily.soraBlack, fontSize: 28, color: Colors.white },
  openBadge:          { position: 'absolute', top: 12, right: 12, backgroundColor: Colors.green, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 4 },
  openBadgeText:      { fontFamily: FontFamily.dmSansSemi, fontSize: 11, color: Colors.white },
  profileHead:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: Spacing.lg, paddingTop: 48, paddingBottom: Spacing.sm },
  profileLeft:        {},
  profileName:        { fontFamily: FontFamily.soraBlack, fontSize: 20, color: Colors.ink },
  profileRole:        { fontFamily: FontFamily.dmSansMed, fontSize: 14, color: Colors.muted, marginTop: 2 },
  profileCompany:     { fontFamily: FontFamily.dmSans, fontSize: 13, color: Colors.muted },
  tierRow:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.md },
  percentile:         { fontFamily: FontFamily.dmSans, fontSize: 12.5, color: Colors.muted },
  completeCard:       { marginHorizontal: Spacing.lg, backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm },
  completeRow:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  completeLabel:      { fontFamily: FontFamily.dmSansMed, fontSize: 13, color: Colors.ink },
  completePct:        { fontFamily: FontFamily.soraBold, fontSize: 13, color: Colors.brand },
  completeBarBg:      { height: 6, backgroundColor: Colors.off2, borderRadius: 3, overflow: 'hidden' },
  completeBarFill:    { height: '100%', backgroundColor: Colors.brand, borderRadius: 3 },
  section:            { marginHorizontal: Spacing.lg, backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.sm, ...Shadow.sm },
  sectionHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle:       { fontFamily: FontFamily.soraBold, fontSize: 14, color: Colors.ink },
  sectionHint:        { fontFamily: FontFamily.dmSans, fontSize: 12, color: Colors.muted, marginTop: -4 },
  editBtn:            { fontFamily: FontFamily.dmSansSemi, fontSize: 13, color: Colors.brand },
  fieldRow:           { marginBottom: Spacing.sm },
  fieldLabel:         { fontFamily: FontFamily.dmSans, fontSize: 11, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
  fieldValue:         { fontFamily: FontFamily.dmSansMed, fontSize: 14, color: Colors.ink },
  fieldEmpty:         { color: Colors.muted, fontStyle: 'italic' },
  fieldInput:         { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.sm, padding: 10, fontFamily: FontFamily.dmSans, fontSize: 14, color: Colors.ink, backgroundColor: Colors.bg },
  fieldInputMulti:    { minHeight: 72, textAlignVertical: 'top' },
  saveBtn:            { backgroundColor: Colors.brand, borderRadius: Radius.md, paddingVertical: 11, alignItems: 'center', marginTop: Spacing.sm },
  saveBtnText:        { fontFamily: FontFamily.dmSansSemi, fontSize: 14, color: Colors.white },
  settingRow:         { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingText:        { fontFamily: FontFamily.dmSansMed, fontSize: 14, color: Colors.ink, flex: 1 },
  chevron:            { marginLeft: 'auto' },
});
