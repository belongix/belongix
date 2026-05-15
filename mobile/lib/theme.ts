/**
 * Belongix — Theme tokens
 * Matches web CSS variables exactly. Use these everywhere — never hardcode colours.
 */

export const Colors = {
  brand:      '#2D1B69',
  brand2:     '#4C2FAA',
  brand3:     '#6B48CC',
  sky:        '#06B6D4',
  green:      '#10B981',
  amber:      '#F59E0B',
  red:        '#EF4444',
  orange:     '#FF5C35',
  ink:        '#0D0D1A',
  muted:      '#64748B',
  subtle:     '#8B8BA8',
  border:     '#E2E8F0',
  bg:         '#F8F7FF',
  white:      '#FFFFFF',
  off:        '#F5F3FF',
  off2:       '#EFEFF8',
  // Dark mode counterparts
  darkBg:     '#0D0D1A',
  darkCard:   '#1A1A2E',
  darkBorder: '#2D2D45',
};

export const FontFamily = {
  sora:       'Sora_400Regular',
  soraSemi:   'Sora_600SemiBold',
  soraBold:   'Sora_700Bold',
  soraBlack:  'Sora_800ExtraBold',
  dmSans:     'DMSans_400Regular',
  dmSansMed:  'DMSans_500Medium',
  dmSansSemi: 'DMSans_600SemiBold',
};

export const Spacing = {
  xs: 4,  sm: 8,  md: 12,  lg: 16,  xl: 20,  xxl: 24,  xxxl: 32,
};

export const Radius = {
  sm: 8,  md: 12,  lg: 16,  xl: 20,  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#2D1B69',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#2D1B69',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  lg: {
    shadowColor: '#2D1B69',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 12,
  },
};

/** Return tier info for a given career score */
export function getTier(score: number): {
  label: string; color: string; bg: string; min: number; max: number;
} {
  if (score >= 80) return { label: 'Expert',   color: '#10B981', bg: '#ECFDF5', min: 80, max: 100 };
  if (score >= 60) return { label: 'Strong',   color: '#06B6D4', bg: '#F0F9FF', min: 60, max: 79  };
  if (score >= 40) return { label: 'Rising',   color: '#F59E0B', bg: '#FFFBEB', min: 40, max: 59  };
  return                    { label: 'Starter', color: '#8B8BA8', bg: '#F8F7FF', min: 0,  max: 39  };
}

/** Hash a string to one of the brand accent colours (for avatars) */
export function companyColor(name: string): string {
  const colors = ['#2D1B69','#4C2FAA','#06B6D4','#10B981','#F59E0B','#EF4444','#FF5C35'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

/** Get first 2 initials from a name */
export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}
