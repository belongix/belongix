import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, getTier } from '../lib/theme';
import { useAuthStore } from '../store/authStore';

const ACTIONS = [
  { label:'Complete your profile',   pts:30, done:true,  icon:'person-outline',          href:'Profile' },
  { label:'Verify email address',    pts:10, done:true,  icon:'mail-outline',             href:null },
  { label:'Add 5+ skills',           pts:15, done:true,  icon:'code-outline',             href:'Profile' },
  { label:'Apply to 3 jobs',         pts:45, done:false, icon:'briefcase-outline',        href:'Jobs' },
  { label:'Complete a course',       pts:20, done:false, icon:'book-outline',             href:'Learn' },
  { label:'Get a mentor session',    pts:25, done:false, icon:'people-outline',           href:null },
  { label:'Join community Q&A',      pts:10, done:false, icon:'chatbubbles-outline',      href:null },
];

const HISTORY = [
  { label:'Profile completed',     pts:'+30', date:'May 10' },
  { label:'Email verified',        pts:'+10', date:'May 10' },
  { label:'Skills added',          pts:'+15', date:'May 11' },
  { label:'Applied to Swiggy',     pts:'+15', date:'May 12' },
  { label:'Applied to Razorpay',   pts:'+15', date:'May 13' },
  { label:'Referred a friend',     pts:'+10', date:'May 14' },
];

export default function CareerScoreScreen({ navigation }: any) {
  const { profile } = useAuthStore();
  const score = profile?.career_score ?? 30;
  const tier  = getTier(score);
  const nextTier = score<40?'Rising':score<60?'Strong':score<80?'Expert':'Max';
  const ptsLeft  = score<40?40-score:score<60?60-score:score<80?80-score:0;
  const pendingPts = ACTIONS.filter(a=>!a.done).reduce((s,a)=>s+a.pts,0);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Ionicons name="arrow-back" size={20} color="#111" />
        </TouchableOpacity>
        <Text style={s.title}>Career Score</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={['#1C0F4A','#2D1B69','#3D2A8A']}
          style={s.hero} start={{x:0,y:0}} end={{x:1,y:1}}>
          <Text style={s.heroScore}>{score}</Text>
          <Text style={s.heroOf}>/100</Text>
          <View style={[s.tierPill,{backgroundColor:tier.color+'28'}]}>
            <View style={[s.tierDot,{backgroundColor:tier.color}]}/>
            <Text style={[s.tierTxt,{color:tier.color}]}>{tier.label} Tier</Text>
          </View>
          <Text style={s.heroPct}>Better than {Math.min(95,score)}% of professionals</Text>
          {ptsLeft > 0 && (
            <View style={s.heroNext}>
              <Text style={s.heroNextTxt}>{ptsLeft} pts to {nextTier} tier</Text>
            </View>
          )}
          <View style={s.heroBar}>
            <View style={[s.heroBarFill,{width:`${score}%` as any}]}/>
          </View>
        </LinearGradient>

        {/* Unlock banner */}
        {pendingPts > 0 && (
          <View style={s.unlockBanner}>
            <Ionicons name="flash" size={16} color="#D97706"/>
            <Text style={s.unlockTxt}>Complete actions below to earn <Text style={{fontWeight:'800',color:'#D97706'}}>+{pendingPts} pts</Text></Text>
          </View>
        )}

        {/* Action plan */}
        <Text style={s.secTitle}>Action Plan</Text>
        {ACTIONS.map((a,i)=>(
          <TouchableOpacity key={i} style={s.actionRow}
            onPress={()=>{ if(a.href) navigation.navigate(a.href as any); }}
            disabled={a.done}>
            <View style={[s.actionIcon,{backgroundColor:a.done?'#ECFDF5':'#F3F4F6'}]}>
              <Ionicons name={a.done?'checkmark':'ellipse-outline' as any} size={14}
                color={a.done?'#059669':'#9CA3AF'}/>
            </View>
            <View style={{flex:1}}>
              <Text style={[s.actionLabel,a.done&&{color:'#9CA3AF',textDecorationLine:'line-through'}]}>
                {a.label}
              </Text>
            </View>
            <View style={[s.ptsBadge,{backgroundColor:a.done?'#ECFDF5':'#EEF2FF'}]}>
              <Text style={[s.ptsTxt,{color:a.done?'#059669':'#4F46E5'}]}>+{a.pts} pts</Text>
            </View>
            {!a.done && <Ionicons name="chevron-forward" size={14} color="#D1D5DB"/>}
          </TouchableOpacity>
        ))}

        {/* History */}
        <Text style={s.secTitle}>Score History</Text>
        {HISTORY.map((h,i)=>(
          <View key={i} style={s.histRow}>
            <View style={s.histDot}/>
            <Text style={s.histLabel}>{h.label}</Text>
            <Text style={s.histDate}>{h.date}</Text>
            <Text style={s.histPts}>{h.pts}</Text>
          </View>
        ))}
        <View style={{height:40}}/>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F3F2F7'},
  header:{flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:16,paddingTop:8,paddingBottom:12},
  back:{width:34,height:34,borderRadius:17,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'},
  title:{fontSize:17,fontWeight:'700',color:'#111827'},
  hero:{margin:16,borderRadius:18,padding:24,alignItems:'center'},
  heroScore:{fontSize:64,fontWeight:'800',color:'#fff',lineHeight:68},
  heroOf:{fontSize:18,color:'rgba(255,255,255,0.45)',marginTop:-8,marginBottom:10},
  tierPill:{flexDirection:'row',alignItems:'center',gap:5,borderRadius:20,paddingHorizontal:10,paddingVertical:4,marginBottom:6},
  tierDot:{width:6,height:6,borderRadius:3},
  tierTxt:{fontSize:11,fontWeight:'700'},
  heroPct:{fontSize:12,color:'rgba(255,255,255,0.5)',marginBottom:10},
  heroNext:{backgroundColor:'rgba(255,184,71,0.2)',borderRadius:20,paddingHorizontal:12,paddingVertical:4,marginBottom:12},
  heroNextTxt:{fontSize:12,color:'#FFB347',fontWeight:'700'},
  heroBar:{width:'100%',height:5,backgroundColor:'rgba(255,255,255,0.12)',borderRadius:3,overflow:'hidden'},
  heroBarFill:{height:'100%',borderRadius:3,backgroundColor:'#FFB347'},
  unlockBanner:{flexDirection:'row',alignItems:'center',gap:8,backgroundColor:'#FFFBEB',marginHorizontal:16,borderRadius:12,padding:13,marginBottom:8,borderWidth:1,borderColor:'#FDE68A'},
  unlockTxt:{fontSize:13,color:'#92400E'},
  secTitle:{fontSize:14,fontWeight:'700',color:'#111827',paddingHorizontal:16,marginBottom:8,marginTop:4},
  actionRow:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:'#fff',marginHorizontal:16,marginBottom:8,borderRadius:12,padding:13,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.04,shadowRadius:4,elevation:1},
  actionIcon:{width:28,height:28,borderRadius:8,alignItems:'center',justifyContent:'center'},
  actionLabel:{fontSize:13,fontWeight:'600',color:'#1E293B'},
  ptsBadge:{borderRadius:20,paddingHorizontal:9,paddingVertical:3},
  ptsTxt:{fontSize:11.5,fontWeight:'800'},
  histRow:{flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal:16,paddingVertical:8,borderBottomWidth:1,borderBottomColor:'#F1F5F9'},
  histDot:{width:8,height:8,borderRadius:4,backgroundColor:Colors.brand},
  histLabel:{flex:1,fontSize:13,color:'#374151'},
  histDate:{fontSize:11,color:'#9CA3AF'},
  histPts:{fontSize:13,fontWeight:'800',color:'#059669',marginLeft:8},
});
