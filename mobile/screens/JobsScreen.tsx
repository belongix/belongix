/**
 * Belongix — Jobs Screen
 * Sticky search, filters, chip tabs, virtualized FlatList, apply bottom sheet.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList,
  ScrollView, Modal, Alert, ActivityIndicator, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors, FontFamily, Spacing, Radius, Shadow } from '../lib/theme';
import { useJobStore, JobFilters } from '../store/jobStore';
import { useAuthStore } from '../store/authStore';
import { Job } from '../lib/supabase';
import JobCard from '../components/JobCard';

const CITIES    = ['All', 'Bangalore', 'Hyderabad', 'Mumbai', 'Pune', 'Chennai', 'Remote'];
const TAGS      = ['All', 'Fresher', 'Remote', 'AI/ML', 'Data', 'Cloud', 'DevOps', 'Exclusive'];
const JOB_TYPES = ['All', 'FULLTIME', 'INTERN', 'REMOTE'];

export default function JobsScreen() {
  const { jobs, loading, loadJobs, applyToJob, appliedIds } = useJobStore();
  const { user, profile } = useAuthStore();

  const [search, setSearch]       = useState('');
  const [city, setCity]           = useState('All');
  const [tag, setTag]             = useState('All');
  const [jobType, setJobType]     = useState('All');
  const [applyJob, setApplyJob]   = useState<Job | null>(null);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying]   = useState(false);

  useEffect(() => { loadJobs(); }, []);

  const handleSearch = useCallback(() => {
    const filters: JobFilters = {
      search:   search || undefined,
      city:     city !== 'All' ? city : undefined,
      type:     jobType !== 'All' ? jobType : undefined,
    };
    loadJobs(filters);
  }, [search, city, jobType]);

  // Filter client-side by tag
  const filteredJobs = jobs.filter((j) => {
    if (tag === 'All') return true;
    if (tag === 'Exclusive') return j.is_exclusive;
    if (tag === 'Remote')    return j.city === 'Remote' || j.job_type === 'REMOTE';
    if (tag === 'Fresher')   return j.experience?.includes('0') || j.experience?.includes('Fresher');
    return j.skills?.some((s) => s.toLowerCase().includes(tag.toLowerCase()));
  });

  const handleApply = async () => {
    if (!user || !applyJob) return;
    setApplying(true);
    try {
      await applyToJob(user.id, applyJob, coverNote);
      setApplyJob(null);
      setCoverNote('');
      Alert.alert('✅ Applied!', `Your application to ${applyJob.company} has been submitted. +15 career score points awarded!`);
    } catch {
      Alert.alert('Apply failed', 'Please try again.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Sticky search ── */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Role, company, or skill..."
          placeholderTextColor={Colors.muted}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => { setSearch(''); loadJobs(); }}>
            <Ionicons name="close-circle" size={18} color={Colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── City filter ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {CITIES.map((c) => (
          <TouchableOpacity key={c} style={[styles.filterChip, city === c && styles.filterChipActive]} onPress={() => { setCity(c); handleSearch(); }}>
            <Text style={[styles.filterChipText, city === c && styles.filterChipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Tag chips ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {TAGS.map((t) => (
          <TouchableOpacity key={t} style={[styles.tagChip, tag === t && styles.tagChipActive]} onPress={() => setTag(t)}>
            <Text style={[styles.tagChipText, tag === t && styles.tagChipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Job count ── */}
      <Text style={styles.count}>{filteredJobs.length} jobs found</Text>

      {/* ── Job list ── */}
      {loading ? (
        <ActivityIndicator color={Colors.brand} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(j) => j.id}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              applied={appliedIds.has(item.id)}
              onApply={() => { setApplyJob(item); setCoverNote(''); }}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No jobs match your filters. Try broadening your search.</Text>
          }
        />
      )}

      {/* ── Apply Modal ── */}
      <Modal visible={!!applyJob} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalBg} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Apply to {applyJob?.company}</Text>
            <Text style={styles.sheetRole}>{applyJob?.title} · {applyJob?.city}</Text>

            <View style={styles.prefill}>
              <Text style={styles.prefillLabel}>Applying as</Text>
              <Text style={styles.prefillVal}>{profile?.full_name ?? user?.email}</Text>
            </View>

            <Text style={styles.noteLabel}>Cover note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              value={coverNote}
              onChangeText={setCoverNote}
              placeholder="Why are you a great fit? Keep it brief..."
              placeholderTextColor={Colors.muted}
              multiline
              numberOfLines={4}
              maxLength={500}
            />

            <TouchableOpacity style={styles.applyBtn} onPress={handleApply} disabled={applying}>
              {applying ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.applyBtnText}>⚡ Submit Application</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setApplyJob(null)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: Colors.bg },
  searchBar:          { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, marginHorizontal: Spacing.lg, marginTop: Spacing.md, marginBottom: Spacing.sm, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, borderWidth: 1.5, borderColor: Colors.border, gap: 8 },
  searchIcon:         {},
  searchInput:        { flex: 1, fontFamily: FontFamily.dmSans, fontSize: 14, color: Colors.ink, paddingVertical: 11 },
  filterRow:          { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, gap: 8 },
  filterChip:         { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: Colors.white, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border },
  filterChipActive:   { backgroundColor: Colors.brand, borderColor: Colors.brand },
  filterChipText:     { fontFamily: FontFamily.dmSansMed, fontSize: 13, color: Colors.muted },
  filterChipTextActive: { color: Colors.white },
  tagChip:            { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: Colors.off, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.off2 },
  tagChipActive:      { backgroundColor: Colors.brand + '15', borderColor: Colors.brand },
  tagChipText:        { fontFamily: FontFamily.dmSans, fontSize: 12.5, color: Colors.muted },
  tagChipTextActive:  { color: Colors.brand, fontFamily: FontFamily.dmSansSemi },
  count:              { fontFamily: FontFamily.dmSans, fontSize: 12.5, color: Colors.muted, marginHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  list:               { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  empty:              { fontFamily: FontFamily.dmSans, fontSize: 14, color: Colors.muted, textAlign: 'center', marginTop: 40, lineHeight: 22 },
  modalBg:            { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet:              { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl, paddingBottom: 40 },
  sheetHandle:        { width: 36, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.lg },
  sheetTitle:         { fontFamily: FontFamily.soraBold, fontSize: 18, color: Colors.ink, marginBottom: 2 },
  sheetRole:          { fontFamily: FontFamily.dmSans, fontSize: 13.5, color: Colors.muted, marginBottom: Spacing.lg },
  prefill:            { backgroundColor: Colors.off, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  prefillLabel:       { fontFamily: FontFamily.dmSans, fontSize: 11, color: Colors.muted },
  prefillVal:         { fontFamily: FontFamily.dmSansSemi, fontSize: 14, color: Colors.ink, marginTop: 2 },
  noteLabel:          { fontFamily: FontFamily.dmSansSemi, fontSize: 11, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  noteInput:          { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontFamily: FontFamily.dmSans, fontSize: 14, color: Colors.ink, textAlignVertical: 'top', minHeight: 90 },
  applyBtn:           { backgroundColor: Colors.green, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.lg },
  applyBtnText:       { fontFamily: FontFamily.soraBold, fontSize: 15, color: Colors.white },
  cancelBtn:          { alignItems: 'center', paddingVertical: 12 },
  cancelText:         { fontFamily: FontFamily.dmSansMed, fontSize: 14, color: Colors.muted },
});
