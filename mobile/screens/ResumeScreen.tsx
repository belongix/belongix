import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../lib/theme';

const TIPS = [
  { icon:'checkmark-circle', color:'#059669', tip:'Start each bullet with a strong action verb (Built, Led, Increased, Reduced)' },
  { icon:'checkmark-circle', color:'#059669', tip:'Quantify everything — "Reduced load time by 40%" beats "Improved performance"' },
  { icon:'checkmark-circle', color:'#059669', tip:'Include skills that match the exact JD keywords for ATS systems' },
  { icon:'warning',          color:'#D97706', tip:'Keep to 1 page for under 5 years experience' },
  { icon:'warning',          color:'#D97706', tip:'No photos, personal info, or salary expectations on Indian tech resumes' },
  { icon:'close-circle',     color:'#DC2626', tip:'Avoid generic objectives like "Seeking a challenging role..."' },
];

export default function ResumeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Ionicons name="arrow-back" size={20} color="#111" />
        </TouchableOpacity>
        <Text style={s.title}>Resume Builder</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding:16, gap:12 }}>
        {/* ATS Score banner */}
        <View style={s.atsBanner}>
          <View>
            <Text style={s.atsTitle}>ATS Score</Text>
            <Text style={s.atsSub}>Upload your resume for instant analysis</Text>
          </View>
          <View style={s.atsRing}>
            <Text style={s.atsN}>--</Text>
            <Text style={s.atsPts}>/100</Text>
          </View>
        </View>
        {/* Actions */}
        {[
          { icon:'cloud-upload-outline', label:'Upload & Analyse Resume', sub:'Get ATS score + AI feedback', color:'#4F46E5', bg:'#EEF2FF' },
          { icon:'document-text-outline', label:'Build New Resume', sub:'3 ATS-optimised templates', color:'#059669', bg:'#ECFDF5' },
          { icon:'chatbubbles-outline', label:'Ask Bexi to Review', sub:'AI-powered critique in 30 seconds', color:'#7C3AED', bg:'#F5F3FF' },
        ].map(a=>(
          <TouchableOpacity key={a.label} style={s.actionCard}
            onPress={()=>Alert.alert(a.label,'Coming soon — use the web version at belongix.in for full access.')}>
            <View style={[s.actionIcon,{backgroundColor:a.bg}]}>
              <Ionicons name={a.icon as any} size={22} color={a.color}/>
            </View>
            <View style={{flex:1}}>
              <Text style={s.actionLabel}>{a.label}</Text>
              <Text style={s.actionSub}>{a.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#D1D5DB"/>
          </TouchableOpacity>
        ))}
        {/* Tips */}
        <Text style={s.secTitle}>Resume Tips for Indian Market</Text>
        {TIPS.map((t,i)=>(
          <View key={i} style={s.tipRow}>
            <Ionicons name={t.icon as any} size={16} color={t.color}/>
            <Text style={s.tipTxt}>{t.tip}</Text>
          </View>
        ))}
        {/* Web link */}
        <TouchableOpacity style={s.webBtn}
          onPress={()=>Linking.openURL('https://belongix.in/resume-builder.html')}>
          <Ionicons name="open-outline" size={16} color={Colors.brand}/>
          <Text style={s.webBtnTxt}>Open Full Resume Builder on Web</Text>
        </TouchableOpacity>
        <View style={{height:32}}/>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F3F2F7'},
  header:{flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:16,paddingTop:8,paddingBottom:12},
  back:{width:34,height:34,borderRadius:17,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'},
  title:{fontSize:17,fontWeight:'700',color:'#111827'},
  atsBanner:{backgroundColor:Colors.brand,borderRadius:16,padding:18,flexDirection:'row',alignItems:'center'},
  atsTitle:{fontSize:16,fontWeight:'700',color:'#fff',marginBottom:3},
  atsSub:{fontSize:12,color:'rgba(255,255,255,0.7)'},
  atsRing:{width:60,height:60,borderRadius:30,borderWidth:2,borderColor:'rgba(255,255,255,0.3)',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(255,255,255,0.1)'},
  atsN:{fontSize:18,fontWeight:'800',color:'#fff'},
  atsPts:{fontSize:9,color:'rgba(255,255,255,0.6)'},
  actionCard:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:'#fff',borderRadius:14,padding:14,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.05,shadowRadius:6,elevation:2},
  actionIcon:{width:44,height:44,borderRadius:12,alignItems:'center',justifyContent:'center'},
  actionLabel:{fontSize:13.5,fontWeight:'700',color:'#111827',marginBottom:2},
  actionSub:{fontSize:11.5,color:'#9CA3AF'},
  secTitle:{fontSize:14,fontWeight:'700',color:'#111827',marginTop:4},
  tipRow:{flexDirection:'row',gap:10,alignItems:'flex-start',backgroundColor:'#fff',borderRadius:12,padding:12},
  tipTxt:{flex:1,fontSize:12.5,color:'#374151',lineHeight:18},
  webBtn:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,borderWidth:1.5,borderColor:Colors.brand,borderRadius:12,paddingVertical:13},
  webBtnTxt:{fontSize:13.5,fontWeight:'700',color:Colors.brand},
});
