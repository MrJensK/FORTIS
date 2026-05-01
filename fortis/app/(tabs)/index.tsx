import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Svg, Circle, Path } from 'react-native-svg'
import { Droplets, Zap, Flame } from 'lucide-react-native'
import { useTheme } from '../../src/hooks/useTheme'
import { useProfileStore } from '../../src/store/useProfileStore'
import { useWorkoutStore, calcStreak } from '../../src/store/useWorkoutStore'
import { useNutritionStore, todayFoodLog } from '../../src/store/useNutritionStore'
import { today } from '../../src/lib/macroCalc'

function CalorieRing({ eaten, goal, accent }: { eaten: number; goal: number; accent: string }) {
  const r = 52
  const stroke = 8
  const circ = 2 * Math.PI * r
  const pct = Math.min(eaten / Math.max(goal, 1), 1)
  const dash = circ * pct
  return (
    <Svg width={130} height={130} viewBox="0 0 130 130">
      <Circle cx={65} cy={65} r={r} stroke="rgba(0,0,0,0.07)" strokeWidth={stroke} fill="none" />
      <Circle
        cx={65} cy={65} r={r}
        stroke={accent}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 65 65)"
      />
    </Svg>
  )
}

export default function HomeScreen() {
  const theme = useTheme()
  const router = useRouter()
  const profile = useProfileStore((s) => s.profile)
  const macroGoals = useProfileStore((s) => s.macroGoals)
  const workouts = useWorkoutStore((s) => s.workouts)
  const workoutLog = useWorkoutStore((s) => s.workoutLog)
  const foodLog = useNutritionStore((s) => s.foodLog)
  const waterToday = useNutritionStore((s) => s.waterToday)
  const waterGoal = useNutritionStore((s) => s.waterGoal)
  const addWater = useNutritionStore((s) => s.addWater)

  const todayLog = todayFoodLog(foodLog)
  const eaten = todayLog.reduce((s, e) => s + e.cal, 0)
  const protEaten = todayLog.reduce((s, e) => s + e.prot, 0)
  const carbEaten = todayLog.reduce((s, e) => s + e.carbs, 0)
  const fatEaten = todayLog.reduce((s, e) => s + e.fat, 0)

  const dow = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const todayWorkout = workouts.find((w) => w.day === dow)
  const streak = calcStreak(workoutLog)

  const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.outer },
    header: { backgroundColor: theme.header, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 20 },
    greeting: { color: theme.headerText, fontSize: 13, opacity: 0.6, marginBottom: 2 },
    name: { color: theme.headerText, fontSize: 24, fontWeight: '800' },
    streak: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    streakText: { color: theme.accent, fontSize: 13, fontWeight: '700' },
    scroll: { flex: 1 },
    card: { backgroundColor: theme.card, borderRadius: 16, margin: 16, marginBottom: 0, padding: 20 },
    calRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    calCenter: { alignItems: 'center', position: 'relative' },
    calAbsolute: { position: 'absolute', alignItems: 'center', justifyContent: 'center', top: 0, left: 0, right: 0, bottom: 0 },
    calNum: { color: theme.text, fontSize: 22, fontWeight: '800' },
    calLabel: { color: theme.muted, fontSize: 11 },
    macros: { flex: 1, gap: 10 },
    macroRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    macroName: { color: theme.muted, fontSize: 12, width: 14 },
    macroTrack: { flex: 1, height: 6, backgroundColor: theme.bg, borderRadius: 3, overflow: 'hidden' },
    macroVal: { color: theme.text, fontSize: 12, fontWeight: '600', width: 40, textAlign: 'right' },
    sectionTitle: { color: theme.text, fontSize: 16, fontWeight: '800', marginBottom: 12 },
    waterRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    dropWrap: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    waterBtn: { backgroundColor: theme.accent, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, marginLeft: 'auto' },
    waterBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    waterMl: { color: theme.muted, fontSize: 12, marginTop: 4 },
    workoutCard: { backgroundColor: theme.accent, borderRadius: 16, margin: 16, marginBottom: 0, padding: 20 },
    workoutName: { color: '#FFF', fontSize: 18, fontWeight: '800' },
    workoutSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
    startBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, marginTop: 14, alignSelf: 'flex-start' },
    startBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
    noWorkout: { color: theme.muted, fontSize: 14 },
    spacer: { height: 24 },
  })

  const drops = Math.round((waterToday / waterGoal) * 8)

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.greeting}>Hej{profile?.name ? `, ${profile.name}` : ''}! 👋</Text>
        <Text style={s.name}>Dagens översikt</Text>
        {streak > 0 && (
          <View style={s.streak}>
            <Flame size={14} color={theme.accent} />
            <Text style={s.streakText}>{streak} dagars streak</Text>
          </View>
        )}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Calorie card */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Kalorier</Text>
          <View style={s.calRow}>
            <View style={s.calCenter}>
              <CalorieRing eaten={eaten} goal={macroGoals.calories} accent={theme.accent} />
              <View style={s.calAbsolute}>
                <Text style={s.calNum}>{eaten}</Text>
                <Text style={s.calLabel}>/ {macroGoals.calories}</Text>
              </View>
            </View>
            <View style={s.macros}>
              {[
                { label: 'P', val: protEaten, goal: macroGoals.proteinG, color: theme.accent },
                { label: 'K', val: carbEaten, goal: macroGoals.carbsG, color: theme.accent2 },
                { label: 'F', val: fatEaten, goal: macroGoals.fatG, color: '#22A647' },
              ].map((m) => (
                <View key={m.label} style={s.macroRow}>
                  <Text style={s.macroName}>{m.label}</Text>
                  <View style={s.macroTrack}>
                    <View style={{ height: 6, backgroundColor: m.color, borderRadius: 3, width: `${Math.min((m.val / Math.max(m.goal, 1)) * 100, 100)}%` }} />
                  </View>
                  <Text style={s.macroVal}>{m.val}g</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Water */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Vatten</Text>
          <View style={s.waterRow}>
            {Array.from({ length: 8 }).map((_, i) => (
              <View
                key={i}
                style={[s.dropWrap, { backgroundColor: i < drops ? theme.accentLight : theme.bg }]}
              >
                <Droplets size={16} color={i < drops ? theme.accent2 : theme.muted} />
              </View>
            ))}
            <TouchableOpacity style={s.waterBtn} onPress={() => addWater(250)}>
              <Text style={s.waterBtnText}>+ 2,5 dl</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.waterMl}>{waterToday} / {waterGoal} ml</Text>
        </View>

        {/* Today's workout */}
        {todayWorkout ? (
          <TouchableOpacity
            style={s.workoutCard}
            onPress={() => router.push(`/workout/${todayWorkout.id}`)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Zap size={18} color="#FFF" />
              <Text style={s.workoutName}>{todayWorkout.name}</Text>
            </View>
            <Text style={s.workoutSub}>{todayWorkout.exercises.length} övningar</Text>
            <View style={s.startBtn}>
              <Text style={s.startBtnText}>Starta pass →</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={s.card}>
            <Text style={s.sectionTitle}>Dagens pass</Text>
            <Text style={s.noWorkout}>Ingen träning schemalagd idag — vila!</Text>
          </View>
        )}

        <View style={s.spacer} />
      </ScrollView>
    </SafeAreaView>
  )
}
