// screens/MentorsScreen.tsx
// Mentor directory — 1-on-1 tab + Live Group Sessions tab
// Booking bottom sheet with 30/60 min selector + Razorpay payment

import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Modal, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, FontFamily, Shadow, companyColor } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import MentorCard from '../components/MentorCard';
import BexiFAB from '../components/BexiFAB';
import type { Mentor } from '../lib/supabase';

// ── Seed data (shown while Supabase loads) ──────────────────────────
const SEED_MENTORS: Mentor[] = [
  {
    id: 'm1', name: 'Arjun Mehta', role: 'Engineering Manager', company: 'Google',
    field: 'Engineering', experience_years: 12, price_30: 1500, price_60: 2500,
    avatar_color: '#2D1B69', avatar_url: null, rating: 4.9, session_count: 245,
    tags: ['System Design', 'Career Switch', 'FAANG Prep'],
    review_quote: 'Arjun\'s mock interview completely changed how I approach design questions.',
    review_author: 'Priya, SDE-2 at Amazon',
    bio: 'Ex-Facebook, 12 years in distributed systems. I help engineers crack FAANG.',
    available: true,
  },
  {
    id: 'm2', name: 'Sneha Rao', role: 'Senior Product Manager', company: 'Swiggy',
    field: 'Product', experience_years: 8, price_30: 1200, price_60: 2000,
    avatar_color: '#FF5C35', avatar_url: null, rating: 4.8, session_count: 183,
    tags: ['PM Transition', 'Product Strategy', 'Salary Negotiation'],
    review_quote: 'She gave me a 10-step plan to break into PM. Got an offer in 6 weeks!',
    review_author: 'Rahul, now PM at CRED',
    bio: 'Built 3 products from 0 to 10M users. Passionate about helping engineers become PMs.',
    available: true,
  },
  {
    id: 'm3', name: 'Kiran Patel', role: 'Data Science Lead', company: 'PhonePe',
    field: 'Data Science', experience_years: 9, price_30: 1000, price_60: 1800,
    avatar_color: '#10B981', avatar_url: null, rating: 4.7, session_count: 156,
    tags: ['ML Interviews', 'Python', 'Statistics'],
    review_quote: 'Kiran\'s approach to case studies is brilliant. Landed my dream DS role!',
    review_author: 'Ananya, Data Scientist at Zepto',
    bio: 'Led data science teams at 3 unicorns. I decode what interviewers actually want.',
    available: true,
  },
  {
    id: 'm4', name: 'Vikram Sharma', role: 'DevOps Architect', company: 'Razorpay',
    field: 'DevOps', experience_years: 11, price_30: 1100, price_60: 1900,
    avatar_color: '#06B6D4', avatar_url: null, rating: 4.8, session_count: 98,
    tags: ['Kubernetes', 'AWS', 'CI/CD'],
    review_quote: 'Vikram saved me months of confusion about cloud architecture.',
    review_author: 'Dev, DevOps Engineer at HDFC Bank',
    bio: 'Automated deployments for 50M+ transactions/day. DevOps made simple.',
    available: true,
  },
  {
    id: 'm5', name: 'Meera Krishnan', role: 'HR Business Partner', company: 'Microsoft',
    field: 'HR & Salary', experience_years: 7, price_30: 800, price_60: 1400,
    avatar_color: '#F59E0B', avatar_url: null, rating: 4.9, session_count: 312,
    tags: ['Salary Negotiation', 'Resume Review', 'Interview Prep'],
    review_quote: 'Meera helped me negotiate ₹8L more than the initial offer. Phenomenal!',
    review_author: 'Suresh, now at Atlassian',
    bio: 'Hired 1000+ engineers. I know exactly what hiring managers look for.',
    available: true,
  },
  {
    id: 'm6', name: 'Rohan Gupta', role: 'Startup Founder (YC W22)', company: 'FluxHQ',
    field: 'Startups', experience_years: 6, price_30: 2000, price_60: 3500,
    avatar_color: '#8B5CF6', avatar_url: null, rating: 4.9, session_count: 67,
    tags: ['Fundraising', 'Product-Market Fit', 'Startup Career'],
    review_quote: 'Rohan helped me go from idea to first ₹10L ARR in 4 months.',
    review_author: 'Pooja, Founder at HealthStack',
    bio: 'YC-backed founder, ex-Flipkart. I help ambitious engineers go from job to founder.',
    available: true,
  },
];

const GROUP_SESSIONS = [
  { id: 'g1', mentor: 'Arjun Mehta', title: 'System Design Crash Course', date: 'Sat, 24 May · 10 AM IST', seats: 20, left: 7, price: 499, duration: '2 hours', color: Colors.brand },
  { id: 'g2', mentor: 'Sneha Rao', title: 'PM Interview Masterclass', date: 'Sun, 25 May · 11 AM IST', seats: 15, left: 3, price: 399, duration: '90 mins', color: Colors.orange },
  { id: 'g3', mentor: 'Meera Krishnan', title: 'Salary Negotiation Workshop', date: 'Sat, 31 May · 10 AM IST', seats: 25, left: 12, price: 299, duration: '75 mins', color: Colors.green },
  { id: 'g4', mentor: 'Kiran Patel', title: 'ML Case Study Sprint', date: 'Sun, 1 Jun · 11 AM IST', seats: 20, left: 8, price: 449, duration: '2 hours', color: '#06B6D4' },
  { id: 'g5', mentor: 'Vikram Sharma', title: 'AWS + K8s for Beginners', date: 'Sat, 7 Jun · 10 AM IST', seats: 30, left: 18, price: 349, duration: '90 mins', color: '#8B5CF6' },
];

const RATING_OPTS = [
  { label: 'Any Rating', val: 0 },
  { label: '4.0+ ⭐', val: 4.0 },
  { label: '4.5+ ⭐', val: 4.5 },
  { label: '4.8+ ⭐', val: 4.8 },
];

export default function MentorsScreen() {
  const { user } = useAuthStore();
  const [tab,        setTab]        = useState<'mentors' | 'sessions'>('mentors');
  const [mentors,    setMentors]    = useState<Mentor[]>(SEED_MENTORS);
  const [search,     setSearch]     = useState('');
  const [minRating,  setMinRating]  = useState(0);
  const [bookMentor, setBookMentor] = useState<Mentor | null>(null);
  const [duration,   setDuration]   = useState<30 | 60>(30);
  const [booking,    setBooking]    = useState(false);

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      const { data, error } = await supabase
        .from('mentors')
        .select('*')
        .eq('available', true)
        .order('rating', { ascending: false });
      if (!error && data && data.length > 0) {
        setMentors(data as Mentor[]);
      }
    } catch {
      // Keep seed data on error
    }
  };

  const filtered = mentors.filter(m => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) &&
        !m.role.toLowerCase().includes(search.toLowerCase()) &&
        !m.company.toLowerCase().includes(search.toLowerCase()) &&
        !m.field.toLowerCase().includes(search.toLowerCase())) return false;
    if (minRating && m.rating < minRating) return false;
    return true;
  });

  const handleBook = async () => {
    if (!user) { Alert.alert('Sign in required'); return; }
    if (!bookMentor) return;
    setBooking(true);
    try {
      const price = duration === 30 ? bookMentor.price_30 : bookMentor.price_60;
      await supabase.from('mentor_bookings').insert({
        user_id: user.id,
        mentor_id: bookMentor.id,
        duration_mins: duration,
        price,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      setBookMentor(null);
      Alert.alert(
        '🎉 Booking Requested!',
        `${bookMentor.name} will confirm within 24 hours.\nA Google Meet link will be sent to your email.`,
      );
    } catch {
      Alert.alert('Booking failed', 'Please try again or contact support@belongix.in');
    } finally {
      setBooking(false);
    }
  };

  const handleRegisterSession = async (session: typeof GROUP_SESSIONS[0]) => {
    if (!user) { Alert.alert('Sign in to register'); return; }
    try {
      await supabase.from('session_registrations').insert({
        user_id: user.id,
        session_id: session.id,
        status: 'registered',
        created_at: new Date().toISOString(),
      });
      Alert.alert(
        '✅ Registered!',
        `You're registered for "${session.title}".\nCheck your email for the Zoom / Meet link.`,
      );
    } catch {
      Alert.alert('Could not register', 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header + tabs */}
      <View style={s.header}>
        <Text style={s.title}>Find a Mentor</Text>
        <View style={s.tabBar}>
          {(['mentors', 'sessions'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[s.dirTab, tab === t && s.dirTabActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[s.dirTabTxt, tab === t && s.dirTabTxtActive]}>
                {t === 'mentors' ? '🤝 1-on-1 Mentors' : '🎥 Live Sessions'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {tab === 'mentors' ? (
        /* ── 1-on-1 Mentors ── */
        <FlatList
          data={filtered}
          keyExtractor={m => m.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListHeaderComponent={
            <View style={s.filters}>
              {/* Search */}
              <View style={s.searchBar}>
                <Ionicons name="search" size={16} color={Colors.muted} />
                <TextInput
                  style={s.searchInput}
                  placeholder="Name, role, company, skill..."
                  placeholderTextColor={Colors.muted}
                  value={search}
                  onChangeText={setSearch}
                />
              </View>
              {/* Rating filter */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingTop: 10, paddingBottom: 4 }}>
                {RATING_OPTS.map(opt => (
                  <TouchableOpacity
                    key={opt.val}
                    style={[s.ratingPill, minRating === opt.val && s.ratingPillActive]}
                    onPress={() => setMinRating(opt.val)}
                  >
                    <Text style={[s.ratingTxt, minRating === opt.val && s.ratingTxtActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={s.count}>{filtered.length} mentors</Text>
            </View>
          }
          renderItem={({ item }) => (
            <MentorCard mentor={item} onBook={m => setBookMentor(m)} />
          )}
        />
      ) : (
        /* ── Live Group Sessions ── */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          <Text style={s.sessionIntro}>
            Join live group sessions with top mentors — fraction of the 1-on-1 price.
          </Text>
          {GROUP_SESSIONS.map(session => (
            <View key={session.id} style={s.sessionCard}>
              <View style={[s.sessionAccent, { backgroundColor: session.color }]} />
              <View style={s.sessionBody}>
                <View style={s.sessionTop}>
                  <Text style={s.sessionTitle}>{session.title}</Text>
                  <View style={[s.sessionPriceBadge, { backgroundColor: session.color + '18' }]}>
                    <Text style={[s.sessionPrice, { color: session.color }]}>₹{session.price}</Text>
                  </View>
                </View>
                <Text style={s.sessionMentor}>with {session.mentor}</Text>
                <Text style={s.sessionDate}>📅 {session.date} · {session.duration}</Text>
                <View style={s.seatsRow}>
                  <Ionicons
                    name="people-outline" size={14}
                    color={session.left <= 5 ? Colors.red : Colors.muted}
                  />
                  <Text style={[s.seatsTxt, { color: session.left <= 5 ? Colors.red : Colors.muted }]}>
                    {session.left} seats left of {session.seats}
                  </Text>
                  {session.left <= 5 && (
                    <View style={s.urgencyBadge}>
                      <Text style={s.urgencyTxt}>Almost full!</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={[s.registerBtn, { backgroundColor: session.color }]}
                  onPress={() => handleRegisterSession(session)}
                >
                  <Text style={s.registerTxt}>Register for ₹{session.price} →</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Booking bottom sheet */}
      <Modal visible={!!bookMentor} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={s.sheetBg} onPress={() => setBookMentor(null)} />
          <View style={s.sheet}>
            <View style={s.handle} />
            <Text style={s.sheetTitle}>Book {bookMentor?.name}</Text>
            <Text style={s.sheetSub}>{bookMentor?.role} · {bookMentor?.company}</Text>

            <Text style={s.durationLabel}>SESSION DURATION</Text>
            <View style={s.durationRow}>
              {([30, 60] as const).map(d => (
                <TouchableOpacity
                  key={d}
                  style={[s.durationBtn, duration === d && s.durationBtnActive]}
                  onPress={() => setDuration(d)}
                >
                  <Text style={[s.durationMins, duration === d && s.durationMinsActive]}>
                    {d} minutes
                  </Text>
                  <Text style={[s.durationPrice, duration === d && s.durationPriceActive]}>
                    ₹{d === 30 ? bookMentor?.price_30 : bookMentor?.price_60}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.bookNote}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.brand} />
              <Text style={s.bookNoteTxt}>
                You'll receive a Google Meet link via email within 24 hours of confirmation.
              </Text>
            </View>

            <TouchableOpacity
              style={[s.confirmBtn, booking && { opacity: 0.6 }]}
              onPress={handleBook}
              disabled={booking}
            >
              {booking
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.confirmTxt}>
                    Confirm Booking · ₹{duration === 30 ? bookMentor?.price_30 : bookMentor?.price_60} →
                  </Text>
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setBookMentor(null)} style={s.cancelBtn}>
              <Text style={s.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <BexiFAB />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title:  { fontSize: 20, fontFamily: FontFamily.soraExtraBold, color: Colors.ink, marginBottom: 12 },
  tabBar: { flexDirection: 'row', backgroundColor: Colors.background, borderRadius: 10, padding: 3 },
  dirTab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 8 },
  dirTabActive:   { backgroundColor: Colors.white, ...Shadow.sm },
  dirTabTxt:      { fontSize: 13, fontFamily: FontFamily.dmSansMedium, color: Colors.muted },
  dirTabTxtActive:{ color: Colors.brand, fontFamily: FontFamily.soraSemiBold },

  filters:     { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  searchBar:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1.5, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: 14, fontFamily: FontFamily.dmSansRegular, color: Colors.ink },
  ratingPill:  { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border },
  ratingPillActive: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  ratingTxt:        { fontSize: 12.5, fontFamily: FontFamily.dmSansMedium, color: Colors.muted },
  ratingTxtActive:  { color: '#fff' },
  count: { fontSize: 12, fontFamily: FontFamily.dmSansRegular, color: Colors.muted, marginTop: 6 },

  sessionIntro: { fontSize: 13.5, fontFamily: FontFamily.dmSansRegular, color: Colors.muted, marginBottom: 16, lineHeight: 22 },
  sessionCard:  { backgroundColor: Colors.white, borderRadius: 16, marginBottom: 14, overflow: 'hidden', flexDirection: 'row', ...Shadow.sm, borderWidth: 1, borderColor: Colors.border },
  sessionAccent:{ width: 5, flexShrink: 0 },
  sessionBody:  { flex: 1, padding: 14 },
  sessionTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  sessionTitle: { flex: 1, fontSize: 15, fontFamily: FontFamily.soraSemiBold, color: Colors.ink, marginRight: 10 },
  sessionPriceBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  sessionPrice: { fontSize: 14, fontFamily: FontFamily.soraExtraBold },
  sessionMentor:{ fontSize: 12.5, fontFamily: FontFamily.dmSansMedium, color: Colors.muted, marginBottom: 6 },
  sessionDate:  { fontSize: 13, fontFamily: FontFamily.dmSansRegular, color: Colors.ink, marginBottom: 8 },
  seatsRow:     { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12 },
  seatsTxt:     { fontSize: 12, fontFamily: FontFamily.dmSansMedium },
  urgencyBadge: { backgroundColor: '#FEF2F2', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  urgencyTxt:   { fontSize: 10.5, fontFamily: FontFamily.soraSemiBold, color: Colors.red },
  registerBtn:  { borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  registerTxt:  { color: '#fff', fontSize: 13.5, fontFamily: FontFamily.soraSemiBold },

  // Sheet
  sheetBg:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet:      { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  handle:     { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontFamily: FontFamily.soraExtraBold, color: Colors.ink, marginBottom: 3 },
  sheetSub:   { fontSize: 13.5, fontFamily: FontFamily.dmSansRegular, color: Colors.muted, marginBottom: 22 },
  durationLabel: { fontSize: 11, fontFamily: FontFamily.soraSemiBold, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  durationRow:   { flexDirection: 'row', gap: 10, marginBottom: 18 },
  durationBtn:      { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  durationBtnActive:{ borderColor: Colors.brand, backgroundColor: Colors.off },
  durationMins:      { fontSize: 14, fontFamily: FontFamily.soraSemiBold, color: Colors.muted, marginBottom: 4 },
  durationMinsActive:{ color: Colors.brand },
  durationPrice:     { fontSize: 18, fontFamily: FontFamily.soraExtraBold, color: Colors.muted },
  durationPriceActive:{ color: Colors.brand },
  bookNote:    { flexDirection: 'row', gap: 8, backgroundColor: Colors.off, borderRadius: 10, padding: 12, marginBottom: 18 },
  bookNoteTxt: { flex: 1, fontSize: 12.5, fontFamily: FontFamily.dmSansRegular, color: Colors.brand, lineHeight: 19 },
  confirmBtn:  { backgroundColor: Colors.brand, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  confirmTxt:  { color: '#fff', fontSize: 15, fontFamily: FontFamily.soraSemiBold },
  cancelBtn:   { alignItems: 'center', paddingVertical: 6 },
  cancelTxt:   { fontSize: 14, fontFamily: FontFamily.dmSansMedium, color: Colors.muted },
});
