import { create } from 'zustand'
import { WorkoutSchedule, WorkoutLogEntry, Exercise } from '../constants/types'
import { storageGet, storageSet, STORAGE_KEYS } from '../lib/storage'
import { today } from '../lib/macroCalc'

const DEFAULT_WORKOUTS: WorkoutSchedule[] = [
  {
    id: 'w1', name: 'Hemmapass', day: 0,
    exercises: [
      { exerciseId: 'situp', sets: 3, reps: 30, weight: 0, restSec: 60 },
      { exerciseId: 'pushup', sets: 3, reps: 20, weight: 0, restSec: 60 },
      { exerciseId: 'squat', sets: 3, reps: 20, weight: 20, restSec: 90 },
      { exerciseId: 'plank', sets: 1, durationSec: 60, weight: 0, restSec: 60 },
      { exerciseId: 'dumbbell_curl', sets: 3, reps: 15, weight: 12, restSec: 60 },
    ],
  },
  {
    id: 'w2', name: 'Konditionspass', day: 2,
    exercises: [
      { exerciseId: 'burpee', sets: 3, reps: 12, weight: 0, restSec: 90 },
      { exerciseId: 'lunges', sets: 3, reps: 20, weight: 0, restSec: 60 },
      { exerciseId: 'russian_twist', sets: 3, reps: 30, weight: 0, restSec: 45 },
    ],
  },
  {
    id: 'w3', name: 'Rygg & Biceps', day: 4,
    exercises: [
      { exerciseId: 'pullup', sets: 3, reps: 8, weight: 0, restSec: 120 },
      { exerciseId: 'cable_row', sets: 3, reps: 12, weight: 40, restSec: 90 },
      { exerciseId: 'dumbbell_curl', sets: 3, reps: 12, weight: 14, restSec: 60 },
    ],
  },
]

interface WorkoutStore {
  workouts: WorkoutSchedule[]
  workoutLog: WorkoutLogEntry[]
  customExercises: Exercise[]
  loadWorkouts: () => Promise<void>
  saveWorkouts: (w: WorkoutSchedule[]) => Promise<void>
  addLogEntry: (entry: WorkoutLogEntry) => Promise<void>
  saveCustomExercises: (exs: Exercise[]) => Promise<void>
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  workouts: [],
  workoutLog: [],
  customExercises: [],

  loadWorkouts: async () => {
    const workouts = await storageGet<WorkoutSchedule[]>(STORAGE_KEYS.workouts, DEFAULT_WORKOUTS)
    const workoutLog = await storageGet<WorkoutLogEntry[]>(STORAGE_KEYS.workoutLog, [])
    const customExercises = await storageGet<Exercise[]>(STORAGE_KEYS.customExercises, [])
    set({ workouts, workoutLog, customExercises })
  },

  saveWorkouts: async (workouts) => {
    set({ workouts })
    await storageSet(STORAGE_KEYS.workouts, workouts)
  },

  addLogEntry: async (entry) => {
    const log = [...get().workoutLog, entry]
    set({ workoutLog: log })
    await storageSet(STORAGE_KEYS.workoutLog, log)
  },

  saveCustomExercises: async (exs) => {
    set({ customExercises: exs })
    await storageSet(STORAGE_KEYS.customExercises, exs)
  },
}))

export function calcStreak(log: WorkoutLogEntry[]): number {
  const dates = [...new Set(log.map((e) => e.date))].sort().reverse()
  if (!dates.length) return 0
  const t = today()
  let streak = 0
  let cur = dates[0] === t ? t : null
  if (!cur) return 0
  for (const d of dates) {
    const expected = new Date(t)
    expected.setDate(expected.getDate() - streak)
    if (d === expected.toISOString().slice(0, 10)) streak++
    else break
  }
  return streak
}
