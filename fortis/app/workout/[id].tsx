import { useState, useEffect, useRef } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Check, X, ChevronLeft } from 'lucide-react-native'
import { useTheme } from '../../src/hooks/useTheme'
import { useWorkoutStore } from '../../src/store/useWorkoutStore'
import { EXERCISES } from '../../src/constants/exercises'
import { LoggedSet } from '../../src/constants/types'
import { today } from '../../src/lib/macroCalc'

function useTimer() {
  const [elapsed, setElapsed] = useState(0)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    ref.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [])
  const m = Math.floor(elapsed / 60).toString().padStart(2, '0')
  const s = (elapsed % 60).toString().padStart(2, '0')
  return { elapsed, display: `${m}:${s}` }
}

export default function WorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const theme = useTheme()
  const router = useRouter()
  const workouts = useWorkoutStore((s) => s.workouts)
  const customExercises = useWorkoutStore((s) => s.customExercises)
  const addLogEntry = useWorkoutStore((s) => s.addLogEntry)

  const workout = workouts.find((w) => w.id === id)
  const allExercises = [...EXERCISES, ...customExercises]

  const [sets, setSets] = useState<LoggedSet[][]>(() =>
    workout?.exercises.map((e) =>
      Array.from({ length: e.sets }, () => ({
        reps: e.reps,
        weight: e.weight || 0,
        durationSec: e.durationSec,
        done: false,
      }))
    ) ?? []
  )
  const [restTime, setRestTime] = useState<number | null>(null)
  const [restInterval, setRestIntervalRef] = useState<ReturnType<typeof setInterval> | null>(null)
  const { elapsed, display: timerDisplay } = useTimer()
  const startedAt = useRef(new Date().toISOString())

  const toggleSet = (ei: number, si: number) => {
    const next = sets.map((s, i) => i === ei ? s.map((set, j) => j === si ? { ...set, done: !set.done } : set) : s)
    setSets(next)
    if (!next[ei][si].done) {
      const restSec = workout?.exercises[ei].restSec ?? 60
      if (restInterval) clearInterval(restInterval)
      setRestTime(restSec)
      const iv = setInterval(() => {
        setRestTime((t) => {
          if (t === null || t <= 1) { clearInterval(iv); return null }
          return t - 1
        })
      }, 1000)
      setRestIntervalRef(iv)
    }
  }

  const updateSet = (ei: number, si: number, field: 'reps' | 'weight', val: number) => {
    setSets(sets.map((s, i) => i === ei ? s.map((set, j) => j === si ? { ...set, [field]: val } : set) : s))
  }

  const finish = async () => {
    if (!workout) return
    await addLogEntry({
      id: `log${Date.now()}`,
      workoutId: workout.id,
      date: today(),
      startedAt: startedAt.current,
      endedAt: new Date().toISOString(),
      durationMin: Math.round(elapsed / 60),
      exercises: sets,
      completedManually: false,
    })
    router.back()
  }

  const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#0F0F0F' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    workoutName: { flex: 1, color: '#FFF', fontSize: 18, fontWeight: '800' },
    timerPill: { backgroundColor: theme.accent, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
    timerText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
    scroll: { flex: 1 },
    exCard: { backgroundColor: '#1A1A1A', borderRadius: 16, margin: 16, marginBottom: 0, padding: 20 },
    exName: { color: '#FFF', fontSize: 17, fontWeight: '800', marginBottom: 14 },
    setHeaderRow: { flexDirection: 'row', marginBottom: 6 },
    setHeaderText: { color: '#666', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
    setRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    setNum: { color: '#888', fontSize: 14, width: 24 },
    setInput: { flex: 1, backgroundColor: '#2A2A2A', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, color: '#FFF', fontSize: 15, textAlign: 'center' as const },
    setInputDone: { backgroundColor: theme.accentLight, color: theme.text },
    checkBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
    checkBtnDone: { backgroundColor: theme.accent },
    restBanner: { backgroundColor: theme.accent, margin: 16, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    restText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    restTime: { color: '#FFF', fontSize: 24, fontWeight: '900' },
    finishBtn: { backgroundColor: theme.accent, margin: 16, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    finishBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
    spacer: { height: 32 },
  })

  if (!workout) return null

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={20} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.workoutName}>{workout.name}</Text>
        <View style={s.timerPill}><Text style={s.timerText}>{timerDisplay}</Text></View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {restTime !== null && (
          <View style={s.restBanner}>
            <Text style={s.restText}>⏱ Vila</Text>
            <Text style={s.restTime}>{restTime}s</Text>
          </View>
        )}

        {workout.exercises.map((e, ei) => {
          const ex = allExercises.find((x) => x.id === e.exerciseId)
          if (!ex) return null
          const isTimer = !!e.durationSec
          return (
            <View key={ei} style={s.exCard}>
              <Text style={s.exName}>{ex.icon} {ex.name}</Text>
              <View style={s.setHeaderRow}>
                <Text style={[s.setHeaderText, { width: 24 }]}>#</Text>
                <Text style={[s.setHeaderText, { flex: 1, textAlign: 'center' }]}>{isTimer ? 'Sek' : 'Reps'}</Text>
                {!isTimer && <Text style={[s.setHeaderText, { flex: 1, textAlign: 'center' }]}>Kg</Text>}
                <Text style={[s.setHeaderText, { width: 40, textAlign: 'center' }]}>✓</Text>
              </View>
              {sets[ei]?.map((set, si) => (
                <View key={si} style={s.setRow}>
                  <Text style={s.setNum}>{si + 1}</Text>
                  <TextInput
                    style={[s.setInput, set.done && s.setInputDone]}
                    value={String(isTimer ? set.durationSec ?? 0 : set.reps ?? 0)}
                    onChangeText={(v) => updateSet(ei, si, 'reps', Number(v))}
                    keyboardType="numeric"
                  />
                  {!isTimer && (
                    <TextInput
                      style={[s.setInput, set.done && s.setInputDone]}
                      value={String(set.weight ?? 0)}
                      onChangeText={(v) => updateSet(ei, si, 'weight', Number(v))}
                      keyboardType="decimal-pad"
                    />
                  )}
                  <TouchableOpacity style={[s.checkBtn, set.done && s.checkBtnDone]} onPress={() => toggleSet(ei, si)}>
                    <Check size={18} color={set.done ? '#FFF' : '#555'} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )
        })}

        <TouchableOpacity style={s.finishBtn} onPress={finish}>
          <Text style={s.finishBtnText}>Avsluta pass</Text>
        </TouchableOpacity>
        <View style={s.spacer} />
      </ScrollView>
    </SafeAreaView>
  )
}
