import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Play, Plus } from 'lucide-react-native'
import { useTheme } from '../../src/hooks/useTheme'
import { useWorkoutStore } from '../../src/store/useWorkoutStore'
import { EXERCISES } from '../../src/constants/exercises'

const DAYS = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']

export default function ScheduleScreen() {
  const theme = useTheme()
  const router = useRouter()
  const workouts = useWorkoutStore((s) => s.workouts)
  const customExercises = useWorkoutStore((s) => s.customExercises)

  const todayDow = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const [selectedDay, setSelectedDay] = useState(todayDow)

  const allExercises = [...EXERCISES, ...customExercises]
  const dayWorkouts = workouts.filter((w) => w.day === selectedDay)

  const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.outer },
    header: { backgroundColor: theme.header, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 20 },
    title: { color: theme.headerText, fontSize: 24, fontWeight: '800' },
    weekStrip: { flexDirection: 'row', backgroundColor: theme.card, paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: theme.border },
    dayBtn: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 10 },
    dayBtnActive: { backgroundColor: theme.accent },
    dayText: { fontSize: 12, fontWeight: '500', color: theme.muted },
    dayTextActive: { fontWeight: '700', color: '#FFF' },
    todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.accent, marginTop: 2 },
    scroll: { flex: 1 },
    card: { backgroundColor: theme.card, borderRadius: 16, margin: 16, marginBottom: 0, padding: 20 },
    workoutName: { color: theme.text, fontSize: 18, fontWeight: '800', marginBottom: 12 },
    exRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: theme.border },
    exName: { color: theme.text, fontSize: 14, fontWeight: '600', flex: 1 },
    exMeta: { color: theme.muted, fontSize: 13 },
    startBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.accent, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginTop: 16, justifyContent: 'center' },
    startBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
    emptyCard: { backgroundColor: theme.card, borderRadius: 16, margin: 16, padding: 32, alignItems: 'center' },
    emptyText: { color: theme.muted, fontSize: 14, textAlign: 'center' },
    spacer: { height: 24 },
  })

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Schema</Text>
      </View>

      <View style={s.weekStrip}>
        {DAYS.map((d, i) => (
          <TouchableOpacity key={i} style={[s.dayBtn, selectedDay === i && s.dayBtnActive]} onPress={() => setSelectedDay(i)}>
            <Text style={[s.dayText, selectedDay === i && s.dayTextActive]}>{d}</Text>
            {i === todayDow && selectedDay !== i && <View style={s.todayDot} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {dayWorkouts.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>Ingen träning {DAYS[selectedDay]}en.{'\n'}Vila eller lägg till ett pass.</Text>
          </View>
        ) : (
          dayWorkouts.map((w) => (
            <View key={w.id} style={s.card}>
              <Text style={s.workoutName}>{w.name}</Text>
              {w.exercises.map((e, i) => {
                const ex = allExercises.find((x) => x.id === e.exerciseId)
                if (!ex) return null
                const meta = e.durationSec ? `${e.sets}×${e.durationSec}s` : `${e.sets}×${e.reps} reps${e.weight ? ` · ${e.weight}kg` : ''}`
                return (
                  <View key={i} style={s.exRow}>
                    <Text style={s.exName}>{ex.icon} {ex.name}</Text>
                    <Text style={s.exMeta}>{meta}</Text>
                  </View>
                )
              })}
              <TouchableOpacity style={s.startBtn} onPress={() => router.push(`/workout/${w.id}`)}>
                <Play size={16} color="#FFF" />
                <Text style={s.startBtnText}>Starta pass</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={s.spacer} />
      </ScrollView>
    </SafeAreaView>
  )
}
