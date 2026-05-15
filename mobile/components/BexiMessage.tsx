// components/BexiMessage.tsx — Chat bubbles (user right / bot left)

import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, FontFamily, Shadow } from '../lib/theme';
import type { ChatMessage } from '../store/bexiStore';

export default memo(function BexiMessage({ message }: { message: ChatMessage }) {
  const isBot = message.role === 'bot';
  return (
    <View style={[s.row, isBot ? s.rowBot : s.rowUser]}>
      {isBot && <View style={s.avatar}><Text style={{ fontSize: 16 }}>🤖</Text></View>}
      <View style={[s.bubble, isBot ? s.bubbleBot : s.bubbleUser]}>
        <FormattedText text={message.content} isBot={isBot} />
        <Text style={[s.time, isBot ? s.timeBot : s.timeUser]}>
          {message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
        </Text>
      </View>
    </View>
  );
});

function FormattedText({ text, isBot }: { text: string; isBot: boolean }) {
  const baseColor = isBot ? Colors.ink : '#fff';
  return (
    <View>
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <View key={i} style={{ height: 5 }} />;
        if (line.startsWith('**') && line.endsWith('**') && line.slice(2,-2).indexOf('**') < 0)
          return <Text key={i} style={[s.bold, { color: isBot ? Colors.brand : '#fff' }]}>{line.slice(2,-2)}</Text>;
        if (line.startsWith('- ') || line.startsWith('• '))
          return (
            <View key={i} style={s.bullet}>
              <Text style={{ color: isBot ? Colors.brand : 'rgba(255,255,255,0.8)', fontSize: 14 }}>•</Text>
              <Text style={[s.msg, { color: baseColor }]}>{renderInline(line.replace(/^[-•]\s/,''), baseColor)}</Text>
            </View>
          );
        return <Text key={i} style={[s.msg, { color: baseColor }]}>{renderInline(line, baseColor)}</Text>;
      })}
    </View>
  );
}

function renderInline(text: string, color: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <Text key={i} style={{ fontFamily: FontFamily.dmSansSemiBold, color }}>{p.slice(2,-2)}</Text>
      : p
  );
}

const s = StyleSheet.create({
  row:     { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-end', gap: 8 },
  rowBot:  { justifyContent: 'flex-start' },
  rowUser: { justifyContent: 'flex-end' },
  avatar:  { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.off, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 2 },
  bubble:  { maxWidth: '82%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleBot:  { backgroundColor: Colors.white, borderBottomLeftRadius: 4, borderLeftWidth: 3, borderLeftColor: Colors.brand, ...Shadow.sm },
  bubbleUser: { backgroundColor: Colors.brand, borderBottomRightRadius: 4 },
  msg:    { fontSize: 14, fontFamily: FontFamily.dmSansRegular, lineHeight: 21 },
  bold:   { fontSize: 14, fontFamily: FontFamily.soraSemiBold, marginVertical: 2 },
  bullet: { flexDirection: 'row', gap: 6, marginBottom: 2 },
  time:   { fontSize: 10, marginTop: 5 },
  timeBot:  { color: Colors.muted, fontFamily: FontFamily.dmSansRegular },
  timeUser: { color: 'rgba(255,255,255,0.6)', textAlign: 'right', fontFamily: FontFamily.dmSansRegular },
});
