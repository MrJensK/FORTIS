import { MacroGoals, Profile } from '../constants/types'

const ACTIVITY_MULT = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
} as const

const PACE_DELTA: Record<Profile['goal'], Record<Profile['pace'], number>> = {
  lose:     { slow: -250, moderate: -500, fast: -750 },
  gain:     { slow: 200,  moderate: 350,  fast: 500  },
  maintain: { slow: 0,    moderate: 0,    fast: 0    },
}

export const PACE_LABELS: Record<Profile['goal'], { pace: Profile['pace']; label: string; desc: string }[]> = {
  lose: [
    { pace: 'slow',     label: 'Långsamt',  desc: '−250 kcal/dag · ~0,25 kg/vecka' },
    { pace: 'moderate', label: 'Måttligt',  desc: '−500 kcal/dag · ~0,5 kg/vecka' },
    { pace: 'fast',     label: 'Snabbt',    desc: '−750 kcal/dag · ~0,75 kg/vecka' },
  ],
  gain: [
    { pace: 'slow',     label: 'Lean bulk', desc: '+200 kcal/dag · ~0,2 kg/vecka' },
    { pace: 'moderate', label: 'Måttligt',  desc: '+350 kcal/dag · ~0,35 kg/vecka' },
    { pace: 'fast',     label: 'Aggressivt',desc: '+500 kcal/dag · ~0,5 kg/vecka' },
  ],
  maintain: [],
}

export function calcTDEE(p: Pick<Profile, 'gender' | 'age' | 'heightCm' | 'weightKg' | 'activityLevel'>): number {
  const bmr =
    p.gender === 'female'
      ? 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age - 161
      : 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + 5
  return Math.round(bmr * ACTIVITY_MULT[p.activityLevel])
}

export function calcMacros(
  tdee: number,
  goal: Profile['goal'],
  pace: Profile['pace'],
  weightKg: number,
): MacroGoals {
  const delta = PACE_DELTA[goal][pace]
  const calories = Math.max(1200, tdee + delta)
  const proteinG = Math.round(weightKg * 2)
  const fatG = Math.round((calories * 0.25) / 9)
  const carbsG = Math.round((calories - proteinG * 4 - fatG * 9) / 4)
  return { calories, proteinG, carbsG, fatG }
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}
