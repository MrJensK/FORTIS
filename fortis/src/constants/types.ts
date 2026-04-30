export interface Profile {
  id: string
  name: string
  gender: 'male' | 'female' | 'other'
  age: number
  heightCm: number
  weightKg: number
  goalWeightKg: number
  goal: 'lose' | 'maintain' | 'gain'
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active'
  macroGoals: MacroGoals
  createdAt: string
  updatedAt: string
}

export interface MacroGoals {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

export interface Exercise {
  id: string
  name: string
  muscle: string
  secondary?: string
  equip: string
  icon: string
  diff: 'Nybörjare' | 'Medel' | 'Avancerad'
  type: 'Styrka' | 'Kondition' | 'Rörlighet'
  isTimer?: boolean
  instructions: string[]
  wgerId?: number
  isCustom?: boolean
}

export interface WorkoutSchedule {
  id: string
  name: string
  day: number
  exercises: ScheduledExercise[]
}

export interface ScheduledExercise {
  exerciseId: string
  sets: number
  reps?: number
  durationSec?: number
  weight?: number
  restSec: number
}

export interface WorkoutLogEntry {
  id: string
  workoutId: string
  date: string
  startedAt: string
  endedAt?: string
  durationMin: number
  exercises: LoggedSet[][]
  completedManually: boolean
}

export interface LoggedSet {
  reps?: number
  weight?: number
  durationSec?: number
  done: boolean
}

export interface FoodItem {
  id: string
  name: string
  cal: number
  prot: number
  carbs: number
  fat: number
  isCustom?: boolean
}

export interface FoodLogEntry {
  id: string
  date: string
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foodId: string
  foodName: string
  amountG: number
  cal: number
  prot: number
  carbs: number
  fat: number
}

export interface MeasurementEntry {
  id: string
  date: string
  weightKg?: number
  waistCm?: number
  bodyFatPct?: number
  notes?: string
}

export interface WaterLogEntry {
  id: string
  date: string
  totalMl: number
}
