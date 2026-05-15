import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, companyColor } from '../lib/theme';

const MENTORS = [
  { id:'1', name:'Rahul Sharma',  role:'Engineering Manager', company:'Google',    exp:'8 yrs',  rating:4.9, reviews:42, price:999,  tags:['System Design','FAANG Prep','Leadership'] },
  { id:'2', name:'Priya Nair',    role:'Senior PM',           company:'Razorpay',  exp:'6 yrs',  rating:4.8, reviews:31, price:799,  tags:['Product Strategy','Interviews','Roadmap'] },
  { id:'3', name:'Vikram Singh',  role:'Data Scientist',      company:'PhonePe',   exp:'5 yrs',  rating:4.9, reviews:28, price:699,  tags:['ML','Python','SQL','Analytics'] },
  { id:'4', name:'Ananya Reddy',  role:'SWE-3',               company:'Microsoft', exp:'7 yrs',  rating:4.7, reviews:19, price:899,  tags:['DSA','React','Backend','Resume'] },
  { id:'5', name:'Arjun Mehta',   role:'VP Engineering',      company:'CRED',      exp:'12 yrs', rating:5.0, reviews:15, price:1499, tags:['Leadership','Startup','Hiring'] },
  { id:'6', name:'Sneha Iyer',    role:'UX Lead',             company:'Swiggy',    exp:'6 yrs',  rating:4.8, reviews:23, price:599,  tags:['UI/UX','Figma','Portfolio'] },
];

const FILTERS = ['All','Engineering','Product','Design','Data'];

export default function MentorsScreen({ navigation }: any) {
  const [filter, setFilter] = useState('All');
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Ionicons name="arrow-back" size={20} color="#111" />
        </TouchableOpacity>
        <Text style={s.title}>1-on-1 Mentors</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} style={[s.chip, filter===f && s.chipOn]} onPress={() => setFilter(f)}>
            <Text style={[s.chipTxt, filter===f && s.chipTxtOn]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>
        {MENTORS.map(m => (
          <View key={m.id} style={s.card}>
            <View style={s.cardTop}>
              <View style={[s.avatar, { backgroundColor: companyColor(m.name) }]}>
                <Text style={s.avatarTxt}>{m.name.split(' ').map((n: string) => n[0]).join('')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{m.name}</Text>
                <Text style={s.role}>{m.role} at {m.company}</Text>
                <View style={s.ratingRow}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={s.rating}>{m.rating}</Text>
                  <Text style={s.reviews}>({m.reviews} reviews)</Text>
                  <Text style={s.exp}>· {m.exp} exp</Text>
                </View>
              </View>
              <View style={s.priceWrap}>
                <Text style={s.price}>Rs.{m.price}</Text>
                <Text style={s.per}>/session</Text>
              </View>
            </View>
            <View style={s.tags}>
              {m.tags.map(t => (
                <View key={t} style={s.tag}><Text style={s.tagTxt}>{t}</Text></View>
              ))}
            </View>
            <TouchableOpacity style={s.bookBtn}
              onPress={() => Alert.alert('Book Session', 'Booking available on belongix.in — full mentor booking with payments coming to app soon!')}>
              <Ionicons name="calendar-outline" size={14} color="#fff" />
              <Text style={s.bookTxt}>Book 30-min Session · Rs.{m.price}</Text>
            </TouchableOpacity>
          </View>
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
  title:      { fontSize: 17, fontWeight: '700', color: '#111827' },
  filters:    { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  chip:       { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB' },
  chipOn:     { backgroundColor: Colors.brand, borderColor: Colors.brand },
  chipTxt:    { fontSize: 12.5, fontWeight: '600', color: '#6B7280' },
  chipTxtOn:  { color: '#fff' },
  list:       { padding: 16, gap: 12 },
  card:       { backgroundColor: '#fff', borderRadius: 14, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTop:    { flexDirection: 'row', gap: 12, marginBottom: 10 },
  avatar:     { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:  { color: '#fff', fontSize: 14, fontWeight: '700' },
  name:       { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 2 },
  role:       { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  ratingRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating:     { fontSize: 12, fontWeight: '700', color: '#F59E0B' },
  reviews:    { fontSize: 11, color: '#9CA3AF' },
  exp:        { fontSize: 11, color: '#9CA3AF' },
  priceWrap:  { alignItems: 'flex-end' },
  price:      { fontSize: 15, fontWeight: '800', color: Colors.brand },
  per:        { fontSize: 10, color: '#9CA3AF' },
  tags:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag:        { backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagTxt:     { fontSize: 11, fontWeight: '600', color: '#374151' },
  bookBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.brand, borderRadius: 10, paddingVertical: 11 },
  bookTxt:    { color: '#fff', fontSize: 13, fontWeight: '700' },
});
