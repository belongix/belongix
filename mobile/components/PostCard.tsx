// components/PostCard.tsx — Community Q&A card (expandable)

import React, { memo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Shadow } from '../lib/theme';
import type { CommunityPost } from '../lib/supabase';

interface Props {
  post: CommunityPost;
  onUpvote: (id: string) => void;
  onAnswer: (id: string, text: string) => void;
}

export default memo(function PostCard({ post, onUpvote, onAnswer }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const tagColors: Record<string, string> = {
    Jobs: '#EEF0FF', Salary: '#ECFDF5', Resume: '#FEF9C3',
    Interviews: '#FEF2F2', Skills: '#F0F9FF', default: Colors.off,
  };

  return (
    <View style={s.card}>
      <View style={s.row}>
        {/* Upvote */}
        <TouchableOpacity style={s.upvote} onPress={() => onUpvote(post.id)}>
          <Ionicons name="arrow-up-outline" size={16} color={Colors.brand} />
          <Text style={s.upvoteN}>{post.upvotes}</Text>
        </TouchableOpacity>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <View style={s.tags}>
            {(post.tags ?? []).slice(0, 2).map(t => (
              <View key={t} style={[s.tag, { backgroundColor: tagColors[t] ?? tagColors.default }]}>
                <Text style={s.tagTxt}>{t}</Text>
              </View>
            ))}
          </View>
          <Text style={s.title}>{post.title}</Text>
          <Text style={s.meta}>
            {post.author_name} · {timeAgo(post.created_at)} · {post.answer_count} answers
            {post.is_bexi_answered ? '  🤖 Bexi answered' : ''}
          </Text>
        </View>

        <TouchableOpacity onPress={() => setExpanded(e => !e)}>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.muted} />
        </TouchableOpacity>
      </View>

      {expanded && (
        <View style={s.expanded}>
          {post.body ? <Text style={s.body}>{post.body}</Text> : null}
          <View style={s.answerInput}>
            <TextInput
              style={s.input}
              placeholder="Write your answer..."
              placeholderTextColor={Colors.muted}
              value={answerText}
              onChangeText={setAnswerText}
              multiline
            />
            <TouchableOpacity
              style={[s.postBtn, !answerText.trim() && s.postBtnDisabled]}
              disabled={!answerText.trim()}
              onPress={() => { onAnswer(post.id, answerText); setAnswerText(''); }}
            >
              <Text style={s.postBtnTxt}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
});

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const s = StyleSheet.create({
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 14, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  row:  { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  upvote: { alignItems: 'center', width: 32, paddingTop: 2 },
  upvoteN:{ fontSize: 12, fontFamily: FontFamily.soraSemiBold, color: Colors.brand, marginTop: 2 },
  tags: { flexDirection: 'row', gap: 6, marginBottom: 5 },
  tag:  { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  tagTxt:{ fontSize: 10.5, fontFamily: FontFamily.dmSansMedium, color: Colors.brand },
  title: { fontSize: 13.5, fontFamily: FontFamily.soraSemiBold, color: Colors.ink, lineHeight: 20, marginBottom: 4 },
  meta:  { fontSize: 11, fontFamily: FontFamily.dmSansRegular, color: Colors.muted },
  expanded: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  body:  { fontSize: 13.5, fontFamily: FontFamily.dmSansRegular, color: Colors.ink, lineHeight: 22, marginBottom: 12 },
  answerInput: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: Colors.background, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13.5, fontFamily: FontFamily.dmSansRegular, color: Colors.ink, minHeight: 44, maxHeight: 100 },
  postBtn: { backgroundColor: Colors.brand, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  postBtnDisabled: { opacity: 0.4 },
  postBtnTxt: { color: '#fff', fontSize: 13, fontFamily: FontFamily.soraSemiBold },
});
