export interface Theme {
  id: string
  name: string
  accent: string
  accent2: string
  accentLight: string
  bg: string
  card: string
  text: string
  muted: string
  border: string
  nav: string
  header: string
  headerText: string
  outer: string
}

export const THEMES: Record<string, Theme> = {
  fortis: {
    id: 'fortis',
    name: 'Fortis',
    accent: '#E85D26',
    accent2: '#2A6AE8',
    accentLight: '#FEF0EB',
    bg: '#F2F1ED',
    card: '#FFFFFF',
    text: '#141414',
    muted: '#888880',
    border: 'rgba(0,0,0,0.09)',
    nav: '#FFFFFF',
    header: '#141414',
    headerText: '#FFFFFF',
    outer: '#E8E6E0',
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    accent: '#E85D26',
    accent2: '#4A8AFF',
    accentLight: '#2A1A14',
    bg: '#121212',
    card: '#1E1E1E',
    text: '#F0F0EC',
    muted: '#777770',
    border: 'rgba(255,255,255,0.08)',
    nav: '#1A1A1A',
    header: '#0A0A0A',
    headerText: '#F0F0EC',
    outer: '#090909',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    accent: '#5B8BFF',
    accent2: '#E85D26',
    accentLight: '#131B2E',
    bg: '#0D1117',
    card: '#161B22',
    text: '#E6EDF3',
    muted: '#7D8590',
    border: 'rgba(255,255,255,0.08)',
    nav: '#161B22',
    header: '#0D1117',
    headerText: '#E6EDF3',
    outer: '#080B10',
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    accent: '#2D9E5F',
    accent2: '#2A6AE8',
    accentLight: '#E6F7ED',
    bg: '#F0F4F0',
    card: '#FFFFFF',
    text: '#1A2E1A',
    muted: '#6A7A6A',
    border: 'rgba(0,0,0,0.08)',
    nav: '#FFFFFF',
    header: '#1A2E1A',
    headerText: '#FFFFFF',
    outer: '#E4EAE4',
  },
  stone: {
    id: 'stone',
    name: 'Stone',
    accent: '#6366F1',
    accent2: '#EC4899',
    accentLight: '#EDEDFD',
    bg: '#F5F5F4',
    card: '#FFFFFF',
    text: '#1C1917',
    muted: '#78716C',
    border: 'rgba(0,0,0,0.08)',
    nav: '#FFFFFF',
    header: '#1C1917',
    headerText: '#FFFFFF',
    outer: '#E7E5E4',
  },
}

export const DEFAULT_THEME_ID = 'fortis'
