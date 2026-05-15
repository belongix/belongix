import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../lib/theme';

const { width: W } = Dimensions.get('window');

const ROLES = [
  { role:'Software Engineer',    p25:18, p50:28, p75:42, city:'Bangalore' },
  { role:'Product Manager',      p25:22, p50:35, p75:52, city:'Bangalore' },
  { role:'Data Scientist',       p25:16, p50:26, p75:40, city:'Bangalore' },
  { role:'DevOps Engineer',      p25:14, p50:22, p75:34, city:'Bangalore' },
  { role:'ML Engineer',          p25:20, p50:32, p75:48, city:'Bangalore' },
  { role:'UI/UX Designer',       p25:10, p50:18, p75:28, city:'Bangalore' },
  { role:'Backend Engineer',     p25:16, p50:25, p75:38, city:'Bangalore' },
  { role:'Frontend Engineer',    p25:14, p50:22, p75:34, city:'Bangalore' },
];

export default function SalaryScreen({ navigation }: any) {
  const [selected, setSelected] = useState(0);
  const r = ROLES[selected];
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Ionicons name="arrow-back" size={20} color="#111" />
        </TouchableOpacity>
        <Text style={s.title}>Salary Intelligence</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={s.sub}>Real market data from 2,400+ professionals</Text>
        {/* Selected role hero */}
        <View style={s.hero}>
          <Text style={s.heroRole}>{r.role}</Text>
          <Text style={s.heroCity}>📍 {r.city}</Text>
          <View style={s.heroNums}>
            {[{ l:'P25 (Entry)', v:r.p25 },{ l:'Median', v:r.p50 },{ l:'P75 (Senior)', v:r.p75 }].map(n=>(
              <View key={n.l} style={s.heroNum}>
                <Text style={s.heroVal}>₹{n.v}L</Text>
                <Text style={s.heroLbl}>{n.l}</Text>
              </View>
            ))}
          </View>
          <View style={s.barWrap}>
            <View style={[s.barSeg,{flex:r.p25,backgroundColor:'#FCA5A5'}]}/>
            <View style={[s.barSeg,{flex:r.p50-r.p25,backgroundColor:'#FCD34D'}]}/>
            <View style={[s.barSeg,{flex:r.p75-r.p50,backgroundColor:'#6EE7B7'}]}/>
          </View>
          <View style={s.barLegend}>
            {[['#FCA5A5','Entry'],['#FCD34D','Mid'],['#6EE7B7','Senior']].map(([c,l])=>(
              <View key={l as string} style={s.legendItem}>
                <View style={[s.legendDot,{backgroundColor:c as string}]}/>
                <Text style={s.legendTxt}>{l as string}</Text>
              </View>
            ))}
          </View>
        </View>
        {/* Role list */}
        <Text style={s.secTitle}>Browse by Role</Text>
        {ROLES.map((role,i) => (
          <TouchableOpacity key={i} style={[s.roleRow, selected===i&&s.roleRowActive]} onPress={()=>setSelected(i)}>
            <View style={{ flex:1 }}>
              <Text style={s.roleName}>{role.role}</Text>
              <Text style={s.roleRange}>₹{role.p25}L – ₹{role.p75}L/yr</Text>
            </View>
            <Text style={s.roleMedian}>₹{role.p50}L</Text>
            {selected===i && <Ionicons name="checkmark-circle" size={18} color={Colors.brand} />}
          </TouchableOpacity>
        ))}
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
  sub:{fontSize:12,color:'#9CA3AF',paddingHorizontal:16,marginBottom:12},
  hero:{backgroundColor:'#fff',marginHorizontal:16,borderRadius:16,padding:18,marginBottom:16,shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.07,shadowRadius:8,elevation:3},
  heroRole:{fontSize:16,fontWeight:'700',color:'#111827',marginBottom:3},
  heroCity:{fontSize:12,color:'#9CA3AF',marginBottom:14},
  heroNums:{flexDirection:'row',marginBottom:12},
  heroNum:{flex:1,alignItems:'center'},
  heroVal:{fontSize:18,fontWeight:'800',color:'#059669'},
  heroLbl:{fontSize:10,color:'#9CA3AF',marginTop:2},
  barWrap:{flexDirection:'row',height:8,borderRadius:4,overflow:'hidden',marginBottom:8},
  barSeg:{},
  barLegend:{flexDirection:'row',gap:12},
  legendItem:{flexDirection:'row',alignItems:'center',gap:4},
  legendDot:{width:8,height:8,borderRadius:4},
  legendTxt:{fontSize:11,color:'#6B7280'},
  secTitle:{fontSize:14,fontWeight:'700',color:'#111827',paddingHorizontal:16,marginBottom:8},
  roleRow:{flexDirection:'row',alignItems:'center',backgroundColor:'#fff',marginHorizontal:16,marginBottom:8,borderRadius:12,padding:14,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.05,shadowRadius:4,elevation:1},
  roleRowActive:{borderWidth:1.5,borderColor:Colors.brand},
  roleName:{fontSize:13,fontWeight:'600',color:'#111827',marginBottom:2},
  roleRange:{fontSize:11,color:'#9CA3AF'},
  roleMedian:{fontSize:14,fontWeight:'800',color:'#059669',marginRight:8},
});
