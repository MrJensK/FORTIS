import { useState, useEffect, useRef } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Svg, Circle } from 'react-native-svg'
import { useTheme } from '../../src/hooks/useTheme'
import { useProfileStore } from '../../src/store/useProfileStore'
import { calcTDEE, calcMacros, PACE_LABELS } from '../../src/lib/macroCalc'
import { Profile } from '../../src/constants/types'

const STEPS = 5

function SplashIntro({ onDone }: { onDone: () => void }) {
  const progress = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(1)).current
  const rotate = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progress, { toValue: 1, duration: 2400, useNativeDriver: false }),
      Animated.loop(Animated.timing(rotate, { toValue: 1, duration: 1800, useNativeDriver: true })),
    ]).start()
    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true }).start(onDone)
    }, 2800)
    return () => clearTimeout(t)
  }, [])

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })

  return (
    <Animated.View style={{ flex: 1, backgroundColor: '#0F0F0F', alignItems: 'center', justifyContent: 'center', opacity }}>
      <Animated.View style={{ transform: [{ rotate: spin }], marginBottom: 32 }}>
        <Svg width={100} height={100} viewBox="0 0 100 100">
          <Circle cx={50} cy={50} r={40} stroke="rgba(232,93,38,0.2)" strokeWidth={6} fill="none" />
          <Circle cx={50} cy={50} r={40} stroke="#E85D26" strokeWidth={6} fill="none"
            strokeDasharray="60 192" strokeLinecap="round" transform="rotate(-90 50 50)" />
        </Svg>
      </Animated.View>
      <Text style={{ color: '#FFF', fontSize: 38, fontWeight: '900', letterSpacing: 6, marginBottom: 48 }}>FORTIS</Text>
      <View style={{ width: 160, height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
        <Animated.View style={{ height: 4, backgroundColor: '#E85D26', borderRadius: 2, width: barWidth }} />
      </View>
    </Animated.View>
  )
}

type OBData = {
  name: string; gender: 'male' | 'female' | 'other'
  age: string; height: string; weight: string; goalWeight: string
  goal: 'lose' | 'maintain' | 'gain'
  pace: 'slow' | 'moderate' | 'fast'
  activity: 'sedentary' | 'light' | 'moderate' | 'very_active'
}

const DEFAULT_OB: OBData = { name: '', gender: 'male', age: '', height: '', weight: '', goalWeight: '', goal: 'maintain', pace: 'moderate', activity: 'moderate' }

export default function OnboardingScreen() {
  const theme = useTheme()
  const router = useRouter()
  const setProfile = useProfileStore((s) => s.setProfile)
  const setMacroGoals = useProfileStore((s) => s.setMacroGoals)
  const [showSplash, setShowSplash] = useState(true)
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OBData>(DEFAULT_OB)

  if (showSplash) return <SplashIntro onDone={() => setShowSplash(false)} />

  const set = (field: keyof OBData, val: string) => setData((d) => ({ ...d, [field]: val }))

  const macros = (() => {
    const age = Number(data.age) || 25
    const h = Number(data.height) || 175
    const w = Number(data.weight) || 75
    const tdee = calcTDEE({ gender: data.gender, age, heightCm: h, weightKg: w, activityLevel: data.activity })
    return calcMacros(tdee, data.goal, data.pace, w)
  })()

  const save = async () => {
    const p: Profile = {
      id: `p${Date.now()}`,
      name: data.name || 'Användare',
      gender: data.gender,
      age: Number(data.age) || 25,
      heightCm: Number(data.height) || 175,
      weightKg: Number(data.weight) || 75,
      goalWeightKg: Number(data.goalWeight) || Number(data.weight) || 75,
      goal: data.goal,
      pace: data.pace,
      activityLevel: data.activity,
      macroGoals: macros,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await setProfile(p)
    await setMacroGoals(macros)
    router.replace('/(tabs)')
  }

  const skip = async () => {
    const p: Profile = {
      id: `p${Date.now()}`, name: 'Användare', gender: 'male', age: 25,
      heightCm: 175, weightKg: 75, goalWeightKg: 75, goal: 'maintain', pace: 'moderate',
      activityLevel: 'moderate', macroGoals: { calories: 2200, proteinG: 165, carbsG: 220, fatG: 73 },
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    await setProfile(p)
    await setMacroGoals(p.macroGoals)
    router.replace('/(tabs)')
  }

  const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.bg },
    scroll: { flex: 1 },
    inner: { flex: 1, padding: 24 },
    progressRow: { flexDirection: 'row', gap: 6, marginBottom: 32 },
    dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: theme.border },
    dotActive: { backgroundColor: theme.accent },
    stepTitle: { color: theme.text, fontSize: 26, fontWeight: '900', marginBottom: 8 },
    stepDesc: { color: theme.muted, fontSize: 15, marginBottom: 32, lineHeight: 22 },
    label: { color: theme.muted, fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
    input: { backgroundColor: theme.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: theme.text, fontSize: 16, borderWidth: 1, borderColor: theme.border, marginBottom: 16 },
    radioRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    radioOpt: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, alignItems: 'center' },
    radioOptActive: { backgroundColor: theme.accent, borderColor: theme.accent },
    radioText: { color: theme.text, fontSize: 14, fontWeight: '600' as const },
    radioTextActive: { color: '#FFF' },
    macroRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
    macroName: { color: theme.muted, fontSize: 15 },
    macroVal: { color: theme.text, fontSize: 15, fontWeight: '700' },
    doneIcon: { fontSize: 56, textAlign: 'center', marginBottom: 16 },
    doneTitle: { color: theme.text, fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
    doneSub: { color: theme.muted, fontSize: 15, textAlign: 'center', lineHeight: 22 },
    footer: { padding: 24, paddingTop: 0, gap: 10 },
    nextBtn: { backgroundColor: theme.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    nextBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
    backBtn: { backgroundColor: theme.card, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.border },
    backBtnText: { color: theme.text, fontSize: 15, fontWeight: '600' },
    skipBtn: { alignItems: 'center', paddingVertical: 8 },
    skipText: { color: theme.muted, fontSize: 14 },
  })

  const renderStep = () => {
    switch (step) {
      case 1: return (
        <>
          <Text style={s.stepTitle}>Välkommen till FORTIS 🚀</Text>
          <Text style={s.stepDesc}>Din personliga träningskompis. Sätt upp mål, följ din progress och bli starkare — varje dag.</Text>
          <Text style={s.label}>Ditt namn</Text>
          <TextInput style={s.input} value={data.name} onChangeText={(v) => set('name', v)} placeholder="Ditt namn" placeholderTextColor={theme.muted} />
        </>
      )
      case 2: return (
        <>
          <Text style={s.stepTitle}>Din profil</Text>
          <Text style={s.label}>Kön</Text>
          <View style={s.radioRow}>
            {[['male','Man'],['female','Kvinna'],['other','Annat']].map(([v, l]) => (
              <TouchableOpacity key={v} style={[s.radioOpt, data.gender === v && s.radioOptActive]} onPress={() => set('gender', v)}>
                <Text style={[s.radioText, data.gender === v && s.radioTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.label}>Ålder</Text>
          <TextInput style={s.input} value={data.age} onChangeText={(v) => set('age', v)} placeholder="år" keyboardType="numeric" placeholderTextColor={theme.muted} />
          <Text style={s.label}>Längd (cm)</Text>
          <TextInput style={s.input} value={data.height} onChangeText={(v) => set('height', v)} placeholder="cm" keyboardType="numeric" placeholderTextColor={theme.muted} />
          <Text style={s.label}>Vikt (kg)</Text>
          <TextInput style={s.input} value={data.weight} onChangeText={(v) => set('weight', v)} placeholder="kg" keyboardType="decimal-pad" placeholderTextColor={theme.muted} />
        </>
      )
      case 3: return (
        <>
          <Text style={s.stepTitle}>Ditt mål</Text>
          <View style={s.radioRow}>
            {[['lose','Gå ner'],['maintain','Hålla vikt'],['gain','Bygga muskler']].map(([v, l]) => (
              <TouchableOpacity key={v} style={[s.radioOpt, data.goal === v && s.radioOptActive]} onPress={() => set('goal', v)}>
                <Text style={[s.radioText, data.goal === v && s.radioTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.label}>Målvikt (kg)</Text>
          <TextInput style={s.input} value={data.goalWeight} onChangeText={(v) => set('goalWeight', v)} placeholder="kg" keyboardType="decimal-pad" placeholderTextColor={theme.muted} />
          {data.goal !== 'maintain' && (
            <>
              <Text style={s.label}>Takt</Text>
              {PACE_LABELS[data.goal].map((p) => (
                <TouchableOpacity
                  key={p.pace}
                  style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.card, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: data.pace === p.pace ? theme.accent : 'transparent' }]}
                  onPress={() => set('pace', p.pace)}
                >
                  <Text style={{ color: data.pace === p.pace ? theme.accent : theme.text, fontSize: 15, fontWeight: '700' }}>{p.label}</Text>
                  <Text style={{ color: theme.muted, fontSize: 13 }}>{p.desc}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
          <Text style={s.label}>Aktivitetsnivå</Text>
          {[
            ['sedentary','Stillasittande'],['light','Lätt aktiv (1–3 dagar/v)'],
            ['moderate','Måttligt aktiv (3–5 dagar/v)'],['very_active','Mycket aktiv (6–7 dagar/v)'],
          ].map(([v, l]) => (
            <TouchableOpacity key={v} style={[s.radioOpt, data.activity === v && s.radioOptActive, { marginBottom: 8 }]} onPress={() => set('activity', v)}>
              <Text style={[s.radioText, data.activity === v && s.radioTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </>
      )
      case 4: return (
        <>
          <Text style={s.stepTitle}>Dina mål</Text>
          <Text style={s.stepDesc}>Baserat på dina uppgifter rekommenderar vi:</Text>
          {[
            ['Kalorier', `${macros.calories} kcal`],
            ['Protein', `${macros.proteinG} g`],
            ['Kolhydrater', `${macros.carbsG} g`],
            ['Fett', `${macros.fatG} g`],
          ].map(([n, v]) => (
            <View key={n} style={s.macroRow}>
              <Text style={s.macroName}>{n}</Text>
              <Text style={s.macroVal}>{v}</Text>
            </View>
          ))}
        </>
      )
      case 5: return (
        <>
          <Text style={s.doneIcon}>🎉</Text>
          <Text style={s.doneTitle}>Redo att köra, {data.name || 'champ'}!</Text>
          <Text style={s.doneSub}>Ditt program är klart. Börja med att kolla in ditt schema och hoppa in i ditt första pass.</Text>
        </>
      )
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={s.inner}>
          <View style={s.progressRow}>
            {Array.from({ length: STEPS }).map((_, i) => (
              <View key={i} style={[s.dot, i < step && s.dotActive]} />
            ))}
          </View>
          {renderStep()}
        </View>
      </ScrollView>
      <View style={s.footer}>
        <TouchableOpacity style={s.nextBtn} onPress={step < STEPS ? () => setStep(step + 1) : save}>
          <Text style={s.nextBtnText}>{step < STEPS ? 'Nästa' : 'Kom igång!'}</Text>
        </TouchableOpacity>
        {step > 1 && (
          <TouchableOpacity style={s.backBtn} onPress={() => setStep(step - 1)}>
            <Text style={s.backBtnText}>Tillbaka</Text>
          </TouchableOpacity>
        )}
        {step === 1 && (
          <TouchableOpacity style={s.skipBtn} onPress={skip}>
            <Text style={s.skipText}>Hoppa över</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}
