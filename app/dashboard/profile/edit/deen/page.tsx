'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const LEVELS = [
  { value: 'practicing', label: 'Practicing', sub: 'Actively following the Sunnah' },
  { value: 'moderately_practicing', label: 'Moderately Practicing', sub: 'Working on consistency' },
  { value: 'learning', label: 'Learning', sub: 'Growing in my deen' },
]

const PRAYER_OPTIONS = ['5 times daily', 'mostly', 'sometimes', 'working on it']
const KNOWLEDGE_OPTIONS = ['strong', 'moderate', 'beginner']
const HIJAB_OPTIONS = ['Always', 'Usually', 'Sometimes', 'No', 'Prefer not to say']

function YesNo({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{label}</label>
      <div className="flex gap-3">
        {([true, false] as const).map(v => (
          <button key={String(v)} type="button" onClick={() => onChange(v)}
            className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
              value === v ? 'border-[#AF4D98] bg-[#AF4D98] text-white' : 'border-[#EDE8E3] text-[#5C5C5C] hover:border-[#AF4D98]'
            }`}>
            {v ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function EditDeenPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)

  const [userId, setUserId] = useState<string>('')
  const [gender, setGender] = useState<string>('')

  const [religiosity, setReligiosity] = useState<string>('')
  const [madhab, setMadhab] = useState('')
  const [prayerFreq, setPrayerFreq] = useState('')
  const [knowledgeLevel, setKnowledgeLevel] = useState('')
  const [hasBeard, setHasBeard] = useState<boolean | null>(null)
  const [wearsHijab, setWearsHijab] = useState('')

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
      if (profile.gender === 'brother') {
        const { data } = await supabase.from('brother_profiles').select('religiosity_level, madhab, prayer_frequency, islamic_knowledge_level, has_beard').eq('id', user.id).single()
        if (data) {
          setReligiosity(data.religiosity_level ?? '')
          setMadhab(data.madhab ?? '')
          setPrayerFreq(data.prayer_frequency ?? '')
          setKnowledgeLevel(data.islamic_knowledge_level ?? '')
          setHasBeard(data.has_beard ?? null)
        }
      } else {
        const { data } = await supabase.from('sister_profiles').select('religiosity_level, madhab, prayer_frequency, islamic_knowledge_level, wears_hijab').eq('id', user.id).single()
        if (data) {
          setReligiosity(data.religiosity_level ?? '')
          setMadhab(data.madhab ?? '')
          setPrayerFreq(data.prayer_frequency ?? '')
          setKnowledgeLevel(data.islamic_knowledge_level ?? '')
          setWearsHijab(data.wears_hijab ?? '')
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!religiosity) { setError('Religiosity level is required.'); return }
    if (!prayerFreq) { setError('Prayer frequency is required.'); return }
    if (!knowledgeLevel) { setError('Islamic knowledge level is required.'); return }
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      if (gender === 'brother') {
        const { error: updateError } = await supabase
          .from('brother_profiles')
          .update({ religiosity_level: religiosity, madhab: madhab.trim() || null, prayer_frequency: prayerFreq, islamic_knowledge_level: knowledgeLevel, has_beard: hasBeard })
          .eq('id', userId)
        if (updateError) throw updateError
      } else {
        const { error: updateError } = await supabase
          .from('sister_profiles')
          .update({ religiosity_level: religiosity, madhab: madhab.trim() || null, prayer_frequency: prayerFreq, islamic_knowledge_level: knowledgeLevel, wears_hijab: wearsHijab || null })
          .eq('id', userId)
        if (updateError) throw updateError
      }
      setToast('success')
      setTimeout(() => router.push('/dashboard/profile'), 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/profile" className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
          </Link>
          <h1 className="text-base font-medium text-[#1A1A1A]">Edit Deen</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Religiosity Level <span className="text-red-500">*</span></label>
            <div className="flex flex-col gap-2">
              {LEVELS.map(lvl => (
                <button
                  key={lvl.value}
                  type="button"
                  onClick={() => setReligiosity(lvl.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    religiosity === lvl.value ? 'border-[#AF4D98] bg-[#AF4D98] text-white' : 'border-[#EDE8E3] text-[#1A1A1A] hover:border-[#AF4D98]'
                  }`}
                >
                  <div className="font-medium text-sm">{lvl.label}</div>
                  <div className={`text-xs mt-0.5 ${religiosity === lvl.value ? 'text-white/80' : 'text-[#9B9B9B]'}`}>{lvl.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Madhab (optional)</label>
            <input
              type="text"
              value={madhab}
              onChange={e => setMadhab(e.target.value)}
              className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
              placeholder="e.g. Hanafi, Shafi'i"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Prayer Frequency <span className="text-red-500">*</span></label>
            <select
              value={prayerFreq}
              onChange={e => setPrayerFreq(e.target.value)}
              className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
            >
              <option value="">Select...</option>
              {PRAYER_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Islamic Knowledge Level <span className="text-red-500">*</span></label>
            <select
              value={knowledgeLevel}
              onChange={e => setKnowledgeLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
            >
              <option value="">Select...</option>
              {KNOWLEDGE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {gender === 'brother' ? (
            <YesNo label="Do you have a beard?" value={hasBeard} onChange={setHasBeard} />
          ) : (
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Wears Hijab</label>
              <select
                value={wearsHijab}
                onChange={e => setWearsHijab(e.target.value)}
                className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
              >
                <option value="">Select...</option>
                {HIJAB_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#AF4D98] text-white font-medium rounded-full py-3.5 mt-2 disabled:opacity-60 transition-opacity"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>

          <Link href="/dashboard/profile" className="text-center text-sm text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            Cancel
          </Link>
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
