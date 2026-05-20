'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const textareaCls = 'w-full px-4 py-3 rounded-xl border border-[#EDE8E3] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] placeholder-gray-400 text-sm resize-none'

export default function SisterCharacter() {
  const router = useRouter()
  const [userId,    setUserId]    = useState('')
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [character, setCharacter] = useState('')
  const [goals,     setGoals]     = useState('')
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('sister_profiles')
        .select('character_description, goals')
        .eq('id', user.id)
        .single()
      if (data) {
        if (data.character_description) setCharacter(data.character_description)
        if (data.goals)                 setGoals(data.goals)
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (character.trim().length < 30) {
      setError('Please write at least 30 characters describing yourself.')
      return
    }
    setSaving(true)
    const supabase = createClient()
    const { data: existingRow } = await supabase.from('sister_profiles').select('id').eq('id', userId).maybeSingle()
    if (!existingRow) {
      const { error: insertErr } = await supabase.from('sister_profiles').insert({ id: userId })
      if (insertErr) { setError(insertErr.message); setSaving(false); return }
    }
    const { error: saveErr } = await supabase
      .from('sister_profiles')
      .update({
        character_description: character.trim(),
        goals:                 goals.trim() || null,
      })
      .eq('id', userId)
    if (saveErr) { setError(saveErr.message); setSaving(false); return }
    const { data: fullProfile } = await supabase
      .from('sister_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fullProfile) {
      const { calculateCompletion } = await import('@/lib/profile-completion')
      const { percentage, isComplete } = calculateCompletion(fullProfile as Record<string, unknown>, 'sister')
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('status, profile_complete')
        .eq('id', userId)
        .single()
      await supabase
        .from('profiles')
        .update({
          profile_completion_percentage: percentage,
          profile_complete: currentProfile?.profile_complete || isComplete,
          status: currentProfile?.status === 'active' ? 'active' : (isComplete ? 'active' : 'pending_verification'),
        })
        .eq('id', userId)
    }
    router.push('/onboarding/sister/additional')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-xl font-medium text-[#1A1A1A] mb-1">Character & Goals</h2>
      <p className="text-[#9B9B9B] text-sm mb-8">Let your heart speak — this is what the brother will read first</p>

      <form onSubmit={handleNext} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
            How would your family or close friends describe you?
          </label>
          <textarea required value={character} onChange={e => setCharacter(e.target.value)} rows={5}
            placeholder="e.g. Warm, grounded, someone who gives without expecting anything back. My family says I'm the glue that holds everyone together..."
            className={textareaCls} />
          <p className="text-xs text-[#9B9B9B] mt-1">{character.length} / 500 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
            What do you hope to build together?{' '}
            <span className="text-[#9B9B9B] font-normal">(optional)</span>
          </label>
          <textarea value={goals} onChange={e => setGoals(e.target.value)} rows={4}
            placeholder="e.g. A calm, loving home rooted in taqwa. I want to grow in knowledge alongside my husband and raise children who are proud of who they are..."
            className={textareaCls} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        <button type="submit" disabled={saving}
          className="w-full py-3 bg-[#AF4D98] text-white font-medium rounded-full hover:bg-[#9B3D85] transition-colors text-sm disabled:opacity-50">
          {saving ? 'Saving...' : 'Next →'}
        </button>
      </form>
    </div>
  )
}
