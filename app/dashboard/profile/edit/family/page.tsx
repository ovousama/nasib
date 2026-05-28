'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'
import {
  PAGE_BG, EditSpinner, EditPageHeader, ErrorAlert,
  TA, SaveButton, EditToast,
} from '../EditHelpers'

export default function EditFamilyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [userId, setUserId] = useState('')
  const [gender, setGender] = useState('')

  const [parentRelationship, setParentRelationship] = useState('')
  const [familySpouseDisagreement, setFamilySpouseDisagreement] = useState('')

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
      const { data } = await supabase.from(table).select('parent_relationship, family_spouse_disagreement').eq('id', user.id).single()
      if (data) {
        setParentRelationship(data.parent_relationship ?? '')
        setFamilySpouseDisagreement(data.family_spouse_disagreement ?? '')
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
      const { error: e2 } = await supabase.from(table).update({
        parent_relationship:        parentRelationship || null,
        family_spouse_disagreement: familySpouseDisagreement || null,
      }).eq('id', userId)
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
        <EditPageHeader title="Edit Family" />

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <TA label="Describe your relationship with your parents" value={parentRelationship} onChange={setParentRelationship} placeholder="e.g. I have a close relationship with both parents..." optional />
          <TA label="How would you handle a conflict between your family and your spouse?" value={familySpouseDisagreement} onChange={setFamilySpouseDisagreement} placeholder="e.g. I would listen to both sides and try to find a fair resolution..." optional />

          <SaveButton saving={saving} />
        </form>
      </div>
      <EditToast toast={toast} />
    </div>
  )
}
