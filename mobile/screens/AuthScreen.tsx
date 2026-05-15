import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontFamily } from '../lib/theme';
import { supabase } from '../lib/supabase';
export default function AuthScreen({ navigation }: any) {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleAuth = async () => {
    if (!email.trim() || !password) { Alert.alert('Please fill in email and password'); return; }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        Alert.alert('Check your email', 'Click the confirmation link to activate your account.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <LinearGradient colors={[Colors.brand, Colors.brand2]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
            <View style={s.logoWrap}>
              <Text style={s.logo}>Belong<Text style={s.accent}>ix</Text></Text>
              <Text style={s.tagline}>India Career Platform</Text>
            </View>
            <View style={s.card}>
              <View style={s.tabs}>
                {(['signup', 'signin'] as const).map(m => (
                  <TouchableOpacity key={m} style={[s.tab, mode === m && s.tabActive]} onPress={() => setMode(m)}>
                    <Text style={[s.tabTxt, mode === m && s.tabTxtActive]}>{m === 'signup' ? 'Create Account' : 'Sign In'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput style={s.input} placeholder="Email address" placeholderTextColor={Colors.muted}
                value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
              <TextInput style={s.input} placeholder="Password" placeholderTextColor={Colors.muted}
                value={password} onChangeText={setPassword} secureTextEntry />
              <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={handleAuth} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>{mode === 'signup' ? 'Create Account' : 'Sign In'}</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
const s = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 },
  logoWrap: { alignItems: 'center', paddingTop: 60, marginBottom: 32 },
  logo: { fontSize: 38, fontWeight: '800', color: '#fff' },
  accent: { color: Colors.orange },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.72)', marginTop: 4 },
  card: { backgroundColor: Colors.white, borderRadius: 22, padding: 24 },
  tabs: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 10, padding: 3, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: Colors.white },
  tabTxt: { fontSize: 13, color: Colors.muted },
  tabTxtActive: { color: Colors.brand, fontWeight: '600' },
  input: { backgroundColor: '#F8FAFC', borderRadius: 11, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: Colors.ink, marginBottom: 12 },
  btn: { backgroundColor: Colors.brand, borderRadius: 11, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
