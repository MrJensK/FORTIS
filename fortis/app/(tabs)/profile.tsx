import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../src/hooks/useTheme'
import { useThemeStore } from '../../src/store/useThemeStore'
import { useProfileStore } from '../../src/store/useProfileStore'
import { useWorkoutStore, calcStreak } from '../../src/store/useWorkoutStore'
import { THEMES } from '../../src/constants/theme'
import AsyncStorage from '@react-native-async-storage/async-storage'

const ACHIEVEMENT_DEFS = [
  { id: 'first_workout', icon: '🏆', name: 'Första steget', desc: 'Slutför ditt första pass' },
  { id: 'three_streak', icon: '🔥', name: 'På rulle', desc: '3 dagar i rad' },
  { id: 'seven_streak', icon: '🔥🔥', name: 'Veckovinnare', desc: '7 dagar i rad' },
  { id: 'five_workouts', icon: '💪', name: 'Hängiven', desc: '5 pass totalt' },
  { id: 'ten_workouts', icon: '⚡', name: 'Maskin', desc: '10 pass totalt' },
  { id: 'early_bird', icon: '🌅', name: 'Morgonfågel', desc: 'Tränat innan kl 08:00' },
  { id: 'marathon', icon: '🏅', name: 'Maraton', desc: '60+ min i ett pass' },
  { id: 'all_muscles', icon: '🎯', name: 'Helkropp', desc: 'Tränat 5+ muskelgrupper' },
  { id: 'twenty_workouts', icon: '👑', name: 'Elit', desc: '20 pass totalt' },
  { id: 'pb', icon: '📈', name: 'Personbästa', desc: 'Sätt ett personligt rekord' },
]

export default function ProfileScreen() {
  const theme = useTheme()
  const themeId = useThemeStore((s) => s.themeId)
  const setTheme = useThemeStore((s) => s.setTheme)
  const profile = useProfileStore((s) => s.profile)
  const macroGoals = useProfileStore((s) => s.macroGoals)
  const workoutLog = useWorkoutStore((s) => s.workoutLog)
  const streak = calcStreak(workoutLog)

  const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.outer },
    header: { backgroundColor: theme.header, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 20 },
    title: { color: theme.headerText, fontSize: 24, fontWeight: '800' },
    scroll: { flex: 1 },
    card: { backgroundColor: theme.card, borderRadius: 16, margin: 16, marginBottom: 0, padding: 20 },
    sectionTitle: { color: theme.text, fontSize: 16, fontWeight: '800', marginBottom: 14 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
    rowLabel: { color: theme.muted, fontSize: 14 },
    rowValue: { color: theme.text, fontSize: 14, fontWeight: '600' },
    statsRow: { flexDirection: 'row', gap: 10 },
    statBox: { flex: 1, backgroundColor: theme.bg, borderRadius: 12, padding: 14, alignItems: 'center' },
    statNum: { color: theme.accent, fontSize: 24, fontWeight: '900' },
    statLabel: { color: theme.muted, fontSize: 12, marginTop: 2 },
    themeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
    themeSwatch: { width: 44, height: 44, borderRadius: 22 },
    themeSwatchActive: { borderWidth: 3, borderColor: theme.text },
    themeLabel: { color: theme.muted, fontSize: 11, textAlign: 'center', marginTop: 4 },
    achGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    achItem: { width: '30%', alignItems: 'center', backgroundColor: theme.bg, borderRadius: 12, padding: 10, opacity: 0.4 },
    achItemUnlocked: { backgroundColor: theme.accentLight, opacity: 1 },
    achIcon: { fontSize: 24, marginBottom: 4 },
    achName: { color: theme.text, fontSize: 11, fontWeight: '700', textAlign: 'center' },
    achDesc: { color: theme.muted, fontSize: 10, textAlign: 'center', marginTop: 2 },
    resetBtn: { backgroundColor: '#FEE2E2', borderRadius: 12, paddingVertical: 14, alignItems: 'center', margin: 16 },
    resetBtnText: { color: '#E53E3E', fontSize: 15, fontWeight: '700' },
    spacer: { height: 8 },
  })

  const unlocked = new Set<string>()
  if (workoutLog.length >= 1) unlocked.add('first_workout')
  if (streak >= 3) unlocked.add('three_streak')
  if (streak >= 7) unlocked.add('seven_streak')
  if (workoutLog.length >= 5) unlocked.add('five_workouts')
  if (workoutLog.length >= 10) unlocked.add('ten_workouts')
  if (workoutLog.length >= 20) unlocked.add('twenty_workouts')
  if (workoutLog.some((e) => e.durationMin >= 60)) unlocked.add('marathon')

  const resetApp = () => {
    Alert.alert('Återställ', 'Radera all data? Kan inte ångras.', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Återställ', style: 'destructive',
        onPress: async () => { await AsyncStorage.clear() }
      },
    ])
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Profil</Text>
      </View>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Statistik</Text>
          <View style={s.statsRow}>
            <View style={s.statBox}><Text style={s.statNum}>{workoutLog.length}</Text><Text style={s.statLabel}>Pass totalt</Text></View>
            <View style={s.statBox}><Text style={s.statNum}>{streak}</Text><Text style={s.statLabel}>Streak 🔥</Text></View>
            <View style={s.statBox}><Text style={s.statNum}>{macroGoals.calories}</Text><Text style={s.statLabel}>Kcal/dag</Text></View>
          </View>
        </View>

        {/* Profile data */}
        {profile && (
          <View style={[s.card, { marginTop: 12 }]}>
            <Text style={s.sectionTitle}>Profil</Text>
            {[
              { label: 'Namn', value: profile.name },
              { label: 'Vikt', value: `${profile.weightKg} kg` },
              { label: 'Längd', value: `${profile.heightCm} cm` },
              { label: 'Mål', value: profile.goal === 'lose' ? 'Gå ner' : profile.goal === 'gain' ? 'Bygga muskler' : 'Hålla vikt' },
            ].map((r) => (
              <View key={r.label} style={s.row}>
                <Text style={s.rowLabel}>{r.label}</Text>
                <Text style={s.rowValue}>{r.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Theme */}
        <View style={[s.card, { marginTop: 12 }]}>
          <Text style={s.sectionTitle}>Tema</Text>
          <View style={s.themeRow}>
            {Object.values(THEMES).map((t) => (
              <TouchableOpacity key={t.id} onPress={() => setTheme(t.id)} style={{ alignItems: 'center' }}>
                <View style={[s.themeSwatch, { backgroundColor: t.accent }, themeId === t.id && s.themeSwatchActive]} />
                <Text style={s.themeLabel}>{t.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View style={[s.card, { marginTop: 12 }]}>
          <Text style={s.sectionTitle}>Achievements</Text>
          <View style={s.achGrid}>
            {ACHIEVEMENT_DEFS.map((a) => (
              <View key={a.id} style={[s.achItem, unlocked.has(a.id) && s.achItemUnlocked]}>
                <Text style={s.achIcon}>{a.icon}</Text>
                <Text style={s.achName}>{a.name}</Text>
                <Text style={s.achDesc}>{a.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.spacer} />
        <TouchableOpacity style={s.resetBtn} onPress={resetApp}>
          <Text style={s.resetBtnText}>Återställ all data</Text>
        </TouchableOpacity>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  )
}
