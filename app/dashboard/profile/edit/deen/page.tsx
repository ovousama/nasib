'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'
import Slider from '@/components/ui/Slider'

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
const MAWLID_VIEW = ['Celebrate', 'Permissible but don\'t celebrate', 'Avoid', 'Impermissible']
const MADHAB_CONSISTENCY = ['Strictly one madhab', 'Mostly one madhab', 'Follow evidence', 'No preference']
const SPOUSE_KNOWLEDGE = ['Very important', 'Important', 'Somewhat important', 'Not a priority']
const MISSED_PRAYER = ['Rarely miss', 'Make up immediately', 'Make up same day', 'Make tawbah and move forward']
const WIFE_NIQAB = ['Prefer', 'Not a condition', 'No preference']
const DEEN_WHEN_BUSY = ['Prayer never slips', 'Mostly consistent', 'Struggle sometimes', 'Working on balance']
const ISLAMIC_HOME = ['Extremely important', 'Very important', 'Important', 'Somewhat important']
const HIJAB_OUTSIDE_OPTS = ['Always', 'Usually', 'Sometimes', 'No', 'Prefer not to say']
const ISLAMIC_CLASSES_OPTS = ['Regularly', 'Occasionally', 'Rarely', 'Not currently but interested', 'Online only']

function Pill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
        selected ? 'bg-[#AF4D98] text-white border-[#AF4D98]' : 'bg-white text-[#1A1A1A] border-[#EDE8E3] hover:border-[#AF4D98]'
      }`}>
      {label}
    </button>
  )
}

function PillGroup({ label, options, value, onChange, optional }: { label: string; options: string[]; value: string; onChange: (v: string) => void; optional?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{label}{optional && <span className="text-[#9B9B9B] font-normal"> (optional)</span>}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(o => <Pill key={o} label={o} selected={value === o} onClick={() => onChange(o)} />)}
      </div>
    </div>
  )
}

function TA({ label, value, onChange, placeholder, optional }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; optional?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">{label}{optional && <span className="text-[#9B9B9B] font-normal"> (optional)</span>}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 resize-none" />
    </div>
  )
}

function YesNo({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{label}</label>
      <div className="flex gap-3">
        {([true, false] as const).map(v => (
          <button key={String(v)} type="button" onClick={() => onChange(v)}
            className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
              value === v ? 'border-[#AF4D98] bg-[#AF4D98] text-white' : 'border-[#EDE8E3] text-[#5C5C5C] hover:border-[#AF4D98]'
            }`}>
            {v ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function EditDeenPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)

  const [userId, setUserId] = useState<string>('')
  const [gender, setGender] = useState<string>('')

  // Core fields
  const [religiosity, setReligiosity] = useState<string>('')
  const [madhab, setMadhab] = useState('')
  const [prayerFreq, setPrayerFreq] = useState('')
  const [knowledgeLevel, setKnowledgeLevel] = useState('')
  const [hasBeard, setHasBeard] = useState<boolean | null>(null)
  const [wearsHijab, setWearsHijab] = useState('')

  // Deepdive deen fields
  const [quranListening, setQuranListening] = useState('')
  const [quranMemorisation, setQuranMemorisation] = useState('')
  const [traditionalVsReformist, setTraditionalVsReformist] = useState(50)
  const [zakahSadaqah, setZakahSadaqah] = useState('')
  const [mawlidView, setMawlidView] = useState('')
  const [madhabConsistency, setMadhabConsistency] = useState('')
  const [spouseIslamicKnowledge, setSpouseIslamicKnowledge] = useState('')
  const [deenGrowth, setDeenGrowth] = useState('')
  // Brother only
  const [missedPrayerApproach, setMissedPrayerApproach] = useState('')
  const [wifeNiqabPreference, setWifeNiqabPreference] = useState('')
  // Sister only
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
          ...shared,
          has_beard: hasBeard,
          missed_prayer_approach: missedPrayerApproach || null,
          wife_niqab_preference: wifeNiqabPreference || null,
        }).eq('id', userId)
        if (e2) throw e2
      } else {
        const { error: e2 } = await supabase.from('sister_profiles').update({
          ...shared,
          wears_hijab: wearsHijab || null,
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

  if (loading) return <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/profile" className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
          </Link>
          <h1 className="text-base font-medium text-[#1A1A1A]">Edit Deen</h1>
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Religiosity Level <span className="text-red-500">*</span></label>
            <div className="flex flex-col gap-2">
              {LEVELS.map(lvl => (
                <button key={lvl.value} type="button" onClick={() => setReligiosity(lvl.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    religiosity === lvl.value ? 'border-[#AF4D98] bg-[#AF4D98] text-white' : 'border-[#EDE8E3] text-[#1A1A1A] hover:border-[#AF4D98]'
                  }`}>
                  <div className="font-medium text-sm">{lvl.label}</div>
                  <div className={`text-xs mt-0.5 ${religiosity === lvl.value ? 'text-white/80' : 'text-[#9B9B9B]'}`}>{lvl.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Prayer Frequency <span className="text-red-500">*</span></label>
            <select value={prayerFreq} onChange={e => setPrayerFreq(e.target.value)}
              className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white">
              <option value="">Select...</option>
              {PRAYER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Islamic Knowledge Level <span className="text-red-500">*</span></label>
            <select value={knowledgeLevel} onChange={e => setKnowledgeLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white">
              <option value="">Select...</option>
              {KNOWLEDGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Madhab <span className="text-[#9B9B9B] font-normal">(optional)</span></label>
            <input type="text" value={madhab} onChange={e => setMadhab(e.target.value)}
              className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
              placeholder="e.g. Hanafi, Shafi'i" />
          </div>

          {gender === 'brother' ? (
            <YesNo label="Do you have a beard?" value={hasBeard} onChange={setHasBeard} />
          ) : (
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Wears Hijab</label>
              <select value={wearsHijab} onChange={e => setWearsHijab(e.target.value)}
                className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white">
                <option value="">Select...</option>
                {HIJAB_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
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

          <button type="submit" disabled={saving} className="w-full bg-[#AF4D98] text-white font-medium rounded-full py-3.5 mt-2 disabled:opacity-60 transition-opacity">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <Link href="/dashboard/profile" className="text-center text-sm text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">Cancel</Link>
        </form>
      </div>

      {toast && (
        <div className={`fixed bottom-20 left-4 right-4 max-w-lg mx-auto rounded-[10px] px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-sm font-medium text-center ${toast === 'success' ? 'bg-[#AF4D98] text-white' : 'bg-red-600 text-white'}`}>
          {toast === 'success' ? 'Changes saved' : 'Something went wrong'}
        </div>
      )}
    </div>
  )
}
