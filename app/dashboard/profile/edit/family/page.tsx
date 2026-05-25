'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'
import {
  PAGE_BG, EditSpinner, EditPageHeader, ErrorAlert,
  PillGroup, TA, SaveButton, EditToast,
} from '../EditHelpers'

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

export default function EditFamilyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [userId, setUserId] = useState('')
  const [gender, setGender] = useState('')

  const [parentRelationship, setParentRelationship] = useState('')
  const [familyConflictStyle, setFamilyConflictStyle] = useState('')
  const [familySpouseDisagreement, setFamilySpouseDisagreement] = useState('')
  const [wifeFamilyInteraction, setWifeFamilyInteraction] = useState('')
  const [eldestResponsibilities, setEldestResponsibilities] = useState('')
  const [childCaregiving, setChildCaregiving] = useState('')
  const [wifeFamilyRelationship, setWifeFamilyRelationship] = useState('')
  const [livingNearParents, setLivingNearParents] = useState('')
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

  if (loading) return <EditSpinner />

  return (
    <div className="min-h-screen pt-[72px] lg:pt-[76px]" style={{ background: PAGE_BG }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 20px 80px' }}>
        <EditPageHeader title="Edit Family Dynamics" />

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {gender === 'brother' ? (
            <>
              <PillGroup label="How involved do you expect your wife to be with your family?" options={BROTHER_WIFE_FAMILY} value={wifeFamilyInteraction} onChange={setWifeFamilyInteraction} />
              <PillGroup label="As the eldest or only son, do you carry significant family responsibilities?" options={ELDEST_RESP} value={eldestResponsibilities} onChange={setEldestResponsibilities} />
              <PillGroup label="Who do you see as the primary caregiver for young children?" options={CHILD_CAREGIVING} value={childCaregiving} onChange={setChildCaregiving} />
              <PillGroup label="How do you view your wife maintaining a close relationship with her own family?" options={WIFE_FAM_REL} value={wifeFamilyRelationship} onChange={setWifeFamilyRelationship} />
              <PillGroup label="Do you plan to live near your parents?" options={NEAR_PARENTS} value={livingNearParents} onChange={setLivingNearParents} />
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
          <PillGroup label="How does conflict typically play out in your family?" options={FAM_CONFLICT} value={familyConflictStyle} onChange={setFamilyConflictStyle} />
          <TA label="Describe your relationship with your parents" value={parentRelationship} onChange={setParentRelationship} placeholder="How close are you? What is your role?" />
          <TA label="How would you handle a conflict between your family and your spouse?" value={familySpouseDisagreement} onChange={setFamilySpouseDisagreement} placeholder="e.g. My spouse always comes first..." optional />

          <SaveButton saving={saving} />
        </form>
      </div>
      <EditToast toast={toast} />
    </div>
  )
}
