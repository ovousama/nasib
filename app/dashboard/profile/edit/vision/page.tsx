'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'

const PHYSICAL_INTIMACY = ['Very important', 'Important', 'Moderately important', 'Not a priority']
const SPOUSE_FRIENDSHIPS = ['Fully separate social lives', 'Mostly separate, some overlap', 'Mix of both', 'Mostly shared', 'Fully shared']
const POLYGAMY_OWN = ['Open to it', 'Not for me', 'Only under very specific circumstances', 'Absolutely not']

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

function TA({ label, value, onChange, placeholder, optional, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; optional?: boolean; rows?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">{label}{optional && <span className="text-[#9B9B9B] font-normal"> (optional)</span>}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 resize-none" />
    </div>
  )
}

export default function EditVisionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [userId, setUserId] = useState('')
  const [gender, setGender] = useState('')

  const [physicalIntimacy, setPhysicalIntimacy] = useState('')
  const [spouseFriendships, setSpouseFriendships] = useState('')
  const [marriageVision, setMarriageVision] = useState('')
  const [firstYearVision, setFirstYearVision] = useState('')
  const [romanceView, setRomanceView] = useState('')
  const [marriageFear, setMarriageFear] = useState('')
  const [uniqueContribution, setUniqueContribution] = useState('')
  // Brother only
  const [polygamyOwnMarriage, setPolygamyOwnMarriage] = useState('')
  // Sister only
  const [idealHusbandDescription, setIdealHusbandDescription] = useState('')

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
      const { data } = await supabase.from(table).select('physical_intimacy_importance,spouse_friendships_view,marriage_vision_10_years,first_year_vision,romance_view,marriage_fear,unique_contribution,polygamy_own_marriage,ideal_husband_description').eq('id', user.id).single()
      if (data) {
        setPhysicalIntimacy(data.physical_intimacy_importance ?? '')
        setSpouseFriendships(data.spouse_friendships_view ?? '')
        setMarriageVision(data.marriage_vision_10_years ?? '')
        setFirstYearVision(data.first_year_vision ?? '')
        setRomanceView(data.romance_view ?? '')
        setMarriageFear(data.marriage_fear ?? '')
        setUniqueContribution(data.unique_contribution ?? '')
        setPolygamyOwnMarriage(data.polygamy_own_marriage ?? '')
        setIdealHusbandDescription(data.ideal_husband_description ?? '')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!marriageVision.trim()) { setError('Please share your 10-year marriage vision.'); return }
    if (!firstYearVision.trim()) { setError('Please share your first year vision.'); return }
    setSaving(true); setError(null)
    try {
      const supabase = createClient()
      const table = gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
      const shared = {
        physical_intimacy_importance: physicalIntimacy || null,
        spouse_friendships_view: spouseFriendships || null,
        marriage_vision_10_years: marriageVision.trim(),
        first_year_vision: firstYearVision.trim(),
        romance_view: romanceView || null,
        marriage_fear: marriageFear || null,
        unique_contribution: uniqueContribution || null,
      }
      const extra = gender === 'brother'
        ? { polygamy_own_marriage: polygamyOwnMarriage || null }
        : { ideal_husband_description: idealHusbandDescription || null }
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
          <h1 className="text-base font-medium text-[#1A1A1A]">Edit Marriage Vision</h1>
        </div>
        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <PillGroup label="How important is physical intimacy to you in a marriage?" options={PHYSICAL_INTIMACY} value={physicalIntimacy} onChange={setPhysicalIntimacy} />
          <PillGroup label="How do you feel about your spouse maintaining close friendships?" options={SPOUSE_FRIENDSHIPS} value={spouseFriendships} onChange={setSpouseFriendships} />
          {gender === 'brother' && (
            <PillGroup label="What is your view on polygamy in your own marriage?" options={POLYGAMY_OWN} value={polygamyOwnMarriage} onChange={setPolygamyOwnMarriage} />
          )}
          <TA label="What does your marriage look like in 10 years?" rows={4} value={marriageVision} onChange={setMarriageVision} placeholder="What does your marriage look like in 10 years? Where do you live, how do you spend your time, what have you built together?" />
          <TA label="What does your first year of marriage look like?" rows={3} value={firstYearVision} onChange={setFirstYearVision} placeholder="What are your hopes and expectations for the first year?" />
          <TA label="What does romance look like to you in a marriage?" value={romanceView} onChange={setRomanceView} placeholder="How important is it? How do you express it?" optional />
          <TA label="What is your biggest fear about marriage?" value={marriageFear} onChange={setMarriageFear} placeholder="Be honest — this is read with compassion" optional />
          <TA label="What unique thing do you bring to a marriage?" value={uniqueContribution} onChange={setUniqueContribution} placeholder="Your qualities, values, effort..." optional />
          {gender === 'sister' && (
            <TA label="Describe your ideal husband" value={idealHusbandDescription} onChange={setIdealHusbandDescription} placeholder="In your own words — character, deen, how he treats you..." optional />
          )}
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
