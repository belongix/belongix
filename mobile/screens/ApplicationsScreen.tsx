// screens/ApplicationsScreen.tsx
// Kanban job application tracker — 6 columns, notes panel, ghosting detection

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, RefreshControl, ActivityIndicator,
  Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Colors, FontFamily, Shadow, companyColor } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Application } from '../lib/supabase';

const { width: W } = Dimensions.get('window');
const COL_W = Math.min(W * 0.75, 260);

type KanbanStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

interface Column {
  id: KanbanStatus;
  label: string;
  color: string;
  icon: string;
}

const COLUMNS: Column[] = [
  { id: 'applied',    label: 'Applied',      color: '#6B48CC', icon: '📤' },
  { id: 'screening',  label: 'Shortlisted',  color: '#0EA5E9', icon: '👀' },
  { id: 'interview',  label: 'Interview',    color: '#F59E0B', icon: '🎤' },
  { id: 'offer',      label: 'Offer',        color: '#10B981', icon: '🎉' },
  { id: 'hired',      label: 'Hired',        color: '#059669', icon: '🚀' },
  { id: 'rejected',   label: 'Rejected',     color: '#EF4444', icon: '❌' },
];

const NOTES_KEY = (uid: string) => `bx_app_notes_${uid}`;

const SEED_APPS: Application[] = [
  { id: 'a1', user_id: '', company: 'Swiggy', role: 'SDE-2', city: 'Bangalore', salary: '30-35 LPA', status: 'interview', priority: 'high', notes: 'Had DSA round — went well. System design next week.', job_url: null, applied_at: '2026-05-01', created_at: '2026-05-01' },
  { id: 'a2', user_id: '', company: 'CRED', role: 'Product Manager', city: 'Bangalore', salary: '28-32 LPA', status: 'screening', priority: 'high', notes: 'Referral from Priya. Assignment pending.', job_url: null, applied_at: '2026-05-05', created_at: '2026-05-05' },
  { id: 'a3', user_id: '', company: 'PhonePe', role: 'Data Scientist', city: 'Bangalore', salary: '25-30 LPA', status: 'applied', priority: 'medium', notes: null, job_url: null, applied_at: '2026-05-10', created_at: '2026-05-10' },
  { id: 'a4', user_id: '', company: 'Razorpay', role: 'Backend Engineer', city: 'Bangalore', salary: '28-34 LPA', status: 'offer', priority: 'high', notes: 'Offer letter received. Deadline 20 May.', job_url: null, applied_at: '2026-04-20', created_at: '2026-04-20' },
  { id: 'a5', user_id: '', company: 'Zomato', role: 'ML Engineer', city: 'Gurugram', salary: '22-26 LPA', status: 'rejected', priority: 'medium', notes: 'Rejected after system design round.', job_url: null, applied_at: '2026-04-15', created_at: '2026-04-15' },
];

export default function ApplicationsScreen() {
  const { user } = useAuthStore();
  const [apps,       setApps]       = useState<Application[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeNote, setActiveNote] = useState<Application | null>(null);
  const [noteText,   setNoteText]   = useState('');
  const [saving,     setSaving]     = useState(false);
  const [showAdd,    setShowAdd]    = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newRole,    setNewRole]    = useState('');
  const [newCity,    setNewCity]    = useState('');
  const [adding,     setAdding]     = useState(false);

  useEffect(() => { load(); }, [user?.id]);

  const load = async () => {
    if (!user?.id) { setApps(SEED_APPS); setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setApps(data as Application[]);
      else setApps(SEED_APPS.map(a => ({ ...a, user_id: user.id })));
    } catch {
      setApps(SEED_APPS.map(a => ({ ...a, user_id: user.id })));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [user?.id]);

  const moveCard = async (appId: string, newStatus: KanbanStatus) => {
    setApps(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    try {
      await supabase.from('applications').update({ status: newStatus }).eq('id', appId);
    } catch { /* optimistic — silent rollback not needed for MVP */ }
  };

  const openNotes = (app: Application) => {
    setActiveNote(app);
    setNoteText(app.notes ?? '');
  };

  const saveNotes = async () => {
    if (!activeNote) return;
    setSaving(true);
    setApps(prev => prev.map(a => a.id === activeNote.id ? { ...a, notes: noteText } : a));
    try {
      await supabase.from('applications')
        .update({ notes: noteText })
        .eq('id', activeNote.id);
    } catch { /* silent */ } finally {
      setSaving(false);
      setActiveNote(null);
    }
  };

  const addApplication = async () => {
    if (!user?.id || !newCompany.trim() || !newRole.trim()) return;
    setAdding(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          company: newCompany.trim(),
          role: newRole.trim(),
          city: newCity.trim() || 'India',
          status: 'applied',
          priority: 'medium',
          applied_at: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();
      if (error) throw error;
      setApps(prev => [data as Application, ...prev]);
      setShowAdd(false);
      setNewCompany(''); setNewRole(''); setNewCity('');
    } catch {
      Alert.alert('Could not add application');
    } finally {
      setAdding(false);
    }
  };

  // Ghosting detection: no update in 21+ days
  const isGhosting = (app: Application) => {
    const days = (Date.now() - new Date(app.applied_at).getTime()) / 86400000;
    return days > 21 && !['hired', 'rejected'].includes(app.status);
  };

  // Stats
  const total     = apps.length;
  const active    = apps.filter(a => !['hired', 'rejected'].includes(a.status)).length;
  const interview = apps.filter(a => a.status === 'interview').length;
  const offers    = apps.filter(a => a.status === 'offer').length;

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <ActivityIndicator color={Colors.brand} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Applications</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={s.addBtnTxt}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={s.statsRow}>
        {[
          { label: 'Total', value: total, color: Colors.brand },
          { label: 'Active', value: active, color: Colors.sky },
          { label: 'Interviews', value: interview, color: Colors.amber },
          { label: 'Offers', value: offers, color: Colors.green },
        ].map(stat => (
          <View key={stat.label} style={s.statTile}>
            <Text style={[s.statVal, { color: stat.color }]}>{stat.value}</Text>
            <Text style={s.statLbl}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Kanban board */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.board}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand} />
        }
      >
        {COLUMNS.map(col => {
          const colApps = apps.filter(a => a.status === col.id);
          return (
            <View key={col.id} style={[s.column, { width: COL_W }]}>
              {/* Column header */}
              <View style={[s.colHeader, { borderTopColor: col.color }]}>
                <Text style={s.colTitle}>{col.icon} {col.label}</Text>
                <View style={[s.colCount, { backgroundColor: col.color + '22' }]}>
                  <Text style={[s.colCountTxt, { color: col.color }]}>{colApps.length}</Text>
                </View>
              </View>

              {/* Cards */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingBottom: 12 }}
                nestedScrollEnabled
              >
                {colApps.map(app => (
                  <View key={app.id} style={s.card}>
                    {/* Company logo */}
                    <View style={[s.cardLogo, { backgroundColor: companyColor(app.company) }]}>
                      <Text style={s.cardLogoTxt}>{app.company.slice(0, 2).toUpperCase()}</Text>
                    </View>

                    <Text style={s.cardRole} numberOfLines={1}>{app.role}</Text>
                    <Text style={s.cardCompany} numberOfLines={1}>{app.company}</Text>
                    {app.city && <Text style={s.cardCity}>📍 {app.city}</Text>}

                    {/* Ghosting badge */}
                    {isGhosting(app) && (
                      <View style={s.ghostBadge}>
                        <Text style={s.ghostTxt}>👻 No response</Text>
                      </View>
                    )}

                    {/* Notes preview */}
                    {app.notes && (
                      <Text style={s.notePreview} numberOfLines={2}>{app.notes}</Text>
                    )}

                    {/* Actions */}
                    <View style={s.cardActions}>
                      <TouchableOpacity style={s.noteBtn} onPress={() => openNotes(app)}>
                        <Ionicons name="document-text-outline" size={14} color={Colors.brand} />
                        <Text style={s.noteBtnTxt}>Notes</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Move to column chips */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 5, marginTop: 8 }}>
                      {COLUMNS.filter(c => c.id !== col.id).map(c => (
                        <TouchableOpacity
                          key={c.id}
                          style={[s.moveChip, { borderColor: c.color }]}
                          onPress={() => moveCard(app.id, c.id)}
                        >
                          <Text style={[s.moveChipTxt, { color: c.color }]}>{c.icon}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ))}

                {colApps.length === 0 && (
                  <View style={s.emptyCol}>
                    <Text style={s.emptyColTxt}>No applications</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      {/* Notes side panel */}
      <Modal visible={!!activeNote} transparent animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'flex-end' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity style={s.modalBg} onPress={() => setActiveNote(null)} />
          <View style={s.notesSheet}>
            <View style={s.handle} />
            <View style={s.notesHeader}>
              <View style={[s.notesLogo, { backgroundColor: companyColor(activeNote?.company ?? '') }]}>
                <Text style={s.notesLogoTxt}>{(activeNote?.company ?? 'N').slice(0, 2).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={s.notesTitle}>{activeNote?.role}</Text>
                <Text style={s.notesSub}>{activeNote?.company} · {activeNote?.city}</Text>
              </View>
            </View>

            <Text style={s.notesLabel}>NOTES</Text>
            <TextInput
              style={s.notesInput}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Add notes, next steps, interview feedback..."
              placeholderTextColor={Colors.muted}
              multiline
              maxLength={1000}
            />

            <Text style={s.notesLabel}>MOVE TO</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
              {COLUMNS.filter(c => c.id !== activeNote?.status).map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[s.statusChip, { borderColor: c.color }]}
                  onPress={() => {
                    if (activeNote) moveCard(activeNote.id, c.id);
                    setActiveNote(prev => prev ? { ...prev, status: c.id } : null);
                  }}
                >
                  <Text style={[s.statusChipTxt, { color: c.color }]}>{c.icon} {c.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[s.saveNotesBtn, saving && { opacity: 0.6 }]}
              onPress={saveNotes}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.saveNotesTxt}>💾 Save Notes</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Application modal */}
      <Modal visible={showAdd} transparent animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'flex-end' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity style={s.modalBg} onPress={() => setShowAdd(false)} />
          <View style={s.notesSheet}>
            <View style={s.handle} />
            <Text style={s.notesTitle}>Add Application</Text>
            {[
              { label: 'Company *', value: newCompany, set: setNewCompany, ph: 'e.g. Swiggy' },
              { label: 'Role *', value: newRole, set: setNewRole, ph: 'e.g. SDE-2' },
              { label: 'City', value: newCity, set: setNewCity, ph: 'e.g. Bangalore' },
            ].map(f => (
              <View key={f.label} style={{ marginBottom: 12 }}>
                <Text style={s.notesLabel}>{f.label}</Text>
                <TextInput
                  style={s.addInput}
                  value={f.value}
                  onChangeText={f.set}
                  placeholder={f.ph}
                  placeholderTextColor={Colors.muted}
                />
              </View>
            ))}
            <TouchableOpacity
              style={[s.saveNotesBtn, (adding || !newCompany || !newRole) && { opacity: 0.5 }]}
              onPress={addApplication}
              disabled={adding || !newCompany.trim() || !newRole.trim()}
            >
              {adding
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.saveNotesTxt}>Add Application →</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title:  { fontSize: 20, fontFamily: FontFamily.soraExtraBold, color: Colors.ink },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.brand, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnTxt: { color: '#fff', fontSize: 13, fontFamily: FontFamily.soraSemiBold },

  statsRow: { flexDirection: 'row', gap: 10, padding: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  statTile: { flex: 1, alignItems: 'center' },
  statVal:  { fontSize: 22, fontFamily: FontFamily.soraExtraBold },
  statLbl:  { fontSize: 10.5, fontFamily: FontFamily.dmSansRegular, color: Colors.muted, marginTop: 2 },

  board: { padding: 12, gap: 10, alignItems: 'flex-start' },
  column: { backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', ...Shadow.sm },
  colHeader: { borderTopWidth: 3, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  colTitle:  { fontSize: 13, fontFamily: FontFamily.soraSemiBold, color: Colors.ink },
  colCount:  { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  colCountTxt:{ fontSize: 12, fontFamily: FontFamily.soraSemiBold },

  card:      { margin: 8, backgroundColor: Colors.background, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border },
  cardLogo:  { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  cardLogoTxt:{ color: '#fff', fontSize: 13, fontFamily: FontFamily.soraSemiBold },
  cardRole:  { fontSize: 13.5, fontFamily: FontFamily.soraSemiBold, color: Colors.ink, marginBottom: 2 },
  cardCompany:{ fontSize: 12, fontFamily: FontFamily.dmSansRegular, color: Colors.muted },
  cardCity:  { fontSize: 11.5, fontFamily: FontFamily.dmSansRegular, color: Colors.muted, marginTop: 2 },
  ghostBadge:{ backgroundColor: '#FEF2F2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 6 },
  ghostTxt:  { fontSize: 10.5, fontFamily: FontFamily.soraSemiBold, color: Colors.red },
  notePreview:{ fontSize: 11.5, fontFamily: FontFamily.dmSansRegular, color: Colors.muted, marginTop: 6, lineHeight: 18 },
  cardActions:{ flexDirection: 'row', marginTop: 8 },
  noteBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.off, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  noteBtnTxt:{ fontSize: 11.5, fontFamily: FontFamily.dmSansMedium, color: Colors.brand },
  moveChip:  { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  moveChipTxt:{ fontSize: 13 },
  emptyCol:  { alignItems: 'center', padding: 20 },
  emptyColTxt:{ fontSize: 12, fontFamily: FontFamily.dmSansRegular, color: Colors.muted },

  // Notes sheet
  modalBg:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  notesSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  handle:     { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16 },
  notesHeader:{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  notesLogo:  { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  notesLogoTxt:{ color: '#fff', fontSize: 15, fontFamily: FontFamily.soraSemiBold },
  notesTitle: { fontSize: 17, fontFamily: FontFamily.soraSemiBold, color: Colors.ink },
  notesSub:   { fontSize: 12.5, fontFamily: FontFamily.dmSansRegular, color: Colors.muted, marginTop: 2 },
  notesLabel: { fontSize: 10.5, fontFamily: FontFamily.soraSemiBold, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, marginTop: 12 },
  notesInput: { backgroundColor: Colors.background, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 13, paddingVertical: 10, fontSize: 14, fontFamily: FontFamily.dmSansRegular, color: Colors.ink, minHeight: 100, textAlignVertical: 'top' },
  statusChip:  { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
  statusChipTxt:{ fontSize: 12.5, fontFamily: FontFamily.dmSansMedium },
  saveNotesBtn:{ backgroundColor: Colors.brand, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 16 },
  saveNotesTxt:{ color: '#fff', fontSize: 15, fontFamily: FontFamily.soraSemiBold },
  addInput:   { backgroundColor: Colors.background, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 13, paddingVertical: 10, fontSize: 14, fontFamily: FontFamily.dmSansRegular, color: Colors.ink },
});
