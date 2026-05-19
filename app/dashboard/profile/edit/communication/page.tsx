'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'

const CONFLICT_STYLE = ['Direct but kind', 'Need time to process', 'Avoid confrontation', 'Firm and assertive']
const PERSONALITY = ['Introvert', 'Mostly introvert', 'Ambivert', 'Mostly extrovert', 'Extrovert']
const ALONE_TIME = ['Vital — I need a lot', 'Important', 'Some', 'Very little']
const APOLOGY_SPEED = ['Immediately', 'After reflection', 'Once cooled down', 'Takes me time']
const COMM_UPSET = ['Talk immediately', 'Need space first', 'Write it down', 'Struggle to open up']
const FINAL_SAY = ['Always me', 'Usually me after consultation', 'Equal partnership', 'Context dependent']
const WIFE_OPINION = ['Extremely important', 'Very important', 'Important', 'I take the lead']
const FRIENDSHIP_ENDED = ['Yes — unavoidably', 'Yes — and I regret it', 'No', 'Not that I can think of']
const LOVE_LANGUAGES = ['Words of Affirmation', 'Acts of Service', 'Receiving Gifts', 'Quality Time', 'Physical Touch']
const QAWWAM = ['He leads and provides — I support', 'Partnership with his natural leadership', 'Truly equal in all decisions', 'Depends on the situation']
const HUSB_OPINION = ['Extremely important', 'Very important', 'Important', 'I make my own decisions']
const RECEIVING_LL = ['Words of Affirmation', 'Acts of Service', 'Receiving Gifts', 'Quality Time', 'Physical Touch']

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

function PillGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(o => <Pill key={o} label={o} selected={value === o} onClick={() => onChange(o)} />)}
      </div>
    </div>
  )
}

function MultiPillGroup({ label, options, value, onChange, max }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void; max: number }) {
  function toggle(opt: string) {
    if (value.includes(opt)) onChange(value.filter(v => v !== opt))
    else if (value.length < max) onChange([...value, opt])
  }
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{label}</label>
      <p className="text-xs text-[#9B9B9B] mb-2">Select up to {max}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button key={o} type="button" onClick={() => toggle(o)}
            disabled={value.length >= max && !value.includes(o)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
              value.includes(o) ? 'bg-[#AF4D98] text-white border-[#AF4D98]' : 'bg-white text-[#1A1A1A] border-[#EDE8E3] hover:border-[#AF4D98] disabled:opacity-40 disabled:cursor-not-allowed'
            }`}>
            {o}
          </button>
        ))}
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

export default function EditCommunicationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [userId, setUserId] = useState('')
  const [gender, setGender] = useState('')

  const [conflictStyle, setConflictStyle] = useState('')
  const [personality, setPersonality] = useState('')
  const [aloneTime, setAloneTime] = useState('')
  const [apologySpeed, setApologySpeed] = useState('')
  const [commWhenUpset, setCommWhenUpset] = useState('')
  const [loveLanguage, setLoveLanguage] = useState<string[]>([])
  const [healthyArgumentView, setHealthyArgumentView] = useState('')

  // Brother
  const [husbandFinalSay, setHusbandFinalSay] = useState('')
  const [wifeOpinionImportance, setWifeOpinionImportance] = useState('')
  const [friendshipEnded, setFriendshipEnded] = useState('')

  // Sister
  const [qawwamView, setQawwamView] = useState('')
  const [husbandOpinionImportance, setHusbandOpinionImportance] = useState('')
  const [receivingLoveLanguage, setReceivingLoveLanguage] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      const { data: prof } = await supabase.from('profiles').select('gender').eq('id', user.id).single()
      if (!prof) { router.push('/auth/login'); return }
      setGender(prof.gender)
      const table = prof.gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
      const { data } = await supabase.from(table).select('*').eq('id', user.id).single()
      if (data) {
        setConflictStyle(data.conflict_style ?? '')
        setPersonality(data.introvert_extrovert ?? '')
        setAloneTime(data.alone_time_importance ?? '')
        setApologySpeed(data.apology_speed ?? '')
        setCommWhenUpset(data.communication_when_upset ?? '')
        setLoveLanguage(data.love_language ?? [])
        setHealthyArgumentView(data.healthy_argument_view ?? '')
        if (prof.gender === 'brother') {
          setHusbandFinalSay(data.husband_final_say ?? '')
          setWifeOpinionImportance(data.wife_opinion_importance ?? '')
          setFriendshipEnded(data.friendship_ended ?? '')
        } else {
          setQawwamView(data.qawwam_view ?? '')
          setHusbandOpinionImportance(data.husband_opinion_importance ?? '')
          setReceivingLoveLanguage(data.receiving_love_language ?? '')
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      const supabase = createClient()
      const table = gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
      const shared = {
        conflict_style: conflictStyle || null,
        introvert_extrovert: personality || null,
        alone_time_importance: aloneTime || null,
        apology_speed: apologySpeed || null,
        communication_when_upset: commWhenUpset || null,
        love_language: loveLanguage,
        healthy_argument_view: healthyArgumentView || null,
      }
      const extra = gender === 'brother'
        ? { husband_final_say: husbandFinalSay || null, wife_opinion_importance: wifeOpinionImportance || null, friendship_ended: friendshipEnded || null }
        : { qawwam_view: qawwamView || null, husband_opinion_importance: husbandOpinionImportance || null, receiving_love_language: receivingLoveLanguage || null }
      const { error: e2 } = await supabase.from(table).update({ ...shared, ...extra }).eq('id', userId)
      if (e2) throw e2
      recalculateProfileCompletion().catch(() => {})
      setToast('success')
      setTimeout(() => router.push('/dashboard/profile'), 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/profile" className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
          </Link>
          <h1 className="text-base font-medium text-[#1A1A1A]">Edit Conflict & Communication</h1>
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <PillGroup label="Conflict style" options={CONFLICT_STYLE} value={conflictStyle} onChange={setConflictStyle} />
          <PillGroup label="Personality" options={PERSONALITY} value={personality} onChange={setPersonality} />
          <PillGroup label="Need for alone time" options={ALONE_TIME} value={aloneTime} onChange={setAloneTime} />
          <PillGroup label="How quickly do you apologise after a conflict?" options={APOLOGY_SPEED} value={apologySpeed} onChange={setApologySpeed} />
          <PillGroup label="Communication when upset" options={COMM_UPSET} value={commWhenUpset} onChange={setCommWhenUpset} />
          {gender === 'brother' ? (
            <>
              <PillGroup label="Husband having final say" options={FINAL_SAY} value={husbandFinalSay} onChange={setHusbandFinalSay} />
              <PillGroup label="Wife's opinion in decisions" options={WIFE_OPINION} value={wifeOpinionImportance} onChange={setWifeOpinionImportance} />
              <PillGroup label="Have you ended a close friendship?" options={FRIENDSHIP_ENDED} value={friendshipEnded} onChange={setFriendshipEnded} />
            </>
          ) : (
            <>
              <PillGroup label="View on qawwam (male guardianship)" options={QAWWAM} value={qawwamView} onChange={setQawwamView} />
              <PillGroup label="Husband's opinion in decisions" options={HUSB_OPINION} value={husbandOpinionImportance} onChange={setHusbandOpinionImportance} />
              <PillGroup label="Primary love language (receiving)" options={RECEIVING_LL} value={receivingLoveLanguage} onChange={setReceivingLoveLanguage} />
            </>
          )}
          <MultiPillGroup label="Love language(s)" options={LOVE_LANGUAGES} value={loveLanguage} onChange={setLoveLanguage} max={3} />
          <TA label="What does a healthy argument look like to you?" value={healthyArgumentView} onChange={setHealthyArgumentView} placeholder="e.g. Staying calm, no raised voices, focusing on solutions..." optional />

          <button type="submit" disabled={saving} className="w-full bg-[#AF4D98] text-white font-medium rounded-full py-3.5 mt-2 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <Link href="/dashboard/profile" className="text-center text-sm text-[#9B9B9B] hover:text-[#1A1A1A]">Cancel</Link>
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
