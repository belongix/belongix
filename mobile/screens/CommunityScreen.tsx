// screens/CommunityScreen.tsx
// Community Q&A — tag filter, sort, expandable posts, Bexi auto-answer

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ScrollView, Modal, TextInput, Alert, KeyboardAvoidingView,
  Platform, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors, FontFamily, Shadow } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { askClaude } from '../lib/claude';
import { useAuthStore } from '../store/authStore';
import PostCard from '../components/PostCard';
import BexiFAB from '../components/BexiFAB';
import type { CommunityPost } from '../lib/supabase';

const ALL_TAGS = ['All', 'Jobs', 'Salary', 'Resume', 'Interviews', 'Skills', 'Career Switch', 'Mentorship', 'Startups'];
type SortOpt = 'Latest' | 'Most Upvoted' | 'Unanswered';

const SEED_POSTS: CommunityPost[] = [
  { id: 'p1', user_id: 'u1', title: 'How do I negotiate salary at a startup vs a FAANG company?', body: 'I have two offers — one from a Series B startup at ₹22L and one from Google at ₹28L. The startup is offering significant equity. How should I think about this?', tags: ['Salary', 'Jobs'], upvotes: 47, answer_count: 8, is_bexi_answered: true, author_name: 'Rahul K.', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 'p2', user_id: 'u2', title: 'What\'s the best way to prepare for system design interviews in 2026?', body: 'I have SDE-2 interviews at Swiggy and Razorpay coming up. I have 3 weeks to prepare. Where should I start?', tags: ['Interviews', 'Skills'], upvotes: 63, answer_count: 12, is_bexi_answered: true, author_name: 'Priya M.', created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: 'p3', user_id: 'u3', title: 'Is a career switch from IT services to product company realistic at 5 years?', body: 'I\'ve spent 5 years at TCS. I want to move to a product company. Most JDs ask for product experience. How did people here make this switch?', tags: ['Career Switch', 'Jobs'], upvotes: 89, answer_count: 15, is_bexi_answered: false, author_name: 'Amit S.', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'p4', user_id: 'u4', title: 'What should a data scientist\'s resume look like in 2026?', body: 'I\'ve been applying to 50+ roles with no callbacks. My current resume lists skills and projects but no metrics. Should I redo it completely?', tags: ['Resume', 'Skills'], upvotes: 34, answer_count: 6, is_bexi_answered: true, author_name: 'Sneha R.', created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 'p5', user_id: 'u5', title: 'Best free resources to learn Kubernetes for a DevOps role?', body: 'I want to upskill in K8s. Most paid courses cost ₹5-10K. Are there good free alternatives that are actually comprehensive?', tags: ['Skills', 'Jobs'], upvotes: 28, answer_count: 9, is_bexi_answered: false, author_name: 'Vikram P.', created_at: new Date(Date.now() - 259200000).toISOString() },
];

export default function CommunityScreen() {
  const { user, profile } = useAuthStore();
  const [posts,       setPosts]       = useState<CommunityPost[]>(SEED_POSTS);
  const [activeTag,   setActiveTag]   = useState('All');
  const [sort,        setSort]        = useState<SortOpt>('Latest');
  const [refreshing,  setRefreshing]  = useState(false);
  const [showAsk,     setShowAsk]     = useState(false);
  const [askTitle,    setAskTitle]    = useState('');
  const [askBody,     setAskBody]     = useState('');
  const [askTags,     setAskTags]     = useState<string[]>([]);
  const [posting,     setPosting]     = useState(false);
  const [upvoted,     setUpvoted]     = useState<Set<string>>(new Set());

  useEffect(() => { loadPosts(); }, [activeTag, sort]);

  const loadPosts = async () => {
    try {
      let query = supabase
        .from('community_posts')
        .select('*')
        .order(sort === 'Most Upvoted' ? 'upvotes' : 'created_at', { ascending: false })
        .limit(40);
      if (activeTag !== 'All') query = query.contains('tags', [activeTag]);
      const { data, error } = await query;
      if (!error && data && data.length > 0) setPosts(data as CommunityPost[]);
    } catch {
      // Keep seed data
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, [activeTag, sort]);

  const filtered = posts.filter(p => {
    if (activeTag !== 'All' && !(p.tags ?? []).includes(activeTag)) return false;
    if (sort === 'Unanswered' && p.answer_count > 0) return false;
    return true;
  }).sort((a, b) => {
    if (sort === 'Most Upvoted') return b.upvotes - a.upvotes;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleUpvote = async (postId: string) => {
    if (upvoted.has(postId)) return;
    setUpvoted(prev => new Set([...prev, postId]));
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p));
    try {
      await supabase.from('post_upvotes').insert({ user_id: user?.id, post_id: postId });
    } catch { /* silent */ }
  };

  const handleAnswer = async (postId: string, text: string) => {
    if (!user) { Alert.alert('Sign in to answer'); return; }
    try {
      await supabase.from('community_answers').insert({
        user_id: user.id,
        post_id: postId,
        content: text,
        author_name: profile?.full_name ?? 'Anonymous',
        created_at: new Date().toISOString(),
      });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, answer_count: p.answer_count + 1 } : p));
    } catch {
      Alert.alert('Could not post answer. Please try again.');
    }
  };

  const handlePost = async () => {
    if (!user) { Alert.alert('Sign in required'); return; }
    if (!askTitle.trim()) { Alert.alert('Please add a title'); return; }
    setPosting(true);
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          title: askTitle.trim(),
          body: askBody.trim() || null,
          tags: askTags.length > 0 ? askTags : ['Jobs'],
          upvotes: 0,
          answer_count: 0,
          is_bexi_answered: false,
          author_name: profile?.full_name ?? 'Anonymous',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const newPost = data as CommunityPost;
      setPosts(prev => [newPost, ...prev]);
      setShowAsk(false);
      setAskTitle(''); setAskBody(''); setAskTags([]);

      // Auto-trigger Bexi answer after 30 seconds if no answers
      setTimeout(async () => {
        try {
          const { data: postCheck } = await supabase
            .from('community_posts')
            .select('answer_count')
            .eq('id', newPost.id)
            .single();

          if (postCheck && postCheck.answer_count === 0) {
            const bexiAnswer = await askClaude(
              [{ role: 'user', content: askTitle + (askBody ? '\n\n' + askBody : '') }],
              {
                system: 'You are Bexi, the AI career guide for Belongix India. Answer this community question from an Indian professional. Be specific, practical, and India-market-aware. Keep it under 200 words.',
                maxTokens: 400,
              },
            );
            await supabase.from('community_answers').insert({
              user_id: 'bexi-ai',
              post_id: newPost.id,
              content: bexiAnswer,
              author_name: 'Bexi AI',
              is_bexi: true,
              created_at: new Date().toISOString(),
            });
            await supabase.from('community_posts')
              .update({ answer_count: 1, is_bexi_answered: true })
              .eq('id', newPost.id);
          }
        } catch { /* silent — auto-answer is best-effort */ }
      }, 30000);
    } catch {
      Alert.alert('Could not post question. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>👥 Community</Text>
        <View style={s.sortRow}>
          {(['Latest', 'Most Upvoted', 'Unanswered'] as SortOpt[]).map(opt => (
            <TouchableOpacity
              key={opt}
              style={[s.sortBtn, sort === opt && s.sortBtnActive]}
              onPress={() => setSort(opt)}
            >
              <Text style={[s.sortTxt, sort === opt && s.sortTxtActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tag filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tags}
      >
        {ALL_TAGS.map(t => (
          <TouchableOpacity
            key={t}
            style={[s.tagChip, activeTag === t && s.tagChipActive]}
            onPress={() => setActiveTag(t)}
          >
            <Text style={[s.tagTxt, activeTag === t && s.tagTxtActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Posts */}
      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🤔</Text>
            <Text style={s.emptyTitle}>No posts yet in this category</Text>
            <Text style={s.emptySub}>Be the first to ask a question!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onUpvote={handleUpvote}
            onAnswer={handleAnswer}
          />
        )}
      />

      {/* Ask FAB */}
      <TouchableOpacity style={s.askFAB} onPress={() => setShowAsk(true)}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={s.askFABTxt}>Ask</Text>
      </TouchableOpacity>

      {/* Ask modal */}
      <Modal visible={showAsk} transparent animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'flex-end' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity style={s.modalBg} onPress={() => setShowAsk(false)} />
          <View style={s.modal}>
            <View style={s.handle} />
            <Text style={s.modalTitle}>Ask the Community</Text>
            <Text style={s.modalSub}>Get answers from professionals + Bexi AI</Text>

            <Text style={s.fieldLabel}>QUESTION TITLE *</Text>
            <TextInput
              style={s.titleInput}
              placeholder="e.g. How do I crack system design at Swiggy?"
              placeholderTextColor={Colors.muted}
              value={askTitle}
              onChangeText={setAskTitle}
              maxLength={140}
            />

            <Text style={s.fieldLabel}>MORE DETAILS (optional)</Text>
            <TextInput
              style={s.bodyInput}
              placeholder="Add context, what you've tried, your background..."
              placeholderTextColor={Colors.muted}
              value={askBody}
              onChangeText={setAskBody}
              multiline
              maxLength={1000}
            />

            <Text style={s.fieldLabel}>TAGS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
              {ALL_TAGS.filter(t => t !== 'All').map(t => (
                <TouchableOpacity
                  key={t}
                  style={[s.tagChip, askTags.includes(t) && s.tagChipActive]}
                  onPress={() => setAskTags(prev =>
                    prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
                  )}
                >
                  <Text style={[s.tagTxt, askTags.includes(t) && s.tagTxtActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[s.postBtn, (posting || !askTitle.trim()) && { opacity: 0.5 }]}
              onPress={handlePost}
              disabled={posting || !askTitle.trim()}
            >
              {posting
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.postBtnTxt}>Post Question →</Text>
              }
            </TouchableOpacity>
            <Text style={s.autoAnswerNote}>
              🤖 Bexi AI will auto-answer if no one replies in 30 seconds
            </Text>
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
  title:  { fontSize: 20, fontFamily: FontFamily.soraExtraBold, color: Colors.ink, marginBottom: 10 },
  sortRow:{ flexDirection: 'row', gap: 6 },
  sortBtn:{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border },
  sortBtnActive: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  sortTxt:       { fontSize: 12, fontFamily: FontFamily.dmSansMedium, color: Colors.muted },
  sortTxtActive: { color: '#fff' },

  tags:        { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  tagChip:     { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border },
  tagChipActive:{ backgroundColor: Colors.brand, borderColor: Colors.brand },
  tagTxt:      { fontSize: 12.5, fontFamily: FontFamily.dmSansMedium, color: Colors.muted },
  tagTxtActive:{ color: '#fff' },

  empty:      { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontFamily: FontFamily.soraSemiBold, color: Colors.ink, marginBottom: 6 },
  emptySub:   { fontSize: 13.5, fontFamily: FontFamily.dmSansRegular, color: Colors.muted },

  askFAB: {
    position: 'absolute', bottom: 90, right: 20, zIndex: 100,
    width: 80, height: 44, borderRadius: 22,
    backgroundColor: Colors.brand, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 6,
    ...Shadow.lg,
  },
  askFABTxt: { color: '#fff', fontSize: 14, fontFamily: FontFamily.soraSemiBold },

  modalBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modal:   { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32 },
  handle:  { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 19, fontFamily: FontFamily.soraExtraBold, color: Colors.ink, marginBottom: 3 },
  modalSub:   { fontSize: 13, fontFamily: FontFamily.dmSansRegular, color: Colors.muted, marginBottom: 18 },
  fieldLabel: { fontSize: 10.5, fontFamily: FontFamily.soraSemiBold, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6, marginTop: 12 },
  titleInput: { backgroundColor: Colors.background, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 13, paddingVertical: 10, fontSize: 14, fontFamily: FontFamily.dmSansRegular, color: Colors.ink },
  bodyInput:  { backgroundColor: Colors.background, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 13, paddingVertical: 10, fontSize: 14, fontFamily: FontFamily.dmSansRegular, color: Colors.ink, minHeight: 80, textAlignVertical: 'top' },
  postBtn:    { backgroundColor: Colors.brand, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 16 },
  postBtnTxt: { color: '#fff', fontSize: 15, fontFamily: FontFamily.soraSemiBold },
  autoAnswerNote: { fontSize: 11.5, fontFamily: FontFamily.dmSansRegular, color: Colors.muted, textAlign: 'center', marginTop: 10 },
});
