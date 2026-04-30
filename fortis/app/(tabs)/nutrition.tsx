import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Plus, X } from 'lucide-react-native'
import { useTheme } from '../../src/hooks/useTheme'
import { useProfileStore } from '../../src/store/useProfileStore'
import { useNutritionStore, todayFoodLog } from '../../src/store/useNutritionStore'
import { FOODS } from '../../src/constants/foods'
import { FoodLogEntry } from '../../src/constants/types'
import { today } from '../../src/lib/macroCalc'

const MEALS: { key: FoodLogEntry['meal']; label: string; icon: string }[] = [
  { key: 'breakfast', label: 'Frukost', icon: '🌅' },
  { key: 'lunch', label: 'Lunch', icon: '☀️' },
  { key: 'dinner', label: 'Middag', icon: '🌙' },
  { key: 'snack', label: 'Mellanmål', icon: '🍎' },
]

function AddFoodModal({ meal, onClose }: { meal: FoodLogEntry['meal']; onClose: () => void }) {
  const theme = useTheme()
  const addFoodEntry = useNutritionStore((s) => s.addFoodEntry)
  const customFoods = useNutritionStore((s) => s.customFoods)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<typeof FOODS[0] | null>(null)
  const [amount, setAmount] = useState('100')

  const allFoods = [...FOODS, ...customFoods]
  const filtered = allFoods.filter((f) => !search || f.name.toLowerCase().includes(search.toLowerCase()))

  const macros = selected ? {
    cal: Math.round(selected.cal * Number(amount) / 100),
    prot: Math.round(selected.prot * Number(amount) / 100 * 10) / 10,
    carbs: Math.round(selected.carbs * Number(amount) / 100 * 10) / 10,
    fat: Math.round(selected.fat * Number(amount) / 100 * 10) / 10,
  } : null

  const confirm = () => {
    if (!selected || !amount) return
    const g = Number(amount)
    if (!g) return
    addFoodEntry({
      id: `fl${Date.now()}`,
      date: today(),
      meal,
      foodId: selected.id,
      foodName: selected.name,
      amountG: g,
      cal: Math.round(selected.cal * g / 100),
      prot: Math.round(selected.prot * g / 100 * 10) / 10,
      carbs: Math.round(selected.carbs * g / 100 * 10) / 10,
      fat: Math.round(selected.fat * g / 100 * 10) / 10,
    })
    onClose()
  }

  const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, maxHeight: '90%' },
    handle: { width: 40, height: 4, backgroundColor: theme.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    title: { color: theme.text, fontSize: 18, fontWeight: '800', marginBottom: 12 },
    searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bg, borderRadius: 10, paddingHorizontal: 12, height: 42, borderWidth: 1, borderColor: theme.border, marginBottom: 12 },
    searchInput: { flex: 1, color: theme.text, fontSize: 15, marginLeft: 6 },
    foodItem: { paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: theme.border, flexDirection: 'row' as const, justifyContent: 'space-between' as const },
    foodItemActive: { backgroundColor: theme.accentLight },
    foodName: { color: theme.text, fontSize: 14, fontWeight: '500' as const },
    foodNameActive: { color: theme.accent, fontWeight: '700' as const },
    foodMeta: { color: theme.muted, fontSize: 12 },
    preview: { backgroundColor: theme.bg, borderRadius: 12, padding: 14, marginTop: 12, gap: 8 },
    previewTitle: { color: theme.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
    previewRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const },
    previewLabel: { color: theme.muted, fontSize: 13 },
    previewVal: { color: theme.text, fontSize: 13, fontWeight: '600' },
    amountRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8, marginBottom: 12 },
    amountLabel: { color: theme.text, fontSize: 14 },
    amountInput: { backgroundColor: theme.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: theme.text, fontSize: 15, width: 80, borderWidth: 1, borderColor: theme.border, textAlign: 'center' as const },
    confirmBtn: { backgroundColor: theme.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' as const, marginTop: 12 },
    confirmBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  })

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1}>
          <View style={s.sheet}>
            <View style={s.handle} />
            <Text style={s.title}>Lägg till mat</Text>
            <View style={s.searchWrap}>
              <TextInput style={s.searchInput} value={search} onChangeText={setSearch} placeholder="Sök livsmedel..." placeholderTextColor={theme.muted} />
            </View>
            <FlatList
              data={filtered}
              keyExtractor={(f) => f.id}
              style={{ maxHeight: 200 }}
              renderItem={({ item: f }) => (
                <TouchableOpacity style={[s.foodItem, selected?.id === f.id && s.foodItemActive]} onPress={() => setSelected(f)}>
                  <Text style={[s.foodName, selected?.id === f.id && s.foodNameActive]}>{f.name}</Text>
                  <Text style={s.foodMeta}>{f.cal} kcal/100g</Text>
                </TouchableOpacity>
              )}
            />
            {selected && (
              <View style={s.preview}>
                <Text style={s.previewTitle}>{selected.name}</Text>
                <View style={s.amountRow}>
                  <Text style={s.amountLabel}>Mängd (g):</Text>
                  <TextInput style={s.amountInput} value={amount} onChangeText={setAmount} keyboardType="numeric" />
                </View>
                {macros && (
                  <>
                    <View style={s.previewRow}><Text style={s.previewLabel}>Kalorier</Text><Text style={s.previewVal}>{macros.cal} kcal</Text></View>
                    <View style={s.previewRow}><Text style={s.previewLabel}>Protein</Text><Text style={s.previewVal}>{macros.prot}g</Text></View>
                    <View style={s.previewRow}><Text style={s.previewLabel}>Kolhydrater</Text><Text style={s.previewVal}>{macros.carbs}g</Text></View>
                    <View style={s.previewRow}><Text style={s.previewLabel}>Fett</Text><Text style={s.previewVal}>{macros.fat}g</Text></View>
                  </>
                )}
                <TouchableOpacity style={s.confirmBtn} onPress={confirm}>
                  <Text style={s.confirmBtnText}>Lägg till</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

export default function NutritionScreen() {
  const theme = useTheme()
  const macroGoals = useProfileStore((s) => s.macroGoals)
  const foodLog = useNutritionStore((s) => s.foodLog)
  const removeFoodEntry = useNutritionStore((s) => s.removeFoodEntry)
  const [addMeal, setAddMeal] = useState<FoodLogEntry['meal'] | null>(null)

  const log = todayFoodLog(foodLog)
  const eaten = { cal: log.reduce((s, e) => s + e.cal, 0), prot: log.reduce((s, e) => s + e.prot, 0), carbs: log.reduce((s, e) => s + e.carbs, 0), fat: log.reduce((s, e) => s + e.fat, 0) }

  const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.outer },
    header: { backgroundColor: theme.header, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 20 },
    title: { color: theme.headerText, fontSize: 24, fontWeight: '800' },
    scroll: { flex: 1 },
    summaryCard: { backgroundColor: theme.card, margin: 16, borderRadius: 16, padding: 20 },
    summaryTitle: { color: theme.text, fontSize: 16, fontWeight: '800', marginBottom: 12 },
    calRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
    calNum: { color: theme.accent, fontSize: 28, fontWeight: '900' },
    calGoal: { color: theme.muted, fontSize: 14 },
    macroRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
    macroBox: { flex: 1, backgroundColor: theme.bg, borderRadius: 10, padding: 10, alignItems: 'center' },
    macroVal: { color: theme.text, fontSize: 16, fontWeight: '800' },
    macroLabel: { color: theme.muted, fontSize: 11, marginTop: 2 },
    mealCard: { backgroundColor: theme.card, marginHorizontal: 16, marginBottom: 10, borderRadius: 16, overflow: 'hidden' },
    mealHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
    mealIcon: { fontSize: 20, marginRight: 8 },
    mealName: { color: theme.text, fontSize: 16, fontWeight: '700', flex: 1 },
    mealCal: { color: theme.muted, fontSize: 13 },
    addMealBtn: { padding: 4 },
    foodEntryRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    foodEntryName: { flex: 1, color: theme.text, fontSize: 14 },
    foodEntryMeta: { color: theme.muted, fontSize: 12 },
    removeBtn: { padding: 4 },
    spacer: { height: 24 },
  })

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Kost</Text>
      </View>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>Idag</Text>
          <View style={s.calRow}>
            <Text style={s.calNum}>{eaten.cal}</Text>
            <Text style={s.calGoal}>/ {macroGoals.calories} kcal</Text>
          </View>
          <View style={s.macroRow}>
            {[
              { label: 'Protein', val: eaten.prot, goal: macroGoals.proteinG },
              { label: 'Kolh.', val: eaten.carbs, goal: macroGoals.carbsG },
              { label: 'Fett', val: eaten.fat, goal: macroGoals.fatG },
            ].map((m) => (
              <View key={m.label} style={s.macroBox}>
                <Text style={s.macroVal}>{m.val}g</Text>
                <Text style={s.macroLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {MEALS.map((meal) => {
          const entries = log.filter((e) => e.meal === meal.key)
          const mealCal = entries.reduce((s, e) => s + e.cal, 0)
          return (
            <View key={meal.key} style={s.mealCard}>
              <View style={s.mealHeader}>
                <Text style={s.mealIcon}>{meal.icon}</Text>
                <Text style={s.mealName}>{meal.label}</Text>
                {mealCal > 0 && <Text style={s.mealCal}>{mealCal} kcal</Text>}
                <TouchableOpacity style={s.addMealBtn} onPress={() => setAddMeal(meal.key)}>
                  <Plus size={20} color={theme.accent} />
                </TouchableOpacity>
              </View>
              {entries.map((e) => (
                <View key={e.id} style={s.foodEntryRow}>
                  <Text style={s.foodEntryName}>{e.foodName}</Text>
                  <Text style={s.foodEntryMeta}>{e.amountG}g · {e.cal} kcal</Text>
                  <TouchableOpacity style={s.removeBtn} onPress={() => removeFoodEntry(e.id)}>
                    <X size={16} color={theme.muted} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )
        })}
        <View style={s.spacer} />
      </ScrollView>

      {addMeal && <AddFoodModal meal={addMeal} onClose={() => setAddMeal(null)} />}
    </SafeAreaView>
  )
}
