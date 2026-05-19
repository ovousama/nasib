'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'

const BROTHER_WIFE_FAMILY = ['Very close — like her own', 'Warm but clear boundaries', 'Polite distance', 'Separate lives']
const ELDEST_RESP = ['Yes — I carry more weight', 'Somewhat', 'No', 'I am not the eldest']
const CHILD_CAREGIVING = ['Primarily wife', 'Shared equally', 'Depends on circumstance', 'Primarily me']
const WIFE_FAM_REL = ['Very involved', 'Respectful and warm', 'Polite', 'Limited contact']
const NEAR_PARENTS = ['Yes — very important to me', 'Ideally yes', 'Open to either', 'No preference', 'No']
const FAM_CONFLICT = ['Direct conversation', 'Give space first', 'Involve a mediator', 'Pray and reflect']

const SISTER_FAM_BALANCE = ['Family first always', 'Husband first but family close', 'Balance case by case', 'New family takes priority']
const FAM_FIN_RESP = ['Full responsibility', 'I contribute but not primarily', 'Only in hardship', 'Not my responsibility']
const INLAWS_COMFORT = ['Very comfortable', 'Comfortable with limits', 'Requires work', 'Not comfortable']
const HUSB_FAM_REL = ['Very involved', 'Respectful and warm', 'Polite', 'I prefer limited']
const FAM_TRAD_MOD = ['Very traditional', 'Mostly traditional', 'Mix of both', 'Mostly modern', 'Very modern']

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

export default function EditFamilyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [userId, setUserId] = useState('')
  const [gender, setGender] = useState('')

  // Shared
  const [parentRelationship, setParentRelationship] = useState('')
  const [familyConflictStyle, setFamilyConflictStyle] = useState('')
  const [familySpouseDisagreement, setFamilySpouseDisagreement] = useState('')

  // Brother
  const [wifeFamilyInteraction, setWifeFamilyInteraction] = useState('')
  const [eldestResponsibilities, setEldestResponsibilities] = useState('')
  const [childCaregiving, setChildCaregiving] = useState('')
  const [wifeFamilyRelationship, setWifeFamilyRelationship] = useState('')
  const [livingNearParents, setLivingNearParents] = useState('')

  // Sister
  const [familyBalanceAfterMarriage, setFamilyBalanceAfterMarriage] = useState('')
  const [familyFinancialResponsibility, setFamilyFinancialResponsibility] = useState('')
  const [inlawsComfort, setInlawsComfort] = useState('')
  const [husbandFamilyRelationship, setHusbandFamilyRelationship] = useState('')
  const [familyTraditionalVsModern, setFamilyTraditionalVsModern] = useState('')

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
        setParentRelationship(data.parent_relationship ?? '')
        setFamilyConflictStyle(data.family_conflict_style ?? '')
        setFamilySpouseDisagreement(data.family_spouse_disagreement ?? '')
        if (prof.gender === 'brother') {
          setWifeFamilyInteraction(data.wife_family_interaction ?? '')
          setEldestResponsibilities(data.eldest_responsibilities ?? '')
          setChildCaregiving(data.child_caregiving ?? '')
          setWifeFamilyRelationship(data.wife_family_relationship ?? '')
          setLivingNearParents(data.living_near_parents ?? '')
        } else {
          setFamilyBalanceAfterMarriage(data.family_balance_after_marriage ?? '')
          setFamilyFinancialResponsibility(data.family_financial_responsibility ?? '')
          setInlawsComfort(data.inlaws_comfort ?? '')
          setHusbandFamilyRelationship(data.husband_family_relationship ?? '')
          setFamilyTraditionalVsModern(data.family_traditional_vs_modern ?? '')
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
      const shared = { parent_relationship: parentRelationship || null, family_conflict_style: familyConflictStyle || null, family_spouse_disagreement: familySpouseDisagreement || null }
      const extra = gender === 'brother'
        ? { wife_family_interaction: wifeFamilyInteraction || null, eldest_responsibilities: eldestResponsibilities || null, child_caregiving: childCaregiving || null, wife_family_relationship: wifeFamilyRelationship || null, living_near_parents: livingNearParents || null }
        : { family_balance_after_marriage: familyBalanceAfterMarriage || null, family_financial_responsibility: familyFinancialResponsibility || null, inlaws_comfort: inlawsComfort || null, husband_family_relationship: husbandFamilyRelationship || null, family_traditional_vs_modern: familyTraditionalVsModern || null }
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
          <h1 className="text-base font-medium text-[#1A1A1A]">Edit Family Dynamics</h1>
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          {gender === 'brother' ? (
            <>
              <PillGroup label="How will your wife interact with your family?" options={BROTHER_WIFE_FAMILY} value={wifeFamilyInteraction} onChange={setWifeFamilyInteraction} />
              <PillGroup label="Do you carry responsibilities as the eldest?" options={ELDEST_RESP} value={eldestResponsibilities} onChange={setEldestResponsibilities} />
              <PillGroup label="Child caregiving responsibility" options={CHILD_CAREGIVING} value={childCaregiving} onChange={setChildCaregiving} />
              <PillGroup label="How will you manage your wife's relationship with her family?" options={WIFE_FAM_REL} value={wifeFamilyRelationship} onChange={setWifeFamilyRelationship} />
              <PillGroup label="Living near your parents" options={NEAR_PARENTS} value={livingNearParents} onChange={setLivingNearParents} />
            </>
          ) : (
            <>
              <PillGroup label="How will you balance your family of origin after marriage?" options={SISTER_FAM_BALANCE} value={familyBalanceAfterMarriage} onChange={setFamilyBalanceAfterMarriage} />
              <PillGroup label="Financial responsibility toward your family of origin" options={FAM_FIN_RESP} value={familyFinancialResponsibility} onChange={setFamilyFinancialResponsibility} />
              <PillGroup label="Comfort living with or near in-laws" options={INLAWS_COMFORT} value={inlawsComfort} onChange={setInlawsComfort} />
              <PillGroup label="How do you see your relationship with your husband's family?" options={HUSB_FAM_REL} value={husbandFamilyRelationship} onChange={setHusbandFamilyRelationship} />
              <PillGroup label="Approach to family life" options={FAM_TRAD_MOD} value={familyTraditionalVsModern} onChange={setFamilyTraditionalVsModern} />
            </>
          )}
          <PillGroup label="Family conflict style" options={FAM_CONFLICT} value={familyConflictStyle} onChange={setFamilyConflictStyle} />
          <TA label="Describe your relationship with your parents" value={parentRelationship} onChange={setParentRelationship} placeholder="How close are you? What is your role?" />
          <TA label="How do you handle disagreements between family and spouse?" value={familySpouseDisagreement} onChange={setFamilySpouseDisagreement} placeholder="e.g. My spouse always comes first..." optional />

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
