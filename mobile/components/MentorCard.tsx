// components/MentorCard.tsx

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors, FontFamily, Shadow } from '../lib/theme';
import type { Mentor } from '../lib/supabase';

interface Props { mentor: Mentor; onBook: (m: Mentor) => void; }

export default memo(function MentorCard({ mentor: m, onBook }: Props) {
  return (
    <View style={s.card}>
      <View style={s.top}>
        <View style={[s.avatar, { backgroundColor: m.avatar_color }]}>
          <Text style={s.avatarTxt}>{m.name.split(' ').map(w => w[0]).join('').slice(0,2)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{m.name}</Text>
          <Text style={s.role}>{m.role} · {m.company}</Text>
          <View style={s.ratingRow}>
            <Text style={s.rating}>⭐ {m.rating}</Text>
            <Text style={s.sessions}>· {m.session_count} sessions</Text>
          </View>
        </View>
        <View>
          <Text style={s.price}>₹{m.price_30}</Text>
          <Text style={s.priceSub}>/ 30 min</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tags}>
        {(m.tags ?? []).map(t => (
          <View key={t} style={s.tag}><Text style={s.tagTxt}>{t}</Text></View>
        ))}
      </ScrollView>
      {m.review_quote && (
        <View style={s.review}>
          <Text style={s.reviewQ}>"{m.review_quote}"</Text>
          <Text style={s.reviewA}>— {m.review_author}</Text>
        </View>
      )}
      <TouchableOpacity style={s.bookBtn} onPress={() => onBook(m)}>
        <Text style={s.bookTxt}>Book Session →</Text>
      </TouchableOpacity>
    </View>
  );
});

const s = StyleSheet.create({
  card:     { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  top:      { flexDirection: 'row', gap: 12, marginBottom: 10 },
  avatar:   { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:{ color: '#fff', fontSize: 16, fontFamily: FontFamily.soraSemiBold },
  name:     { fontSize: 15, fontFamily: FontFamily.soraSemiBold, color: Colors.ink },
  role:     { fontSize: 12, fontFamily: FontFamily.dmSansRegular, color: Colors.muted, marginTop: 2 },
  ratingRow:{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  rating:   { fontSize: 12.5, fontFamily: FontFamily.soraSemiBold, color: Colors.amber },
  sessions: { fontSize: 12, fontFamily: FontFamily.dmSansRegular, color: Colors.muted },
  price:    { fontSize: 16, fontFamily: FontFamily.soraExtraBold, color: Colors.brand, textAlign: 'right' },
  priceSub: { fontSize: 10.5, fontFamily: FontFamily.dmSansRegular, color: Colors.muted, textAlign: 'right' },
  tags:     { gap: 6, marginBottom: 10 },
  tag:      { backgroundColor: Colors.off, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  tagTxt:   { fontSize: 11.5, fontFamily: FontFamily.dmSansMedium, color: Colors.brand },
  review:   { backgroundColor: Colors.background, borderRadius: 10, padding: 10, marginBottom: 10 },
  reviewQ:  { fontSize: 12.5, fontFamily: FontFamily.dmSansRegular, color: Colors.ink, fontStyle: 'italic', lineHeight: 19 },
  reviewA:  { fontSize: 11, fontFamily: FontFamily.dmSansMedium, color: Colors.muted, marginTop: 4 },
  bookBtn:  { backgroundColor: Colors.brand, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  bookTxt:  { color: '#fff', fontSize: 13.5, fontFamily: FontFamily.soraSemiBold },
});
