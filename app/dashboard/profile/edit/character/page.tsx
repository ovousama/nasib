'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'
import {
  PAGE_BG, EditSpinner, EditPageHeader, ErrorAlert,
  SaveButton, EditToast,
} from '../EditHelpers'

export default function EditCharacterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)

  const [userId, setUserId] = useState<string>('')
  const [gender, setGender] = useState<string>('')

  const [characterDescription, setCharacterDescription] = useState('')
  const [goals, setGoals] = useState('')

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
      const { data } = await supabase.from(table).select('character_description, goals').eq('id', user.id).single()
      if (data) {
        setCharacterDescription(data.character_description ?? '')
        setGoals(data.goals ?? '')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (characterDescription.trim().length < 30) {
      setError('Character description must be at least 30 characters.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const table = gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
      const { error: updateError } = await supabase
        .from(table)
        .update({ character_description: characterDescription.trim(), goals: goals.trim() || null })
        .eq('id', userId)
      if (updateError) throw updateError
      recalculateProfileCompletion().catch(() => {})
      setToast('success')
      setTimeout(() => router.push('/dashboard/profile'), 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <EditSpinner />

  const taStyle = {
    width: '100%', padding: '12px 14px',
    border: '1px solid #EDE8E3', borderRadius: '12px',
    fontSize: '14px', color: '#1A1A1A', background: 'white',
    outline: 'none', resize: 'vertical' as const, minHeight: '100px',
    fontFamily: 'inherit', lineHeight: '1.6', boxSizing: 'border-box' as const,
  }

  return (
    <div className="min-h-screen pt-[72px] lg:pt-[76px]" style={{ background: PAGE_BG }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 20px 80px' }}>
        <EditPageHeader title="Edit Character" />

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1A1A1A', marginBottom: '10px' }}>
              Describe yourself — your character, values, and what makes you who you are{' '}
              <span style={{ color: '#AF4D98' }}>*</span>
            </label>
            <textarea
              value={characterDescription}
              onChange={e => setCharacterDescription(e.target.value)}
              rows={5}
              maxLength={500}
              style={taStyle}
              placeholder="Describe your character, values, and what makes you who you are..."
              onFocus={e => { e.currentTarget.style.border = '1.5px solid #AF4D98' }}
              onBlur={e => { e.currentTarget.style.border = '1px solid #EDE8E3' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <p style={{ fontSize: '12px', color: '#9B9B9B', margin: 0 }}>Minimum 30 characters</p>
              <p style={{ fontSize: '12px', color: '#9B9B9B', margin: 0 }}>{characterDescription.length} / 500</p>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1A1A1A', marginBottom: '10px' }}>
              What are your goals in life and marriage?
              <span style={{ fontSize: '12px', color: '#9B9B9B', fontWeight: 400, marginLeft: '6px' }}>(optional)</span>
            </label>
            <textarea
              value={goals}
              onChange={e => setGoals(e.target.value)}
              rows={4}
              style={taStyle}
              placeholder="Your goals in life and marriage"
              onFocus={e => { e.currentTarget.style.border = '1.5px solid #AF4D98' }}
              onBlur={e => { e.currentTarget.style.border = '1px solid #EDE8E3' }}
            />
          </div>

          <SaveButton saving={saving} />
        </form>
      </div>
      <EditToast toast={toast} />
    </div>
  )
}
