'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'
import Slider from '@/components/ui/Slider'
import {
  PAGE_BG, EditSpinner, EditPageHeader, ErrorAlert,
  PillGroup, YesNo, TA, SimpleDropdown, RadioCard, SaveButton, EditToast,
} from '../EditHelpers'

const LEVELS = [
  { value: 'practicing', label: 'Practicing', sub: 'Actively following the Sunnah' },
  { value: 'moderately_practicing', label: 'Moderately Practicing', sub: 'Working on consistency' },
  { value: 'learning', label: 'Learning', sub: 'Growing in my deen' },
]

const PRAYER_OPTIONS = ['5 times daily', 'mostly', 'sometimes', 'working on it']
const KNOWLEDGE_OPTIONS = ['strong', 'moderate', 'beginner']
const HIJAB_OPTIONS = ['Always', 'Usually', 'Sometimes', 'No', 'Prefer not to say']
const QURAN_LISTENING = ['Daily', 'A few times a week', 'Occasionally', 'Rarely']
const QURAN_MEMORISATION = ['Hafiz/Hafiza', 'Several juz', 'A few surahs', 'Working on it', 'None yet']
const ZAKAH_SADAQAH = ['Very regularly', 'Regularly', 'Occasionally', 'Working on it']
const MAWLID_VIEW = ["Celebrate", "Permissible but don't celebrate", 'Avoid', 'Impermissible']
const MADHAB_CONSISTENCY = ['Strictly one madhab', 'Mostly one madhab', 'Follow evidence', 'No preference']
const SPOUSE_KNOWLEDGE = ['Very important', 'Important', 'Somewhat important', 'Not a priority']
const MISSED_PRAYER = ['Rarely miss', 'Make up immediately', 'Make up same day', 'Make tawbah and move forward']
const WIFE_NIQAB = ['Prefer', 'Not a condition', 'No preference']
const DEEN_WHEN_BUSY = ['Prayer never slips', 'Mostly consistent', 'Struggle sometimes', 'Working on balance']
const ISLAMIC_HOME = ['Extremely important', 'Very important', 'Important', 'Somewhat important']
const HIJAB_OUTSIDE_OPTS = ['Always', 'Usually', 'Sometimes', 'No', 'Prefer not to say']
const ISLAMIC_CLASSES_OPTS = ['Regularly', 'Occasionally', 'Rarely', 'Not currently but interested', 'Online only']

export default function EditDeenPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)

  const [userId, setUserId] = useState<string>('')
  const [gender, setGender] = useState<string>('')

  const [religiosity, setReligiosity] = useState<string>('')
  const [madhab, setMadhab] = useState('')
  const [prayerFreq, setPrayerFreq] = useState('')
  const [knowledgeLevel, setKnowledgeLevel] = useState('')
  const [hasBeard, setHasBeard] = useState<boolean | null>(null)
  const [wearsHijab, setWearsHijab] = useState('')
  const [quranListening, setQuranListening] = useState('')
  const [quranMemorisation, setQuranMemorisation] = useState('')
  const [traditionalVsReformist, setTraditionalVsReformist] = useState(50)
  const [zakahSadaqah, setZakahSadaqah] = useState('')
  const [mawlidView, setMawlidView] = useState('')
  const [madhabConsistency, setMadhabConsistency] = useState('')
  const [spouseIslamicKnowledge, setSpouseIslamicKnowledge] = useState('')
  const [deenGrowth, setDeenGrowth] = useState('')
  const [missedPrayerApproach, setMissedPrayerApproach] = useState('')
  const [wifeNiqabPreference, setWifeNiqabPreference] = useState('')
  const [deenWhenBusy, setDeenWhenBusy] = useState('')
  const [islamicHomeImportance, setIslamicHomeImportance] = useState('')
  const [hijabOutsideHome, setHijabOutsideHome] = useState('')
  const [islamicClassesAttendance, setIslamicClassesAttendance] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      const { data: profile } = await supabase.from('profiles').select('gender').eq('id', user.id).single()
      if (!profile) { router.push('/auth/login'); return }
      setGender(profile.gender)
      const table = profile.gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await supabase.from(table).select('*').eq('id', user.id).single() as { data: any }
      if (data) {
        setReligiosity(data.religiosity_level ?? '')
        setMadhab(data.madhab ?? '')
        setPrayerFreq(data.prayer_frequency ?? '')
        setKnowledgeLevel(data.islamic_knowledge_level ?? '')
        setQuranListening(data.quran_listening ?? '')
        setQuranMemorisation(data.quran_memorisation ?? '')
        setTraditionalVsReformist(data.traditional_vs_reformist ?? 50)
        setZakahSadaqah(data.zakah_sadaqah ?? '')
        setMawlidView(data.mawlid_view ?? '')
        setMadhabConsistency(data.madhab_consistency ?? '')
        setSpouseIslamicKnowledge(data.spouse_islamic_knowledge ?? '')
        setDeenGrowth(data.deen_growth ?? '')
        if (profile.gender === 'brother') {
          setHasBeard(data.has_beard ?? null)
          setMissedPrayerApproach(data.missed_prayer_approach ?? '')
          setWifeNiqabPreference(data.wife_niqab_preference ?? '')
        } else {
          setWearsHijab(data.wears_hijab ?? '')
          setDeenWhenBusy(data.deen_when_busy ?? '')
          setIslamicHomeImportance(data.islamic_home_importance ?? '')
          setHijabOutsideHome(data.hijab_outside_home ?? '')
          setIslamicClassesAttendance(data.islamic_classes_attendance ?? '')
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!religiosity) { setError('Religiosity level is required.'); return }
    if (!prayerFreq) { setError('Prayer frequency is required.'); return }
    if (!knowledgeLevel) { setError('Islamic knowledge level is required.'); return }
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const shared = {
        religiosity_level: religiosity,
        madhab: madhab.trim() || null,
        prayer_frequency: prayerFreq,
        islamic_knowledge_level: knowledgeLevel,
        quran_listening: quranListening || null,
        quran_memorisation: quranMemorisation || null,
        traditional_vs_reformist: traditionalVsReformist,
        zakah_sadaqah: zakahSadaqah || null,
        mawlid_view: mawlidView || null,
        madhab_consistency: madhabConsistency || null,
        spouse_islamic_knowledge: spouseIslamicKnowledge || null,
        deen_growth: deenGrowth || null,
      }
      if (gender === 'brother') {
        const { error: e2 } = await supabase.from('brother_profiles').update({
          ...shared, has_beard: hasBeard,
          missed_prayer_approach: missedPrayerApproach || null,
          wife_niqab_preference: wifeNiqabPreference || null,
        }).eq('id', userId)
        if (e2) throw e2
      } else {
        const { error: e2 } = await supabase.from('sister_profiles').update({
          ...shared, wears_hijab: wearsHijab || null,
          deen_when_busy: deenWhenBusy || null,
          islamic_home_importance: islamicHomeImportance || null,
          hijab_outside_home: hijabOutsideHome || null,
          islamic_classes_attendance: islamicClassesAttendance || null,
        }).eq('id', userId)
        if (e2) throw e2
      }
      recalculateProfileCompletion().catch(() => {})
      setToast('success')
      setTimeout(() => router.push('/dashboard/profile'), 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <EditSpinner />

  return (
    <div className="min-h-screen pt-[72px] lg:pt-[76px]" style={{ background: PAGE_BG }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 20px 80px' }}>
        <EditPageHeader title="Edit Deen" />

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1A1A1A', marginBottom: '10px' }}>
              Religiosity Level <span style={{ color: '#AF4D98' }}>*</span>
            </label>
            <div>
              {LEVELS.map(lvl => (
                <RadioCard
                  key={lvl.value}
                  selected={religiosity === lvl.value}
                  label={lvl.label}
                  sublabel={lvl.sub}
                  onClick={() => setReligiosity(lvl.value)}
                />
              ))}
            </div>
          </div>

          <SimpleDropdown
            label="Prayer Frequency"
            value={prayerFreq}
            onChange={setPrayerFreq}
            options={PRAYER_OPTIONS}
          />

          <SimpleDropdown
            label="Islamic Knowledge Level"
            value={knowledgeLevel}
            onChange={setKnowledgeLevel}
            options={KNOWLEDGE_OPTIONS}
          />

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1A1A1A', marginBottom: '10px' }}>
              Madhab <span style={{ fontSize: '12px', color: '#9B9B9B', fontWeight: 400, marginLeft: '6px' }}>(optional)</span>
            </label>
            <input
              type="text"
              value={madhab}
              onChange={e => setMadhab(e.target.value)}
              placeholder="e.g. Hanafi, Shafi'i"
              style={{
                width: '100%', padding: '12px 14px',
                border: '1px solid #EDE8E3', borderRadius: '12px',
                fontSize: '14px', color: '#1A1A1A', background: 'white',
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.border = '1.5px solid #AF4D98' }}
              onBlur={e => { e.currentTarget.style.border = '1px solid #EDE8E3' }}
            />
          </div>

          {gender === 'brother' ? (
            <YesNo label="Do you have a beard?" value={hasBeard} onChange={setHasBeard} />
          ) : (
            <SimpleDropdown label="Wears Hijab" value={wearsHijab} onChange={setWearsHijab} options={HIJAB_OPTIONS} />
          )}

          <PillGroup label="How often do you listen to Quran?" options={QURAN_LISTENING} value={quranListening} onChange={setQuranListening} optional />
          <PillGroup label="How much of the Quran have you memorised?" options={QURAN_MEMORISATION} value={quranMemorisation} onChange={setQuranMemorisation} optional />

          <Slider
            value={traditionalVsReformist}
            onChange={setTraditionalVsReformist}
            label="Where do you sit on the traditional to reformist spectrum?"
            leftLabel="Traditional"
            rightLabel="Reformist"
          />

          <PillGroup label="Do you give zakah and sadaqah regularly?" options={ZAKAH_SADAQAH} value={zakahSadaqah} onChange={setZakahSadaqah} optional />
          <PillGroup label="How important is following a consistent madhab to you?" options={MADHAB_CONSISTENCY} value={madhabConsistency} onChange={setMadhabConsistency} optional />
          <PillGroup label="What is your view on celebrating Mawlid an-Nabi?" options={MAWLID_VIEW} value={mawlidView} onChange={setMawlidView} optional />
          <PillGroup label="How important is your spouse's Islamic knowledge to you?" options={SPOUSE_KNOWLEDGE} value={spouseIslamicKnowledge} onChange={setSpouseIslamicKnowledge} optional />

          {gender === 'brother' && (
            <>
              <PillGroup label="How do you approach a missed prayer?" options={MISSED_PRAYER} value={missedPrayerApproach} onChange={setMissedPrayerApproach} optional />
              <PillGroup label="Do you have a preference for whether your wife wears niqab?" options={WIFE_NIQAB} value={wifeNiqabPreference} onChange={setWifeNiqabPreference} optional />
            </>
          )}

          {gender === 'sister' && (
            <>
              <PillGroup label="How do you maintain your deen when life gets busy?" options={DEEN_WHEN_BUSY} value={deenWhenBusy} onChange={setDeenWhenBusy} optional />
              <PillGroup label="How important is having an Islamic home environment?" options={ISLAMIC_HOME} value={islamicHomeImportance} onChange={setIslamicHomeImportance} optional />
              <PillGroup label="Do you wear hijab outside the home?" options={HIJAB_OUTSIDE_OPTS} value={hijabOutsideHome} onChange={setHijabOutsideHome} optional />
              <PillGroup label="How often do you attend Islamic classes or talks?" options={ISLAMIC_CLASSES_OPTS} value={islamicClassesAttendance} onChange={setIslamicClassesAttendance} optional />
            </>
          )}

          <TA label="How do you actively grow in your deen?" value={deenGrowth} onChange={setDeenGrowth} placeholder="e.g. Currently studying tafsir, attending halaqas, working on consistency..." optional />

          <SaveButton saving={saving} />
        </form>
      </div>
      <EditToast toast={toast} />
    </div>
  )
}
