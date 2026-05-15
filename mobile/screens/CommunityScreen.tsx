import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, companyColor } from '../lib/theme';

const POSTS = [
  { id:'1', author:'Rahul S.',  role:'SWE at Google',    time:'2h ago', q:'How do I negotiate a 40% hike when switching companies?',                    answers:12, likes:34, tag:'Salary'     },
  { id:'2', author:'Priya N.',  role:'PM at Razorpay',   time:'4h ago', q:'Best resources to crack product management interviews in 2025?',              answers:8,  likes:21, tag:'Interviews'  },
  { id:'3', author:'Arjun M.',  role:'SDE2 at Swiggy',   time:'1d ago', q:'Is it worth doing an MBA from IIM after 5 years of experience?',             answers:19, likes:45, tag:'Career'      },
  { id:'4', author:'Sneha I.',  role:'Designer at CRED',  time:'1d ago', q:'How to build a portfolio that gets you hired at top product companies?',     answers:7,  likes:18, tag:'Design'      },
  { id:'5', author:'Vikram S.', role:'DS at PhonePe',    time:'2d ago', q:'Which ML certifications are actually valued by Indian companies?',            answers:14, likes:29, tag:'Learning'    },
];

const TAGS = ['All','Salary','Interviews','Career','Learning','Design'];

export default function CommunityScreen({ navigation }: any) {
  const [tag,    setTag]    = useState('All');
  const [asking, setAsking] = useState(false);
  const [q,      setQ]      = useState('');
  const filtered = POSTS.filter(p => tag === 'All' || p.tag === tag);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Ionicons name="arrow-back" size={20} color="#111" />
        </TouchableOpacity>
        <Text style={s.title}>Community Q&A</Text>
        <TouchableOpacity style={s.askBtn} onPress={() => setAsking(true)}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={s.askBtnTxt}>Ask</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tagRow}>
        {TAGS.map(t => (
          <TouchableOpacity key={t} style={[s.chip, tag===t && s.chipOn]} onPress={() => setTag(t)}>
            <Text style={[s.chipTxt, tag===t && s.chipTxtOn]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {asking && (
        <View style={s.askBox}>
          <TextInput style={s.askInput} placeholder="Ask your career question..."
            placeholderTextColor="#9CA3AF" value={q} onChangeText={setQ} multiline />
          <View style={s.askRow}>
            <TouchableOpacity style={s.cancelBtn} onPress={() => { setAsking(false); setQ(''); }}>
              <Text style={s.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.postBtn}
              onPress={() => { Alert.alert('Posted!', 'Your question is live.'); setAsking(false); setQ(''); }}>
              <Text style={s.postTxt}>Post Question</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>
        {filtered.map(p => (
          <TouchableOpacity key={p.id} style={s.card} activeOpacity={0.88}>
            <View style={s.cardTop}>
              <View style={[s.avatar, { backgroundColor: companyColor(p.author) }]}>
                <Text style={s.avatarTxt}>{p.author[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.author}>{p.author}</Text>
                <Text style={s.role}>{p.role} · {p.time}</Text>
              </View>
              <View style={[s.tagPill, { backgroundColor: Colors.brand + '15' }]}>
                <Text style={[s.tagPillTxt, { color: Colors.brand }]}>{p.tag}</Text>
              </View>
            </View>
            <Text style={s.question}>{p.q}</Text>
            <View style={s.cardBottom}>
              <View style={s.stat}>
                <Ionicons name="chatbubble-outline" size={13} color="#9CA3AF" />
                <Text style={s.statTxt}>{p.answers} answers</Text>
              </View>
              <View style={s.stat}>
                <Ionicons name="heart-outline" size={13} color="#9CA3AF" />
                <Text style={s.statTxt}>{p.likes}</Text>
              </View>
              <TouchableOpacity style={s.answerBtn}
                onPress={() => Alert.alert('Answer', 'Full answer editor coming soon!')}>
                <Text style={s.answerTxt}>Answer</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#F3F2F7' },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  back:       { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  title:      { fontSize: 17, fontWeight: '700', color: '#111827', flex: 1 },
  askBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.brand, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  askBtnTxt:  { color: '#fff', fontSize: 13, fontWeight: '700' },
  tagRow:     { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  chip:       { borderRadius: 20, paddingHorizontal: 13, paddingVertical: 6, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB' },
  chipOn:     { backgroundColor: Colors.brand, borderColor: Colors.brand },
  chipTxt:    { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  chipTxtOn:  { color: '#fff' },
  askBox:     { backgroundColor: '#fff', margin: 16, borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  askInput:   { fontSize: 13, color: '#111827', minHeight: 72, textAlignVertical: 'top', marginBottom: 10 },
  askRow:     { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  cancelBtn:  { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1.5, borderColor: '#E5E7EB' },
  cancelTxt:  { fontSize: 12.5, fontWeight: '600', color: '#6B7280' },
  postBtn:    { backgroundColor: Colors.brand, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 },
  postTxt:    { color: '#fff', fontSize: 12.5, fontWeight: '700' },
  list:       { padding: 16, gap: 10 },
  card:       { backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTop:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar:     { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:  { color: '#fff', fontSize: 13, fontWeight: '700' },
  author:     { fontSize: 13, fontWeight: '700', color: '#111827' },
  role:       { fontSize: 11, color: '#9CA3AF' },
  tagPill:    { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  tagPillTxt: { fontSize: 10.5, fontWeight: '700' },
  question:   { fontSize: 13.5, fontWeight: '600', color: '#1E293B', lineHeight: 20, marginBottom: 12 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stat:       { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statTxt:    { fontSize: 11.5, color: '#9CA3AF' },
  answerBtn:  { marginLeft: 'auto' as any, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 13, paddingVertical: 5 },
  answerTxt:  { fontSize: 12, fontWeight: '700', color: '#374151' },
});
