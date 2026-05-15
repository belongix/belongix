/**
 * Belongix — Auth Screen
 * Email/password + Google OAuth. Handles ?ref= referral codes from deep links.
 * Purple gradient, floating labels, smooth keyboard avoid.
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Alert, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../lib/supabase';
import { Colors, FontFamily, Spacing, Radius } from '../lib/theme';

WebBrowser.maybeCompleteAuthSession();

/** Award referral bonus after successful signup */
async function refProcessOnSignup(newUserId: string | null) {
  if (!newUserId) return;
  try {
    const code = await AsyncStorage.getItem('bx_ref_code');
    if (!code) return;

    // Find referrer by ID prefix match
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, career_score')
      .ilike('id', `${code}%`)
      .limit(1);

    const referrer = profiles?.[0];
    if (!referrer || referrer.id === newUserId) return;

    // Insert referral record
    await supabase.from('referrals').insert({
      referrer_id: referrer.id,
      referred_id: newUserId,
      created_at:  new Date().toISOString(),
    });

    // Award +10 to referrer
    await supabase.from('profiles').update({
      career_score: Math.min(100, (referrer.career_score ?? 30) + 10),
    }).eq('id', referrer.id);

    // Set new user score to 40
    await supabase.from('profiles').update({ career_score: 40 }).eq('id', newUserId);

    // Clear code
    await AsyncStorage.removeItem('bx_ref_code');
  } catch {
    // Silent — never block signup
  }
}

export default function AuthScreen() {
  const [mode, setMode]       = useState<'signin' | 'signup'>('signup');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [name, setName]       = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const passRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() || email.split('@')[0] } },
        });
        if (error) throw error;

        // Create profile row
        if (data.user) {
          await supabase.from('profiles').upsert({
            id:           data.user.id,
            email:        email.trim(),
            full_name:    name.trim() || email.split('@')[0],
            career_score: 30,
            plan:         'free',
            created_at:   new Date().toISOString(),
            updated_at:   new Date().toISOString(),
          });
          // Process referral
          await refProcessOnSignup(data.user.id);
        }

        Alert.alert('✅ Account created!', 'Check your email to confirm your account, then sign in.');
        setMode('signin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        // AppNavigator listens to onAuthStateChange — no manual nav needed
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Authentication failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'belongix://auth' },
      });
      if (error) throw error;
    } catch (e: unknown) {
      Alert.alert('Google sign-in failed', e instanceof Error ? e.message : 'Try email sign-in instead.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[Colors.brand, Colors.brand2, '#3D2490']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoWrap}>
            <Text style={styles.logo}>
              <Text style={styles.logoWhite}>Belong</Text>
              <Text style={styles.logoAccent}>ix</Text>
            </Text>
            <Text style={styles.tagline}>India's Career Platform</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Tab switcher */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, mode === 'signup' && styles.tabActive]}
                onPress={() => setMode('signup')}
              >
                <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
                  Create Account
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, mode === 'signin' && styles.tabActive]}
                onPress={() => setMode('signin')}
              >
                <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

            {/* Name (signup only) */}
            {mode === 'signup' && (
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  ref={nameRef}
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Arjun Sharma"
                  placeholderTextColor={Colors.muted}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => passRef.current?.focus()}
                />
              </View>
            )}

            {/* Email */}
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@email.com"
                placeholderTextColor={Colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passRef.current?.focus()}
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passRow}>
                <TextInput
                  ref={passRef}
                  style={[styles.input, styles.passInput]}
                  value={password}
                  onChangeText={setPass}
                  placeholder={mode === 'signup' ? 'Create password (min 6 chars)' : 'Your password'}
                  placeholderTextColor={Colors.muted}
                  secureTextEntry={!showPass}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  returnKeyType="done"
                  onSubmitEditing={handleAuth}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
                  <Ionicons name={showPass ? 'eye-off' : 'eye'} size={20} color={Colors.muted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary button */}
            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {mode === 'signup' ? 'Create Free Account →' : 'Sign In →'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.orLine} />
            </View>

            {/* Google */}
            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Fine print */}
            <Text style={styles.finePrint}>
              By continuing, you agree to Belongix's{' '}
              <Text style={styles.link}>Terms of Service</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>.
            </Text>
          </View>

          {/* Trust row */}
          <View style={styles.trust}>
            {['🔒 Secure', '🇮🇳 Made in India', '⚡ Free forever'].map((t) => (
              <Text key={t} style={styles.trustItem}>{t}</Text>
            ))}
          </View>

        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:            { flex: 1 },
  gradient:        { flex: 1 },
  scroll:          { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingTop: 60, paddingBottom: 32 },
  logoWrap:        { alignItems: 'center', marginBottom: 32 },
  logo:            { fontSize: 40, fontFamily: FontFamily.soraBlack, letterSpacing: -1 },
  logoWhite:       { color: Colors.white },
  logoAccent:      { color: Colors.orange },
  tagline:         { fontFamily: FontFamily.dmSans, fontSize: 15, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  card:            { backgroundColor: Colors.white, borderRadius: 22, padding: Spacing.xl, marginBottom: Spacing.lg },
  tabs:            { flexDirection: 'row', backgroundColor: Colors.off, borderRadius: 10, padding: 3, marginBottom: Spacing.lg },
  tab:             { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive:       { backgroundColor: Colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2 },
  tabText:         { fontFamily: FontFamily.dmSansMed, fontSize: 13.5, color: Colors.muted },
  tabTextActive:   { fontFamily: FontFamily.dmSansSemi, color: Colors.brand },
  inputWrap:       { marginBottom: Spacing.md },
  inputLabel:      { fontFamily: FontFamily.dmSansSemi, fontSize: 11, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 },
  input:           { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 11, fontFamily: FontFamily.dmSans, fontSize: 14, color: Colors.ink, backgroundColor: Colors.bg },
  passRow:         { position: 'relative' },
  passInput:       { paddingRight: 44 },
  eyeBtn:          { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  primaryBtn:      { backgroundColor: Colors.brand, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText:  { fontFamily: FontFamily.soraBold, fontSize: 15, color: Colors.white },
  orRow:           { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: Spacing.md },
  orLine:          { flex: 1, height: 1, backgroundColor: Colors.border },
  orText:          { fontFamily: FontFamily.dmSans, fontSize: 12, color: Colors.muted },
  googleBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingVertical: 12 },
  googleIcon:      { fontFamily: FontFamily.soraBold, fontSize: 16, color: '#4285F4' },
  googleText:      { fontFamily: FontFamily.dmSansSemi, fontSize: 14, color: Colors.ink },
  finePrint:       { fontFamily: FontFamily.dmSans, fontSize: 11.5, color: Colors.muted, textAlign: 'center', marginTop: Spacing.md, lineHeight: 18 },
  link:            { color: Colors.brand, textDecorationLine: 'underline' },
  trust:           { flexDirection: 'row', justifyContent: 'center', gap: 20, flexWrap: 'wrap' },
  trustItem:       { fontFamily: FontFamily.dmSans, fontSize: 12, color: 'rgba(255,255,255,0.65)' },
});
