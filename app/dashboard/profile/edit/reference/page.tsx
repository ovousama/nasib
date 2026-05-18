'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'

type Reference = {
  id: string
  referee_name: string | null
  referee_relationship: string | null
  referee_email: string | null
  referee_phone: string | null
  questionnaire_completed_at: string | null
}

export default function EditReferencePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)

  const [reference, setReference] = useState<Reference | null>(null)

  const [refereeName, setRefereeName] = useState('')
  const [refereeRelationship, setRefereeRelationship] = useState('')
  const [refereeEmail, setRefereeEmail] = useState('')
  const [refereePhone, setRefereePhone] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('gender').eq('id', user.id).single()
      if (!profile) { router.push('/auth/login'); return }
      const { data } = await supabase.from('references').select('id, referee_name, referee_relationship, referee_email, referee_phone, questionnaire_completed_at').eq('profile_id', user.id).single()
      if (data) {
        setReference(data)
        setRefereeName(data.referee_name ?? '')
        setRefereeRelationship(data.referee_relationship ?? '')
        setRefereeEmail(data.referee_email ?? '')
        setRefereePhone(data.referee_phone ?? '')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('references')
        .update({ referee_name: refereeName.trim() || null, referee_relationship: refereeRelationship.trim() || null, referee_email: refereeEmail.trim() || null, referee_phone: refereePhone.trim() || null })
        .eq('id', reference!.id)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isCompleted = reference?.questionnaire_completed_at != null

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/profile" className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
          </Link>
          <h1 className="text-base font-medium text-[#1A1A1A]">Edit Reference</h1>
        </div>

        {!reference ? (
          <div className="text-center py-10">
            <p className="text-[#5C5C5C] text-sm mb-4">No reference on file. Please complete the onboarding flow to add a reference.</p>
            <Link href="/dashboard/profile" className="text-[#AF4D98] text-sm font-medium hover:underline">
              Back to profile
            </Link>
          </div>
        ) : isCompleted ? (
          <div className="bg-white rounded-2xl border border-[#EDE8E3] p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium">Your reference has been completed. Thank you!</p>
            </div>
            <div className="border-t border-[#EDE8E3] pt-3 flex flex-col gap-2">
              {reference.referee_name && (
                <div>
                  <p className="text-xs text-[#9B9B9B]">Name</p>
                  <p className="text-sm text-[#1A1A1A] font-medium">{reference.referee_name}</p>
                </div>
              )}
              {reference.referee_relationship && (
                <div>
                  <p className="text-xs text-[#9B9B9B]">Relationship</p>
                  <p className="text-sm text-[#1A1A1A] font-medium">{reference.referee_relationship}</p>
                </div>
              )}
              {reference.referee_email && (
                <div>
                  <p className="text-xs text-[#9B9B9B]">Email</p>
                  <p className="text-sm text-[#1A1A1A] font-medium">{reference.referee_email}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-[#9B9B9B]">Completed</p>
                <p className="text-sm text-[#1A1A1A] font-medium">
                  {new Date(reference.questionnaire_completed_at!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-5">
              <p className="text-sm text-amber-700">Reference is pending. You can update the details below.</p>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Referee Name</label>
                <input
                  type="text"
                  value={refereeName}
                  onChange={e => setRefereeName(e.target.value)}
                  className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Relationship</label>
                <input
                  type="text"
                  value={refereeRelationship}
                  onChange={e => setRefereeRelationship(e.target.value)}
                  className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
                  placeholder="e.g. Imam, Friend, Colleague"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Email</label>
                <input
                  type="email"
                  value={refereeEmail}
                  onChange={e => setRefereeEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
                  placeholder="referee@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  value={refereePhone}
                  onChange={e => setRefereePhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

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
          </>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-20 left-4 right-4 max-w-lg mx-auto rounded-[10px] px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-sm font-medium text-center ${toast === 'success' ? 'bg-[#AF4D98] text-white' : 'bg-red-600 text-white'}`}>
          {toast === 'success' ? 'Changes saved' : 'Something went wrong'}
        </div>
      )}
    </div>
  )
}
