'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'
import Slider from '@/components/ui/Slider'
import {
  PAGE_BG, EditSpinner, EditPageHeader, ErrorAlert,
  PillGroupKV, RadioCard, SaveButton, EditToast,
} from '../EditHelpers'

const LEVELS = [
  { value: 'practicing',            label: 'Practicing',            sub: 'Actively following the Sunnah' },
  { value: 'moderately_practicing', label: 'Moderately Practicing', sub: 'Working on consistency' },
  { value: 'learning',              label: 'Learning',              sub: 'Growing in my deen' },
]

const PRAYER_OPTIONS = [
  { value: 'five_times_daily', label: '5 times daily, alhamdulillah' },
  { value: 'most_prayers',     label: 'Mostly — occasional missed prayers' },
  { value: 'some_prayers',     label: 'Sometimes — working on it' },
  { value: 'not_currently',    label: 'Just getting started' },
]

const KNOWLEDGE_OPTIONS = [
  { value: 'advanced',      label: 'Strong — studied formally or extensively' },
  { value: 'intermediate',  label: 'Moderate — good general knowledge' },
  { value: 'basic',         label: 'Beginner — learning the basics' },
]

const MADHAB_OPTIONS = [
  { value: 'Hanafi',           label: 'Hanafi' },
  { value: "Shafi'i",          label: "Shafi'i" },
  { value: 'Maliki',           label: 'Maliki' },
  { value: 'Hanbali',          label: 'Hanbali' },
  { value: 'Salafi',           label: 'Salafi' },
  { value: 'No specific madhab', label: 'No specific madhab' },
]

const HIJAB_OPTIONS = [
  { value: 'always',           label: 'Yes, always' },
  { value: 'sometimes',        label: 'Sometimes' },
  { value: 'no',               label: 'No' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const MUSIC_OPTIONS = [
  { value: 'yes',           label: 'Yes' },
  { value: 'no',            label: 'No' },
  { value: 'nasheeds_only', label: 'Nasheeds only' },
  { value: 'occasionally',  label: 'Occasionally' },
]

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
  const [hasBeard, setHasBeard] = useState<string>('')
  const [wearsHijab, setWearsHijab] = useState('')
  const [traditionalVsReformist, setTraditionalVsReformist] = useState(50)
  const [doYouListenToMusic, setDoYouListenToMusic] = useState('')

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
        setTraditionalVsReformist(data.traditional_vs_reformist ?? 50)
        setDoYouListenToMusic(data.do_you_listen_to_music ?? '')
        if (profile.gender === 'brother') {
          setHasBeard(data.has_beard === true ? 'yes' : data.has_beard === false ? 'no' : '')
        } else {
          setWearsHijab(data.wears_hijab ?? '')
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
        madhab: madhab || null,
        prayer_frequency: prayerFreq,
        islamic_knowledge_level: knowledgeLevel,
        traditional_vs_reformist: traditionalVsReformist,
        do_you_listen_to_music: doYouListenToMusic || null,
      }
      if (gender === 'brother') {
        const { error: e2 } = await supabase.from('brother_profiles').update({
          ...shared,
          has_beard: hasBeard === 'yes' ? true : hasBeard === 'no' ? false : null,
        }).eq('id', userId)
        if (e2) throw e2
      } else {
        const { error: e2 } = await supabase.from('sister_profiles').update({
          ...shared,
          wears_hijab: wearsHijab || null,
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

  const BEARD_OPTIONS = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]

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

          <PillGroupKV label="Prayer Frequency *" options={PRAYER_OPTIONS} value={prayerFreq} onChange={setPrayerFreq} />
          <PillGroupKV label="Islamic Knowledge Level *" options={KNOWLEDGE_OPTIONS} value={knowledgeLevel} onChange={setKnowledgeLevel} />
          <PillGroupKV label="Madhab" options={MADHAB_OPTIONS} value={madhab} onChange={setMadhab} optional />

          {gender === 'brother' ? (
            <PillGroupKV label="Do you have a beard?" options={BEARD_OPTIONS} value={hasBeard} onChange={setHasBeard} optional />
          ) : (
            <PillGroupKV label="Do you wear hijab?" options={HIJAB_OPTIONS} value={wearsHijab} onChange={setWearsHijab} optional />
          )}

          <Slider
            value={traditionalVsReformist}
            onChange={setTraditionalVsReformist}
            label="Where do you sit on the traditional to reformist spectrum?"
            leftLabel="Traditional"
            rightLabel="Reformist"
          />

          <PillGroupKV label="Do you listen to music?" options={MUSIC_OPTIONS} value={doYouListenToMusic} onChange={setDoYouListenToMusic} optional />

          <SaveButton saving={saving} />
        </form>
      </div>
      <EditToast toast={toast} />
    </div>
  )
}
