/**
 * Belongix — Bexi AI Screen
 * The hero feature. Full chat UI with profile-aware AI,
 * conversation memory, quick chips, resume upload, and mock interview mode.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Keyboard,
  ScrollView, SafeAreaView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';

import { Colors, FontFamily, Spacing, Radius, Shadow } from '../lib/theme';
import { askBexi } from '../lib/claude';
import { useAuthStore } from '../store/authStore';
import { useBexiStore, ChatMessage } from '../store/bexiStore';
import BexiMessage from '../components/BexiMessage';

// ── Quick chip data ─────────────────────────────────────────────────────────
const QUICK_CHIPS = [
  { label: "💰 My market salary",    query: "What's my current market salary for my role and city?" },
  { label: "📄 Review my resume",    query: "I'd like a detailed resume critique. What are the key areas to improve?" },
  { label: "🎯 Get into product",    query: "How do I transition into product management from my current role?" },
  { label: "💼 System design prep",  query: "How should I prepare for system design interviews? Give me a study plan." },
  { label: "🤝 Negotiate my offer",  query: "I want to negotiate my job offer. How do I approach this?" },
  { label: "🧠 Mock interview",      query: "__START_MOCK_INTERVIEW__" },
];

// ── Interview state ──────────────────────────────────────────────────────────
interface InterviewState {
  active:    boolean;
  company:   string;
  role:      string;
  round:     string;
  question:  number;
  scores:    number[];
}

export default function BexiScreen() {
  const { profile, user } = useAuthStore();
  const { messages, isTyping, addMessage, setTyping, loadHistory, saveMessage, clearHistory } = useBexiStore();

  const [input, setInput]           = useState('');
  const [nudgeDismissed, setNudge]  = useState(false);
  const [ivState, setIv]            = useState<InterviewState>({
    active: false, company: '', role: '', round: 'Technical', question: 0, scores: [],
  });
  const [ivSetupStep, setIvSetup]   = useState<'company' | 'role' | 'round' | null>(null);

  const flatRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // Load conversation history from Supabase
  useEffect(() => {
    if (user) loadHistory(user.id);
  }, [user]);

  // Show Pro nudge after 8 seconds
  useEffect(() => {
    const t = setTimeout(() => setNudge(false), 8000);
    return () => clearTimeout(t);
  }, []);

  // Welcome message on first open
  useEffect(() => {
    if (messages.length === 0) {
      const name = profile?.full_name?.split(' ')[0] ?? 'there';
      addMessage({
        role:    'assistant',
        content: `Hi ${name}! 👋 I'm Bexi, your AI career guide.\n\nI know India's job market inside out — salary data, interview patterns, career switches, negotiation tactics. Ask me anything. No limits, forever free.\n\nWhat can I help you with today?`,
      });
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (text?: string) => {
    const query = (text ?? input).trim();
    if (!query) return;

    Keyboard.dismiss();
    setInput('');

    // Handle mock interview trigger
    if (query === '__START_MOCK_INTERVIEW__') {
      startInterviewSetup();
      return;
    }

    // Handle interview setup steps
    if (ivSetupStep) {
      handleInterviewSetup(query);
      return;
    }

    // Add user message
    addMessage({ role: 'user', content: query });
    if (user) saveMessage(user.id, 'user', query);

    setTyping(true);
    flatRef.current?.scrollToEnd({ animated: true });

    try {
      // Build message history for Claude (last 10 exchanges)
      const history = messages.slice(-20).map((m) => ({
        role:    m.role as 'user' | 'assistant',
        content: m.content,
      }));
      history.push({ role: 'user', content: query });

      const reply = await askBexi(history, profile);
      addMessage({ role: 'assistant', content: reply });
      if (user) saveMessage(user.id, 'assistant', reply);
    } catch {
      addMessage({
        role:    'assistant',
        content: "I'm having trouble connecting right now. Please check your internet and try again. I'm here 24/7 when you're back online! 🌐",
      });
    } finally {
      setTyping(false);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, messages, ivSetupStep, profile, user]);

  // ── Mock Interview flow ───────────────────────────────────────────────────
  const startInterviewSetup = () => {
    addMessage({
      role:    'assistant',
      content: "🎯 **Mock Interview Setup**\n\nLet's do a real mock interview! I'll evaluate your answers and give you detailed feedback.\n\nWhich **company** are you targeting? (e.g. Google, Swiggy, Flipkart)",
    });
    setIvSetup('company');
  };

  const handleInterviewSetup = (text: string) => {
    addMessage({ role: 'user', content: text });
    if (ivSetupStep === 'company') {
      setIv((s) => ({ ...s, company: text }));
      addMessage({ role: 'assistant', content: `Great choice — ${text}! Now, which **role** are you interviewing for?` });
      setIvSetup('role');
    } else if (ivSetupStep === 'role') {
      setIv((s) => ({ ...s, role: text }));
      addMessage({
        role:    'assistant',
        content: `Perfect — ${text} at ${ivState.company}.\n\nWhich round?\n• **Technical** (coding/system design)\n• **HR** (behavioural/culture)\n• **Managerial** (leadership/case study)`,
      });
      setIvSetup('round');
    } else if (ivSetupStep === 'round') {
      setIv((s) => ({ ...s, round: text, active: true, question: 1 }));
      setIvSetup(null);
      askFirstQuestion(ivState.company, ivState.role, text);
    }
  };

  const askFirstQuestion = async (company: string, role: string, round: string) => {
    setTyping(true);
    try {
      const prompt = `You are interviewing for ${role} at ${company}. Round: ${round}. Ask the first question only. Keep it realistic for an Indian tech company. Just the question — no preamble.`;
      const q = await askBexi([{ role: 'user', content: prompt }], null);
      addMessage({ role: 'assistant', content: `**Question 1/5:**\n\n${q}` });
    } catch {
      addMessage({ role: 'assistant', content: "**Question 1/5:**\n\nTell me about yourself and your most impactful project in the last year." });
    } finally {
      setTyping(false);
    }
  };

  // ── Resume upload ─────────────────────────────────────────────────────────
  const handleResumeUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'text/plain'],
      });
      if (result.canceled) return;

      const file = result.assets[0];
      addMessage({ role: 'user', content: `📄 Uploaded resume: ${file.name}` });
      setTyping(true);

      const reply = await askBexi(
        [{ role: 'user', content: `I've uploaded my resume (${file.name}). Please give me:\n1. ATS Score /100\n2. Top 3 Strengths\n3. Top 5 Improvements with specific rewrites\n4. Missing keywords for my target role\n5. Recommended next action` }],
        profile
      );
      addMessage({ role: 'assistant', content: reply });
    } catch (e: unknown) {
      Alert.alert('Upload failed', 'Please try uploading a PDF or text file.');
    } finally {
      setTyping(false);
    }
  };

  // ── Voice input ───────────────────────────────────────────────────────────
  const handleVoice = () => {
    Alert.alert('Voice Input', 'Speak your question', [
      { text: 'Cancel', style: 'cancel' },
    ]);
    // Expo Speech is TTS only — for STT, integrate Whisper or native STT
  };

  // ── Clear chat ────────────────────────────────────────────────────────────
  const handleClear = () => {
    Alert.alert('Clear Chat', 'This will delete your conversation history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          if (user) clearHistory(user.id);
          setIv({ active: false, company: '', role: '', round: 'Technical', question: 0, scores: [] });
          setIvSetup(null);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🤖 Bexi AI</Text>
          <Text style={styles.headerSub}>Career Guide · Unlimited & Free</Text>
        </View>
        <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>

      {/* ── Pro nudge (dismissible, shows once) ── */}
      {!nudgeDismissed && (
        <View style={styles.nudge}>
          <Text style={styles.nudgeText}>🤝 Want personalised 1-on-1 guidance? Book a mentor session.</Text>
          <TouchableOpacity onPress={() => setNudge(true)}>
            <Ionicons name="close" size={16} color={Colors.brand} />
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* ── Messages ── */}
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <BexiMessage message={item} />}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingRow}>
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color={Colors.brand} />
                  <Text style={styles.typingText}>Bexi is thinking...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* ── Quick chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          keyboardShouldPersistTaps="handled"
        >
          {QUICK_CHIPS.map((chip) => (
            <TouchableOpacity
              key={chip.label}
              style={styles.chip}
              onPress={() => sendMessage(chip.query)}
            >
              <Text style={styles.chipText}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Input bar ── */}
        <View style={styles.inputBar}>
          {/* Attachment */}
          <TouchableOpacity style={styles.iconBtn} onPress={handleResumeUpload}>
            <Ionicons name="attach" size={22} color={Colors.muted} />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Ask Bexi anything..."
            placeholderTextColor={Colors.muted}
            multiline
            maxLength={1000}
            onSubmitEditing={() => sendMessage()}
            returnKeyType="send"
          />

          {/* Voice */}
          <TouchableOpacity style={styles.iconBtn} onPress={handleVoice}>
            <Ionicons name="mic-outline" size={22} color={Colors.muted} />
          </TouchableOpacity>

          {/* Send */}
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.brand },
  flex:         { flex: 1, backgroundColor: Colors.bg },
  header:       { backgroundColor: Colors.brand, paddingHorizontal: Spacing.lg, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:  { fontFamily: FontFamily.soraBold, fontSize: 18, color: Colors.white },
  headerSub:    { fontFamily: FontFamily.dmSans, fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  nudge:        { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.off, paddingHorizontal: Spacing.lg, paddingVertical: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  nudgeText:    { flex: 1, fontFamily: FontFamily.dmSans, fontSize: 12.5, color: Colors.brand },
  messagesList: { padding: Spacing.md, paddingBottom: Spacing.sm },
  typingRow:    { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.white, paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.lg, alignSelf: 'flex-start', ...Shadow.sm },
  typingText:   { fontFamily: FontFamily.dmSans, fontSize: 13, color: Colors.muted, fontStyle: 'italic' },
  chips:        { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: 8 },
  chip:         { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 7 },
  chipText:     { fontFamily: FontFamily.dmSansMed, fontSize: 12.5, color: Colors.ink, whiteSpace: 'nowrap' },
  inputBar:     { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border, gap: 4 },
  iconBtn:      { padding: 8, justifyContent: 'center', alignItems: 'center' },
  textInput:    { flex: 1, fontFamily: FontFamily.dmSans, fontSize: 14, color: Colors.ink, maxHeight: 100, paddingVertical: Platform.OS === 'ios' ? 10 : 8, paddingHorizontal: 4 },
  sendBtn:      { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: Colors.border },
});
