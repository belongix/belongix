import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Shadow, getTier } from '../lib/theme';
import { useAuthStore } from '../store/authStore';

export default function ProfileScreen() {
  const { profile, user, updateProfile, signOut } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    role: profile?.role ?? '',
    company: profile?.company ?? '',
    city: profile?.city ?? '',
    skills: profile?.skills ?? '',
    experience: profile?.experience ?? '',
  });

  const score = profile?.career_score ?? 30;
  const tier = getTier(score);
  const name = profile?.full_name ?? user?.email?.split('@')[0] ?? 'Your Profile';

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      setEditing(false);
    } catch {
      Alert.alert('Save failed', 'Please try again');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <LinearGradient colors={[Colors.brand, Colors.brand2]} style={s.banner}>
          <View style={s.avatar}>
            <Text style={s.avatarTxt}>{name.slice(0, 2).toUpperCase()}</Text>
          </View>
          <Text style={s.bannerName}>{name}</Text>
          <Text style={s.bannerRole}>{profile?.role ?? 'Add your role'}</Text>
          <View style={[s.tierBadge, { backgroundColor: tier.bg }]}>
            <Text style={[s.tierTxt, { color: tier.color }]}>{tier.label} · {score}/100</Text>
          </View>
        </LinearGradient>

        {/* Edit form */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Profile Details</Text>
            <TouchableOpacity onPress={() => editing ? saveProfile() : setEditing(true)}>
              {saving
                ? <ActivityIndicator color={Colors.brand} />
                : <Text style={s.editBtn}>{editing ? 'Save' : 'Edit'}</Text>}
            </TouchableOpacity>
          </View>
          {[
            { label: 'Full Name', key: 'full_name', ph: 'Your full name' },
            { label: 'Current Role', key: 'role', ph: 'e.g. Software Engineer' },
            { label: 'Company', key: 'company', ph: 'e.g. Swiggy' },
            { label: 'City', key: 'city', ph: 'e.g. Bangalore' },
            { label: 'Experience', key: 'experience', ph: 'e.g. 3-5 years' },
            { label: 'Skills', key: 'skills', ph: 'Python, React, SQL...' },
          ].map(f => (
            <View key={f.key} style={s.field}>
              <Text style={s.fieldLabel}>{f.label}</Text>
              {editing ? (
                <TextInput
                  style={s.fieldInput}
                  value={form[f.key as keyof typeof form]}
                  onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                  placeholder={f.ph}
                  placeholderTextColor={Colors.muted}
                />
              ) : (
                <Text style={s.fieldValue}>
                  {profile?.[f.key as keyof typeof profile] as string || '—'}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Settings</Text>
          <TouchableOpacity style={s.settingsRow} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color={Colors.red} />
            <Text style={[s.settingsLabel, { color: Colors.red }]}>Sign Out</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  banner: { padding: 24, alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.brand3, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarTxt: { color: '#fff', fontSize: 24, fontFamily: FontFamily.soraSemiBold },
  bannerName: { fontSize: 20, fontFamily: FontFamily.soraExtraBold, color: '#fff', marginBottom: 4 },
  bannerRole: { fontSize: 13.5, fontFamily: FontFamily.dmSansRegular, color: 'rgba(255,255,255,0.75)', marginBottom: 10 },
  tierBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  tierTxt: { fontSize: 12, fontFamily: FontFamily.soraSemiBold },
  section: { margin: 16, backgroundColor: Colors.white, borderRadius: 16, padding: 16, ...Shadow.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontFamily: FontFamily.soraSemiBold, color: Colors.ink },
  editBtn: { fontSize: 14, fontFamily: FontFamily.soraSemiBold, color: Colors.brand },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 11, fontFamily: FontFamily.soraSemiBold, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 },
  fieldValue: { fontSize: 14, fontFamily: FontFamily.dmSansRegular, color: Colors.ink },
  fieldInput: { backgroundColor: Colors.background, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 13, paddingVertical: 10, fontSize: 14, fontFamily: FontFamily.dmSansRegular, color: Colors.ink },
  settingsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  settingsLabel: { flex: 1, fontSize: 14, fontFamily: FontFamily.dmSansMedium, color: Colors.ink },
});