'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const KEY = 'nasib_onboarding_sister'
const textareaCls = 'w-full px-4 py-3 rounded-xl border border-[#EBEBEB] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] placeholder-gray-400 text-sm resize-none'

export default function SisterCharacter() {
  const router = useRouter()
  const [character, setCharacter] = useState('')
  const [goals,     setGoals]     = useState('')
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || '{}')
      if (s.character_description) setCharacter(s.character_description)
      if (s.goals)                 setGoals(s.goals)
    } catch {}
  }, [])

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (character.trim().length < 30) {
      setError('Please write at least 30 characters describing yourself.')
      return
    }

    const s = JSON.parse(localStorage.getItem(KEY) || '{}')
    localStorage.setItem(KEY, JSON.stringify({
      ...s,
      character_description: character.trim(),
      goals:                 goals.trim() || null,
    }))
    router.push('/onboarding/sister/photos')
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold text-[#1A1A1A] mb-1">Character & Goals</h2>
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

        <button type="submit"
          className="w-full py-3 bg-[#AF4D98] text-white font-semibold rounded-xl hover:bg-[#9B3D85] transition-colors text-sm">
          Next →
        </button>
      </form>
    </div>
  )
}
