import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontFamily } from '../lib/theme';
import { useAuthStore } from '../store/authStore';
interface Message { id: string; role: 'user' | 'bot'; text: string; }
const CHIPS = ["What is my market salary?","How do I get into product?","Crack system design","Negotiate my offer","Review my resume"];
export default function BexiScreen() {
  const { profile } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 800, system: 'You are Bexi, AI career guide for Belongix India. Give specific actionable advice.', messages: [{ role: 'user', content: msg }] }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text ?? 'Connection issue. Please try again.';
      setMessages(prev => [...prev, { id: Date.now().toString() + 'b', role: 'bot', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString() + 'e', role: 'bot', text: 'Connection issue. Please try again.' }]);
    } finally { setLoading(false); }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.brand }}>
      <View style={{ paddingHorizontal: 20, paddingVertical: 14 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>Bexi AI</Text>
        <Text style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.65)' }}>Career Guide - Unlimited and Free</Text>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList data={messages} keyExtractor={m => m.id} contentContainerStyle={{ padding: 14, flexGrow: 1, backgroundColor: Colors.background }}
          ListEmptyComponent={<View style={{ alignItems: 'center', paddingTop: 48 }}><Text style={{ fontSize: 48, marginBottom: 14 }}>🤖</Text><Text style={{ fontSize: 20, fontWeight: '700', color: Colors.brand, marginBottom: 8 }}>Hi! I am Bexi.</Text><Text style={{ fontSize: 14, color: Colors.muted, textAlign: 'center' }}>Your AI career guide for India job market. Ask me anything!</Text></View>}
          ListFooterComponent={loading ? <ActivityIndicator color={Colors.brand} style={{ padding: 16 }} /> : null}
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row', marginBottom: 10, justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <Text style={{ maxWidth: '80%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, lineHeight: 21, backgroundColor: item.role === 'user' ? Colors.brand : Colors.white, color: item.role === 'user' ? '#fff' : Colors.ink }}>{item.text}</Text>
            </View>
          )} />
        <FlatList horizontal data={CHIPS} keyExtractor={c => c} showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: Colors.white }}
          renderItem={({ item }) => (
            <TouchableOpacity style={{ backgroundColor: Colors.off, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1.5, borderColor: Colors.border }} onPress={() => send(item)}>
              <Text style={{ fontSize: 12.5, color: Colors.ink }}>{item}</Text>
            </TouchableOpacity>
          )} />
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border }}>
          <TextInput style={{ flex: 1, backgroundColor: Colors.background, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: Colors.ink, maxHeight: 120, borderWidth: 1.5, borderColor: Colors.border }} value={input} onChangeText={setInput} placeholder="Ask Bexi anything..." placeholderTextColor={Colors.muted} multiline />
          <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: input.trim() ? Colors.brand : Colors.border, alignItems: 'center', justifyContent: 'center' }} onPress={() => send()} disabled={!input.trim() || loading}>
            <Text style={{ color: '#fff', fontSize: 18 }}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
