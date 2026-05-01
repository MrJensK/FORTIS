import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Pencil, Plus } from 'lucide-react-native'
import { Svg, Polyline, Circle, Line, Text as SvgText } from 'react-native-svg'
import { useMeasurementsStore } from '../../src/store/useMeasurementsStore'
import { useTheme } from '../../src/hooks/useTheme'
import { useThemeStore } from '../../src/store/useThemeStore'
import { useProfileStore } from '../../src/store/useProfileStore'
import { useWorkoutStore, calcStreak } from '../../src/store/useWorkoutStore'
import { THEMES } from '../../src/constants/theme'
import { calcTDEE, calcMacros, PACE_LABELS, today } from '../../src/lib/macroCalc'
import { Profile, MeasurementEntry } from '../../src/constants/types'
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

function WeightGraph({ data }: { data: MeasurementEntry[] }) {
  const theme = useTheme()
  const svgW = Dimensions.get('window').width - 72
  const svgH = 130
  const pl = 44, pr = 12, pt = 12, pb = 28

  const pts = [...data]
    .filter((m) => m.weightKg !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7)

  if (pts.length < 2) {
    return (
      <View style={{ paddingVertical: 20, alignItems: 'center' }}>
        <Text style={{ color: theme.muted, fontSize: 13 }}>Logga minst 2 mätningar för att se graf</Text>
      </View>
    )
  }

  const ws = pts.map((p) => p.weightKg!)
  const minW = Math.min(...ws) - 0.5
  const maxW = Math.max(...ws) + 0.5
  const wRange = maxW - minW
  const gW = svgW - pl - pr
  const gH = svgH - pt - pb

  const tx = (i: number) => pl + (i / (pts.length - 1)) * gW
  const ty = (w: number) => pt + (1 - (w - minW) / wRange) * gH
  const polyPts = pts.map((p, i) => `${tx(i)},${ty(p.weightKg!)}`).join(' ')
  const minActual = Math.min(...ws)
  const maxActual = Math.max(...ws)

  return (
    <Svg width={svgW} height={svgH}>
      {[minActual, (minActual + maxActual) / 2, maxActual].map((w, i) => (
        <Line key={i} x1={pl} y1={ty(w)} x2={svgW - pr} y2={ty(w)} stroke={theme.border} strokeWidth={1} strokeDasharray="3,4" />
      ))}
      {[minActual, maxActual].map((w, i) => (
        <SvgText key={i} x={pl - 6} y={ty(w) + 4} fontSize={10} fill={theme.muted} textAnchor="end">{w.toFixed(1)}</SvgText>
      ))}
      <Polyline points={polyPts} fill="none" stroke={theme.accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <Circle key={i} cx={tx(i)} cy={ty(p.weightKg!)} r={3.5} fill={theme.accent} />
      ))}
      {[0, pts.length - 1].map((i) => (
        <SvgText key={i} x={tx(i)} y={svgH - 6} fontSize={9} fill={theme.muted} textAnchor={i === 0 ? 'start' : 'end'}>
          {pts[i].date.slice(5).replace('-', '/')}
        </SvgText>
      ))}
    </Svg>
  )
}

function LogMeasurementModal({ onClose }: { onClose: () => void }) {
  const t = useTheme()
  const addMeasurement = useMeasurementsStore((s) => s.addMeasurement)
  const [weight, setWeight] = useState('')
  const [waist, setWaist] = useState('')
  const [bodyFat, setBodyFat] = useState('')

  const save = async () => {
    if (!weight && !waist && !bodyFat) return
    await addMeasurement({
      id: `m${Date.now()}`,
      date: today(),
      weightKg: weight ? Number(weight) : undefined,
      waistCm: waist ? Number(waist) : undefined,
      bodyFatPct: bodyFat ? Number(bodyFat) : undefined,
    })
    onClose()
  }

  const fieldStyle = { backgroundColor: t.bg, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: t.text, fontSize: 15 as const, marginBottom: 14, borderWidth: 1, borderColor: t.border }
  const labelStyle = { color: t.muted, fontSize: 11 as const, fontWeight: '700' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const, marginBottom: 6 }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} activeOpacity={1} onPress={onClose}>
        <View>
          <ScrollView style={{ backgroundColor: t.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            <View style={{ width: 40, height: 4, backgroundColor: t.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
            <Text style={{ color: t.text, fontSize: 20, fontWeight: '800', marginBottom: 20 }}>Logga mätning</Text>
            {([['Vikt (kg)', weight, setWeight], ['Midja (cm)', waist, setWaist], ['Fettprocent (%)', bodyFat, setBodyFat]] as const).map(([label, val, setter]) => (
              <View key={label}>
                <Text style={labelStyle}>{label}</Text>
                <TextInput style={fieldStyle} value={val} onChangeText={setter} keyboardType="decimal-pad" placeholderTextColor={t.muted} placeholder={label.split(' ')[1]?.replace(/[()]/g, '') ?? ''} />
              </View>
            ))}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: t.bg, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }} onPress={onClose}>
                <Text style={{ color: t.text, fontWeight: '700' }}>Avbryt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 2, backgroundColor: t.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }} onPress={save}>
                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 15 }}>Spara</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

function EditProfileModal({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const t = useTheme()
  const setProfile = useProfileStore((s) => s.setProfile)
  const setMacroGoals = useProfileStore((s) => s.setMacroGoals)

  const [weight, setWeight] = useState(String(profile.weightKg))
  const [goalWeight, setGoalWeight] = useState(String(profile.goalWeightKg))
  const [goal, setGoal] = useState(profile.goal)
  const [pace, setPace] = useState(profile.pace ?? 'moderate')
  const [activity, setActivity] = useState(profile.activityLevel)

  const previewMacros = (() => {
    const tdee = calcTDEE({ gender: profile.gender, age: profile.age, heightCm: profile.heightCm, weightKg: Number(weight) || profile.weightKg, activityLevel: activity })
    return calcMacros(tdee, goal, pace, Number(weight) || profile.weightKg)
  })()

  const save = async () => {
    const updated: Profile = {
      ...profile,
      weightKg: Number(weight) || profile.weightKg,
      goalWeightKg: Number(goalWeight) || profile.goalWeightKg,
      goal, pace, activityLevel: activity,
      macroGoals: previewMacros,
      updatedAt: new Date().toISOString(),
    }
    await setProfile(updated)
    await setMacroGoals(previewMacros)
    onClose()
  }

  const fieldStyle = { backgroundColor: t.bg, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: t.text, fontSize: 15 as const, marginBottom: 14, borderWidth: 1, borderColor: t.border }
  const labelStyle = { color: t.muted, fontSize: 11 as const, fontWeight: '700' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const, marginBottom: 6 }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} activeOpacity={1} onPress={onClose}>
        <View>
          <ScrollView style={{ backgroundColor: t.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '92%' }} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            <View style={{ width: 40, height: 4, backgroundColor: t.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
            <Text style={{ color: t.text, fontSize: 20, fontWeight: '800', marginBottom: 20 }}>Redigera profil</Text>

            <Text style={labelStyle}>Nuvarande vikt (kg)</Text>
            <TextInput style={fieldStyle} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholderTextColor={t.muted} />

            <Text style={labelStyle}>Målvikt (kg)</Text>
            <TextInput style={fieldStyle} value={goalWeight} onChangeText={setGoalWeight} keyboardType="decimal-pad" placeholderTextColor={t.muted} />

            <Text style={labelStyle}>Mål</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {([['lose','Gå ner'],['maintain','Hålla vikt'],['gain','Bygga muskler']] as const).map(([v, l]) => (
                <TouchableOpacity key={v} onPress={() => setGoal(v)}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: goal === v ? t.accent : t.bg, borderWidth: 1, borderColor: goal === v ? t.accent : t.border }}>
                  <Text style={{ color: goal === v ? '#FFF' : t.text, fontSize: 13, fontWeight: '600' }}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {goal !== 'maintain' && (
              <>
                <Text style={labelStyle}>Takt</Text>
                {PACE_LABELS[goal].map((p) => (
                  <TouchableOpacity key={p.pace} onPress={() => setPace(p.pace)}
                    style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: t.bg, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: pace === p.pace ? t.accent : 'transparent' }}>
                    <Text style={{ color: pace === p.pace ? t.accent : t.text, fontSize: 15, fontWeight: '700' }}>{p.label}</Text>
                    <Text style={{ color: t.muted, fontSize: 13 }}>{p.desc}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            <Text style={labelStyle}>Aktivitetsnivå</Text>
            {([['sedentary','Stillasittande'],['light','Lätt aktiv'],['moderate','Måttligt aktiv'],['very_active','Mycket aktiv']] as const).map(([v, l]) => (
              <TouchableOpacity key={v} onPress={() => setActivity(v)}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: t.bg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, borderWidth: 1.5, borderColor: activity === v ? t.accent : 'transparent' }}>
                <Text style={{ color: activity === v ? t.accent : t.text, fontSize: 14, fontWeight: '600' }}>{l}</Text>
              </TouchableOpacity>
            ))}

            <View style={{ backgroundColor: t.accentLight, borderRadius: 12, padding: 14, marginTop: 4, marginBottom: 16 }}>
              <Text style={{ color: t.accent, fontSize: 13, fontWeight: '700', marginBottom: 8 }}>Nytt kaloriintag</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: t.text, fontSize: 22, fontWeight: '900' }}>{previewMacros.calories} kcal</Text>
              </View>
              <Text style={{ color: t.muted, fontSize: 12, marginTop: 4 }}>
                P {previewMacros.proteinG}g · K {previewMacros.carbsG}g · F {previewMacros.fatG}g
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: t.bg, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }} onPress={onClose}>
                <Text style={{ color: t.text, fontWeight: '700' }}>Avbryt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 2, backgroundColor: t.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }} onPress={save}>
                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 15 }}>Spara</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

export default function ProfileScreen() {
  const theme = useTheme()
  const themeId = useThemeStore((s) => s.themeId)
  const setTheme = useThemeStore((s) => s.setTheme)
  const profile = useProfileStore((s) => s.profile)
  const macroGoals = useProfileStore((s) => s.macroGoals)
  const workoutLog = useWorkoutStore((s) => s.workoutLog)
  const streak = calcStreak(workoutLog)
  const measurements = useMeasurementsStore((s) => s.measurements)
  const [showEdit, setShowEdit] = useState(false)
  const [showLogMeasurement, setShowLogMeasurement] = useState(false)
  const sortedMeasurements = [...measurements].sort((a, b) => b.date.localeCompare(a.date))

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
      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Statistik</Text>
          <View style={s.statsRow}>
            <View style={s.statBox}><Text style={s.statNum}>{workoutLog.length}</Text><Text style={s.statLabel}>Pass totalt</Text></View>
            <View style={s.statBox}><Text style={s.statNum}>{streak}</Text><Text style={s.statLabel}>Streak 🔥</Text></View>
            <View style={s.statBox}><Text style={s.statNum}>{macroGoals.calories}</Text><Text style={s.statLabel}>Kcal/dag</Text></View>
          </View>
        </View>

        {/* Progress graph */}
        <View style={[s.card, { marginTop: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[s.sectionTitle, { marginBottom: 0, flex: 1 }]}>Progress</Text>
            <TouchableOpacity
              onPress={() => setShowLogMeasurement(true)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.accentLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}
            >
              <Plus size={14} color={theme.accent} />
              <Text style={{ color: theme.accent, fontSize: 13, fontWeight: '700' }}>Logga</Text>
            </TouchableOpacity>
          </View>
          <WeightGraph data={measurements} />
          {sortedMeasurements.length === 0 ? (
            <Text style={{ color: theme.muted, fontSize: 13, textAlign: 'center', paddingVertical: 8 }}>Inga mätningar ännu – logga din första!</Text>
          ) : (
            sortedMeasurements.slice(0, 4).map((m) => (
              <View key={m.id} style={[s.row, { borderBottomWidth: 0 }]}>
                <Text style={s.rowLabel}>{m.date.slice(5).replace('-', '/')}</Text>
                <Text style={s.rowValue}>
                  {[m.weightKg ? `${m.weightKg} kg` : null, m.waistCm ? `${m.waistCm} cm` : null, m.bodyFatPct ? `${m.bodyFatPct}%` : null].filter(Boolean).join(' · ')}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Profile data */}
        {profile && (
          <View style={[s.card, { marginTop: 12 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <Text style={[s.sectionTitle, { marginBottom: 0, flex: 1 }]}>Profil</Text>
              <TouchableOpacity
                onPress={() => setShowEdit(true)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.accentLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}
              >
                <Pencil size={14} color={theme.accent} />
                <Text style={{ color: theme.accent, fontSize: 13, fontWeight: '700' }}>Redigera</Text>
              </TouchableOpacity>
            </View>
            {[
              { label: 'Namn', value: profile.name },
              { label: 'Vikt', value: `${profile.weightKg} kg` },
              { label: 'Målvikt', value: `${profile.goalWeightKg} kg` },
              { label: 'Längd', value: `${profile.heightCm} cm` },
              { label: 'Mål', value: profile.goal === 'lose' ? 'Gå ner' : profile.goal === 'gain' ? 'Bygga muskler' : 'Hålla vikt' },
              ...(profile.goal !== 'maintain' && profile.pace ? [{ label: 'Takt', value: PACE_LABELS[profile.goal].find(p => p.pace === profile.pace)?.label ?? profile.pace }] : []),
              { label: 'Kaloriintag', value: `${macroGoals.calories} kcal/dag` },
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
      {profile && showEdit && <EditProfileModal profile={profile} onClose={() => setShowEdit(false)} />}
      {showLogMeasurement && <LogMeasurementModal onClose={() => setShowLogMeasurement(false)} />}
    </SafeAreaView>
  )
}
