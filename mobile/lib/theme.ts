export const Colors = {
  brand: '#2D1B69',
  brand2: '#4C2FAA',
  brand3: '#6B48CC',
  orange: '#FF5C35',
  sky: '#06B6D4',
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  ink: '#0D0D1A',
  muted: '#64748B',
  background: '#F8F7FF',
  white: '#FFFFFF',
  off: '#F5F3FF',
  border: '#E2E8F0',
} as const;

export const FontFamily = {
  soraExtraBold: 'Sora_800ExtraBold',
  soraBold: 'Sora_700Bold',
  soraSemiBold: 'Sora_600SemiBold',
  soraRegular: 'Sora_400Regular',
  dmSansBold: 'DMSans_700Bold',
  dmSansSemiBold: 'DMSans_600SemiBold',
  dmSansMedium: 'DMSans_500Medium',
  dmSansRegular: 'DMSans_400Regular',
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#2D1B69',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#2D1B69',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.11,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

export const TIERS = [
  { label: 'Starter', min: 0,  max: 39,  color: '#8B8BA8', bg: '#F1F5F9' },
  { label: 'Rising',  min: 40, max: 59,  color: '#F59E0B', bg: '#FEF9C3' },
  { label: 'Strong',  min: 60, max: 79,  color: '#06B6D4', bg: '#E0F2FE' },
  { label: 'Expert',  min: 80, max: 100, color: '#10B981', bg: '#DCFCE7' },
] as const;

export function getTier(score: number) {
  return TIERS.find(t => score >= t.min && score <= t.max) ?? TIERS[0];
}

export function companyColor(name: string): string {
  const POOL = ['#2D1B69','#10B981','#FF5C35','#F59E0B','#06B6D4','#6B48CC','#EF4444','#8B5CF6'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return POOL[Math.abs(h) % POOL.length];
}