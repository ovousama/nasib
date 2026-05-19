'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'
import Slider from '@/components/ui/Slider'

const WORK_AFTER_MARRIAGE = ['Yes — full time', 'Yes — part time', 'Initially then reassess', 'Prefer to focus on home', 'Not sure']
const CAREER_PAUSE = ['Yes — fully', 'Yes — temporarily', 'Possibly', 'No — career continues', 'Context dependent']
const FIN_DEPEND_VIEW = ['Fully dependent on husband', 'Partial dependence', 'Prefer independence', 'Fully independent']
const FIN_INDEP = ['Very important to me', 'Important', 'Somewhat important', 'Not important']

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

function TA({ label, value, onChange, placeholder, optional }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; optional?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">{label}{optional && <span className="text-[#9B9B9B] font-normal"> (optional)</span>}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 resize-none" />
    </div>
  )
}

export default function EditCareerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [userId, setUserId] = useState('')

  const [planToWork, setPlanToWork] = useState('')
  const [careerPause, setCareerPause] = useState('')
  const [financialDependenceView, setFinancialDependenceView] = useState('')
  const [financialIndependence, setFinancialIndependence] = useState('')
  const [careerIdentityImportance, setCareerIdentityImportance] = useState(50)
  const [careerFiveYears, setCareerFiveYears] = useState('')
  const [careerAmbitions, setCareerAmbitions] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      const { data } = await supabase.from('sister_profiles').select('plan_to_work_after_marriage,career_pause_for_children,financial_dependence_view,financial_independence_importance,career_identity_importance,career_five_years,career_ambitions').eq('id', user.id).single()
      if (data) {
        setPlanToWork(data.plan_to_work_after_marriage ?? '')
        setCareerPause(data.career_pause_for_children ?? '')
        setFinancialDependenceView(data.financial_dependence_view ?? '')
        setFinancialIndependence(data.financial_independence_importance ?? '')
        setCareerIdentityImportance(data.career_identity_importance ?? 50)
        setCareerFiveYears(data.career_five_years ?? '')
        setCareerAmbitions(data.career_ambitions ?? '')
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
      const { error: e2 } = await supabase.from('sister_profiles').update({
        plan_to_work_after_marriage: planToWork || null,
        career_pause_for_children: careerPause || null,
        financial_dependence_view: financialDependenceView || null,
        financial_independence_importance: financialIndependence || null,
        career_identity_importance: careerIdentityImportance,
        career_five_years: careerFiveYears || null,
        career_ambitions: careerAmbitions || null,
      }).eq('id', userId)
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
          <h1 className="text-base font-medium text-[#1A1A1A]">Edit Career</h1>
        </div>
        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <PillGroup label="Plan to work after marriage?" options={WORK_AFTER_MARRIAGE} value={planToWork} onChange={setPlanToWork} />
          <PillGroup label="Career pause for children" options={CAREER_PAUSE} value={careerPause} onChange={setCareerPause} />
          <PillGroup label="Financial dependence view" options={FIN_DEPEND_VIEW} value={financialDependenceView} onChange={setFinancialDependenceView} />
          <PillGroup label="Financial independence importance" options={FIN_INDEP} value={financialIndependence} onChange={setFinancialIndependence} />
          <Slider
            value={careerIdentityImportance}
            onChange={setCareerIdentityImportance}
            label="How central is your career to your identity?"
            leftLabel="Not central"
            rightLabel="Core identity"
          />
          <TA label="Where do you see your career in 5 years?" value={careerFiveYears} onChange={setCareerFiveYears} placeholder="e.g. I hope to be established in my field and working flexibly..." />
          <TA label="Career ambitions" value={careerAmbitions} onChange={setCareerAmbitions} placeholder="Optional" optional />
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
