import { MacroGoals, Profile } from '../constants/types'

const ACTIVITY_MULT = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
} as const

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
  weightKg: number,
): MacroGoals {
  const calories =
    goal === 'lose' ? tdee - 500 : goal === 'gain' ? tdee + 300 : tdee
  const proteinG = Math.round(weightKg * 2)
  const fatG = Math.round((calories * 0.25) / 9)
  const carbsG = Math.round((calories - proteinG * 4 - fatG * 9) / 4)
  return { calories, proteinG, carbsG, fatG }
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}
