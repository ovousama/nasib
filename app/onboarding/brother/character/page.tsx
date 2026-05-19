'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { recalculateCompletion } from '@/app/onboarding/actions'

const textareaCls = 'w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] placeholder-[#9B9B9B] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors resize-none'

export default function BrotherCharacter() {
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
        .from('brother_profiles')
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
    const { error: saveErr } = await supabase
      .from('brother_profiles')
      .upsert({
        id:                    userId,
        character_description: character.trim(),
        goals:                 goals.trim() || null,
      }, { onConflict: 'id' })
    if (saveErr) { setError(saveErr.message); setSaving(false); return }
    await recalculateCompletion(userId, 'brother')
    router.push('/onboarding/brother/additional')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[480px] mx-auto px-5 py-8 pb-28">
        <h2 className="text-2xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-1">Character & Goals</h2>
        <p className="text-[15px] text-[#9B9B9B] mb-8">Let your personality come through — this is what the sister will read first</p>

        <form onSubmit={handleNext} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              How would your imam or close friend describe you?
            </label>
            <textarea required value={character} onChange={e => setCharacter(e.target.value)} rows={5}
              placeholder="e.g. Grounded, patient, someone who leads with kindness. My friends say I'm dependable and I take my responsibilities seriously..."
              className={textareaCls} />
            <p className="text-xs text-[#9B9B9B] mt-1">{character.length} / 500 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              What do you hope to build together?{' '}
              <span className="text-[#9B9B9B] font-normal">(optional)</span>
            </label>
            <textarea value={goals} onChange={e => setGoals(e.target.value)} rows={4}
              placeholder="e.g. A home filled with ilm and laughter. I want to raise children who love Allah and grow old with someone who makes me better..."
              className={textareaCls} />
          </div>

          {error && (
            <div className="border border-[#C13515]/20 bg-[#FDECEA] text-[#C13515] text-sm rounded-[10px] px-4 py-3">{error}</div>
          )}

          <button type="submit" disabled={saving}
            className="w-full py-3.5 bg-[#AF4D98] text-white font-medium rounded-full text-[15px] hover:bg-[#9B3D85] transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Next →'}
          </button>
        </form>
      </div>
    </div>
  )
}
