'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const KEY = 'nasib_onboarding_brother'

const inputCls = 'w-full px-4 py-3 rounded-xl border border-[#EBEBEB] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] placeholder-gray-400 text-sm'

export default function BrotherBasicInfo() {
  const router = useRouter()
  const [fullName,  setFullName]  = useState('')
  const [age,       setAge]       = useState('')
  const [location,  setLocation]  = useState('')
  const [ethnicity, setEthnicity] = useState('')
  const [languages, setLanguages] = useState('')
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || '{}')
      if (s.full_name)  setFullName(s.full_name)
      if (s.age)        setAge(String(s.age))
      if (s.location)   setLocation(s.location)
      if (s.ethnicity)  setEthnicity(s.ethnicity)
      if (s.languages)  setLanguages(Array.isArray(s.languages) ? s.languages.join(', ') : s.languages)
    } catch {}
  }, [])

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const ageNum = parseInt(age)
    if (isNaN(ageNum) || ageNum < 18) {
      setError('You must be at least 18 years old.')
      return
    }
    const s = JSON.parse(localStorage.getItem(KEY) || '{}')
    localStorage.setItem(KEY, JSON.stringify({
      ...s,
      full_name:  fullName.trim(),
      age:        ageNum,
      location:   location.trim(),
      ethnicity:  ethnicity.trim(),
      languages:  languages.split(',').map(l => l.trim()).filter(Boolean),
    }))
    router.push('/onboarding/brother/religiosity')
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold text-[#1A1A1A] mb-1">Basic Information</h2>
      <p className="text-[#9B9B9B] text-sm mb-8">Tell us a little about yourself</p>

      <form onSubmit={handleNext} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Full Name</label>
          <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
            placeholder="e.g. Abdullah Khan" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Age</label>
          <input type="number" required min={18} max={99} value={age} onChange={e => setAge(e.target.value)}
            placeholder="e.g. 28" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Location</label>
          <input type="text" required value={location} onChange={e => setLocation(e.target.value)}
            placeholder="e.g. London, UK" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
            Ethnicity <span className="text-[#9B9B9B] font-normal">(optional)</span>
          </label>
          <input type="text" value={ethnicity} onChange={e => setEthnicity(e.target.value)}
            placeholder="e.g. British Pakistani" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Languages Spoken</label>
          <input type="text" value={languages} onChange={e => setLanguages(e.target.value)}
            placeholder="e.g. English, Urdu, Arabic" className={inputCls} />
          <p className="text-xs text-[#9B9B9B] mt-1">Separate with commas</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        <button type="submit"
          className="w-full py-3 bg-[#AF4D98] text-white font-semibold rounded-xl hover:bg-[#9B3D85] transition-colors text-sm mt-2">
          Next →
        </button>
      </form>
    </div>
  )
}
