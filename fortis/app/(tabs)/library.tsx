import { useState } from 'react'
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Search, SlidersHorizontal, Plus } from 'lucide-react-native'
import { useTheme } from '../../src/hooks/useTheme'
import { useWorkoutStore } from '../../src/store/useWorkoutStore'
import { EXERCISES, EQUIP_CHIPS, MUSCLE_GROUPS, DIFFICULTIES } from '../../src/constants/exercises'
import { Exercise } from '../../src/constants/types'

const EQUIP_BG: Record<string, string> = {
  Kroppsvikt: '#FEF0EB', Hantel: '#EBF0FE', Kettlebell: '#EAFAEE',
  Skivstång: '#FFF8E6', Kabelmaskin: '#F3EBFE', Maskin: '#F0F0EE',
}

function ExerciseDetailModal({ ex, onClose, onDelete }: { ex: Exercise; onClose: () => void; onDelete?: () => void }) {
  const t = useTheme()
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1}>
          <ScrollView style={{ backgroundColor: t.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '90%' }}>
            <View style={{ width: 40, height: 4, backgroundColor: t.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
            <Text style={{ color: t.text, fontSize: 20, fontWeight: '800', marginBottom: 12 }}>{ex.name}</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <View style={{ backgroundColor: t.accentLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}><Text style={{ fontSize: 12, fontWeight: '700', color: t.accent }}>{ex.muscle}</Text></View>
              <View style={{ backgroundColor: t.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}><Text style={{ fontSize: 12, fontWeight: '700', color: t.muted }}>{ex.equip}</Text></View>
              <View style={{ backgroundColor: t.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}><Text style={{ fontSize: 12, fontWeight: '700', color: t.muted }}>{ex.diff}</Text></View>
              {ex.isCustom && <View style={{ backgroundColor: t.accentLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}><Text style={{ fontSize: 12, fontWeight: '700', color: t.accent }}>EIGEN</Text></View>}
            </View>
            {ex.secondary ? (
              <>
                <Text style={{ color: t.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>Sekundära muskler</Text>
                <Text style={{ color: t.text, fontSize: 14, marginBottom: 16 }}>{ex.secondary}</Text>
              </>
            ) : null}
            <Text style={{ color: t.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>Utförande</Text>
            {ex.instructions.map((step, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#FFF', fontSize: 11, fontWeight: '700' }}>{i + 1}</Text></View>
                <Text style={{ flex: 1, color: t.text, fontSize: 14, lineHeight: 20 }}>{step}</Text>
              </View>
            ))}
            {ex.isCustom && onDelete && (
              <TouchableOpacity style={{ backgroundColor: '#FEE2E2', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 }} onPress={onDelete}>
                <Text style={{ color: '#E53E3E', fontSize: 15, fontWeight: '700' }}>🗑 Ta bort övning</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={{ backgroundColor: t.bg, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 }} onPress={onClose}>
              <Text style={{ color: t.text, fontSize: 15, fontWeight: '700' }}>Stäng</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

function Chip({ label, active, onPress, theme }: { label: string; active: boolean; onPress: () => void; theme: ReturnType<typeof useTheme> }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: active ? theme.accent : theme.bg, borderWidth: 1, borderColor: active ? theme.accent : theme.border }}
    >
      <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#FFF' : theme.text }}>{label}</Text>
    </TouchableOpacity>
  )
}

function CreateExerciseModal({ onClose, onSave }: { onClose: () => void; onSave: (ex: Exercise) => void }) {
  const t = useTheme()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [muscle, setMuscle] = useState('Bröst')
  const [secondary, setSecondary] = useState('')
  const [equip, setEquip] = useState('Kroppsvikt')
  const [diff, setDiff] = useState<Exercise['diff']>('Nybörjare')
  const [type, setType] = useState<Exercise['type']>('Styrka')
  const [instructions, setInstructions] = useState([''])

  const muscles = ['Bröst', 'Rygg', 'Ben', 'Axlar', 'Armar', 'Core', 'Helkropp', 'Kondition']
  const equips = ['Kroppsvikt', 'Hantel', 'Kettlebell', 'Skivstång', 'Kabelmaskin', 'Maskin', 'Motståndsband', 'Löpband']
  const fieldStyle = { backgroundColor: t.bg, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: t.text, fontSize: 15 as const, marginBottom: 14, borderWidth: 1, borderColor: t.border }
  const labelStyle = { color: t.muted, fontSize: 11 as const, fontWeight: '700' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const, marginBottom: 6 }

  const save = () => {
    if (!name.trim()) return
    onSave({ id: `custom_${Date.now()}`, name: name.trim(), icon: icon.trim() || '⚡', muscle, secondary, equip, diff, type, instructions: instructions.filter((s) => s.trim()), isCustom: true })
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1}>
          <ScrollView style={{ backgroundColor: t.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '95%' }} keyboardShouldPersistTaps="handled">
            <View style={{ width: 40, height: 4, backgroundColor: t.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
            <Text style={{ color: t.text, fontSize: 20, fontWeight: '800', marginBottom: 16 }}>Skapa övning</Text>
            <Text style={labelStyle}>Namn</Text>
            <TextInput style={fieldStyle} value={name} onChangeText={setName} placeholder="Övningens namn" placeholderTextColor={t.muted} />
            <Text style={labelStyle}>Ikon (emoji)</Text>
            <TextInput style={[fieldStyle, { width: 80 }]} value={icon} onChangeText={setIcon} placeholder="💪" placeholderTextColor={t.muted} maxLength={2} />
            <Text style={labelStyle}>Muskelgrupp</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {muscles.map((m) => <Chip key={m} label={m} active={muscle === m} onPress={() => setMuscle(m)} theme={t} />)}
            </View>
            <Text style={labelStyle}>Utrustning</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {equips.map((e) => <Chip key={e} label={e} active={equip === e} onPress={() => setEquip(e)} theme={t} />)}
            </View>
            <Text style={labelStyle}>Svårighet</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {(['Nybörjare', 'Medel', 'Avancerad'] as const).map((d) => <Chip key={d} label={d} active={diff === d} onPress={() => setDiff(d)} theme={t} />)}
            </View>
            <Text style={labelStyle}>Instruktioner</Text>
            {instructions.map((step, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <TextInput style={[fieldStyle, { flex: 1, marginBottom: 0 }]} value={step} onChangeText={(v) => { const a = [...instructions]; a[i] = v; setInstructions(a) }} placeholder={`Steg ${i + 1}...`} placeholderTextColor={t.muted} />
                <TouchableOpacity style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' }} onPress={() => { if (instructions.length > 1) setInstructions(instructions.filter((_, j) => j !== i)) }}>
                  <Text style={{ color: '#E53E3E', fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={{ paddingVertical: 10, alignItems: 'center' }} onPress={() => setInstructions([...instructions, ''])}>
              <Text style={{ color: t.accent, fontSize: 14, fontWeight: '600' }}>+ Lägg till steg</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: t.bg, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }} onPress={onClose}><Text style={{ color: t.text, fontWeight: '700' }}>Avbryt</Text></TouchableOpacity>
              <TouchableOpacity style={{ flex: 2, backgroundColor: t.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }} onPress={save}><Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>Spara övning</Text></TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

export default function LibraryScreen() {
  const theme = useTheme()
  const customExercises = useWorkoutStore((s) => s.customExercises)
  const saveCustomExercises = useWorkoutStore((s) => s.saveCustomExercises)
  const [search, setSearch] = useState('')
  const [equipFilter, setEquipFilter] = useState<string[]>([])
  const [muscleFilter, setMuscleFilter] = useState('Alla')
  const [diffFilter, setDiffFilter] = useState('Alla')
  const [showFilter, setShowFilter] = useState(false)
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const allExercises = [...EXERCISES, ...customExercises]
  const filtered = allExercises.filter((e) => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false
    if (equipFilter.length && !equipFilter.includes(e.equip)) return false
    if (muscleFilter !== 'Alla' && e.muscle !== muscleFilter) return false
    if (diffFilter !== 'Alla' && e.diff !== diffFilter) return false
    return true
  })
  const filterBadge = (muscleFilter !== 'Alla' ? 1 : 0) + (diffFilter !== 'Alla' ? 1 : 0)

  const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.outer },
    header: { backgroundColor: theme.header, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 16 },
    title: { color: theme.headerText, fontSize: 24, fontWeight: '800', marginBottom: 12 },
    searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, paddingHorizontal: 12, height: 40 },
    searchInput: { flex: 1, color: theme.headerText, fontSize: 15, marginLeft: 6 },
    filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, paddingHorizontal: 12, height: 40 },
    filterBtnText: { color: theme.headerText, fontSize: 14, fontWeight: '600' },
    filterBadge: { backgroundColor: theme.accent, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
    filterBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
    list: { flex: 1 },
    fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: theme.accent, borderRadius: 28, paddingHorizontal: 20, paddingVertical: 14, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
    fabText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
    empty: { textAlign: 'center', color: theme.muted, marginTop: 40, fontSize: 14 },
    filterOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    filterSheet: { backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    filterHandle: { width: 40, height: 4, backgroundColor: theme.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    filterTitle: { color: theme.text, fontSize: 18, fontWeight: '800', marginBottom: 16 },
    filterSectionTitle: { color: theme.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, marginTop: 12 },
    filterChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    filterActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
    resetBtn: { flex: 1, backgroundColor: theme.bg, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    applyBtn: { flex: 2, backgroundColor: theme.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  })

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Övningsbibliotek</Text>
        <View style={s.searchRow}>
          <View style={s.searchWrap}>
            <Search size={16} color={theme.muted} />
            <TextInput style={s.searchInput} value={search} onChangeText={setSearch} placeholder="Sök övning..." placeholderTextColor={theme.muted} />
          </View>
          <TouchableOpacity style={s.filterBtn} onPress={() => setShowFilter(true)}>
            <SlidersHorizontal size={16} color={theme.headerText} />
            <Text style={s.filterBtnText}>Filter</Text>
            {filterBadge > 0 && <View style={s.filterBadge}><Text style={s.filterBadgeText}>{filterBadge}</Text></View>}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ backgroundColor: theme.card, maxHeight: 52, borderBottomWidth: 1, borderBottomColor: theme.border }} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: 'row' }}>
        {EQUIP_CHIPS.map((c) => (
          <Chip key={c} label={c} active={equipFilter.includes(c)} onPress={() => setEquipFilter(equipFilter.includes(c) ? equipFilter.filter((x) => x !== c) : [...equipFilter, c])} theme={theme} />
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        style={s.list}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item: e }) => (
          <TouchableOpacity
            onPress={() => setSelectedEx(e)}
            style={[
              { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, marginHorizontal: 16, marginTop: 10, borderRadius: 14, padding: 14, gap: 12 },
              e.isCustom && { borderWidth: 1.5, borderColor: theme.accent },
            ]}
          >
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: EQUIP_BG[e.equip] || '#F5F5F3', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 22 }}>{e.icon || '⚡'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ color: theme.text, fontSize: 15, fontWeight: '700' }}>{e.name}</Text>
                {e.isCustom && <Text style={{ color: theme.accent, fontSize: 10, fontWeight: '800' }}>EIGEN</Text>}
              </View>
              <Text style={{ color: theme.muted, fontSize: 13, marginTop: 2 }}>{e.muscle} · {e.diff}</Text>
            </View>
            <Text style={{ color: theme.muted, fontSize: 12 }}>{e.equip}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={s.empty}>Inga övningar hittades</Text>}
      />

      <TouchableOpacity style={s.fab} onPress={() => setShowCreate(true)}>
        <Text style={s.fabText}>+ Ny övning</Text>
      </TouchableOpacity>

      <Modal visible={showFilter} transparent animationType="slide" onRequestClose={() => setShowFilter(false)}>
        <TouchableOpacity style={s.filterOverlay} activeOpacity={1} onPress={() => setShowFilter(false)}>
          <TouchableOpacity activeOpacity={1}>
            <View style={s.filterSheet}>
              <View style={s.filterHandle} />
              <Text style={s.filterTitle}>Filter</Text>
              <Text style={s.filterSectionTitle}>Muskelgrupp</Text>
              <View style={s.filterChipRow}>
                {MUSCLE_GROUPS.map((m) => <Chip key={m} label={m} active={muscleFilter === m} onPress={() => setMuscleFilter(m)} theme={theme} />)}
              </View>
              <Text style={s.filterSectionTitle}>Svårighet</Text>
              <View style={s.filterChipRow}>
                {DIFFICULTIES.map((d) => <Chip key={d} label={d} active={diffFilter === d} onPress={() => setDiffFilter(d)} theme={theme} />)}
              </View>
              <View style={s.filterActions}>
                <TouchableOpacity style={s.resetBtn} onPress={() => { setMuscleFilter('Alla'); setDiffFilter('Alla'); setShowFilter(false) }}><Text style={{ color: theme.text, fontWeight: '700' }}>Återställ</Text></TouchableOpacity>
                <TouchableOpacity style={s.applyBtn} onPress={() => setShowFilter(false)}><Text style={{ color: '#FFF', fontWeight: '700' }}>Visa resultat</Text></TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {selectedEx && (
        <ExerciseDetailModal
          ex={selectedEx}
          onClose={() => setSelectedEx(null)}
          onDelete={selectedEx.isCustom ? () => { saveCustomExercises(customExercises.filter((e) => e.id !== selectedEx.id)); setSelectedEx(null) } : undefined}
        />
      )}
      {showCreate && <CreateExerciseModal onClose={() => setShowCreate(false)} onSave={(ex) => { saveCustomExercises([...customExercises, ex]); setShowCreate(false) }} />}
    </SafeAreaView>
  )
}
