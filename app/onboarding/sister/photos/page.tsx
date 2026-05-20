/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const MAX = 5

export default function SisterPhotos() {
  const router   = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [userId,    setUserId]    = useState('')
  const [paths,     setPaths]     = useState<string[]>([])
  const [previews,  setPreviews]  = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('sister_profiles')
        .select('photo_urls')
        .eq('id', user.id)
        .single()
      const storedPaths: string[] = Array.isArray(data?.photo_urls) ? data.photo_urls : []
      if (storedPaths.length === 0) return
      setPaths(storedPaths)
      const urls = await Promise.all(
        storedPaths.map(async (p) => {
          const { data: signed } = await supabase.storage.from('sister-photos').createSignedUrl(p, 3600)
          return signed?.signedUrl ?? ''
        })
      )
      setPreviews(urls)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleFiles(files: FileList) {
    setError(null)
    const remaining = MAX - paths.length
    if (remaining <= 0) { setError(`Maximum ${MAX} photos allowed.`); return }

    const selected = Array.from(files).slice(0, remaining)
    for (const file of selected) {
      if (!file.type.startsWith('image/')) { setError('Please upload image files only.'); return }
      if (file.size > 5 * 1024 * 1024)    { setError('Each photo must be under 5MB.'); return }
    }

    setUploading(true)
    try {
      const supabase = createClient()

      const newPaths: string[]    = []
      const newPreviews: string[] = []

      for (const file of selected) {
        const ext  = file.name.split('.').pop() ?? 'jpg'
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('sister-photos')
          .upload(path, file)

        if (uploadError) throw uploadError

        newPaths.push(path)
        newPreviews.push(URL.createObjectURL(file))
      }

      const allPaths    = [...paths,    ...newPaths]
      const allPreviews = [...previews, ...newPreviews]

      setPaths(allPaths)
      setPreviews(allPreviews)

      const { error: dbErr } = await supabase
        .from('sister_profiles')
        .upsert({ id: userId, photo_urls: allPaths, photos_uploaded: true }, { onConflict: 'id' })

      if (dbErr) throw dbErr
      const { data: fullProfile } = await supabase
      .from('sister_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fullProfile) {
      const { calculateCompletion } = await import('@/lib/profile-completion')
      const { percentage, isComplete } = calculateCompletion(fullProfile as Record<string, unknown>, 'sister')
      await supabase
        .from('profiles')
        .update({
          profile_completion_percentage: percentage,
          profile_complete: isComplete,
          status: isComplete ? 'active' : 'pending_verification',
        })
        .eq('id', userId)
    }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function removePhoto(index: number) {
    try {
      const supabase = createClient()
      await supabase.storage.from('sister-photos').remove([paths[index]])

      const newPaths    = paths.filter((_, i) => i !== index)
      const newPreviews = previews.filter((_, i) => i !== index)
      setPaths(newPaths)
      setPreviews(newPreviews)

      await supabase
        .from('sister_profiles')
        .upsert({ id: userId, photo_urls: newPaths, photos_uploaded: newPaths.length > 0 }, { onConflict: 'id' })
      const { data: fullProfile } = await supabase
      .from('sister_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fullProfile) {
      const { calculateCompletion } = await import('@/lib/profile-completion')
      const { percentage, isComplete } = calculateCompletion(fullProfile as Record<string, unknown>, 'sister')
      await supabase
        .from('profiles')
        .update({
          profile_completion_percentage: percentage,
          profile_complete: isComplete,
          status: isComplete ? 'active' : 'pending_verification',
        })
        .eq('id', userId)
    }
    } catch {}
  }

  function handleNext() {
    router.push('/onboarding/sister/reference')
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-xl font-medium text-[#1A1A1A] mb-1">Your Photos</h2>
      <p className="text-[#9B9B9B] text-sm mb-1">Optional — add up to {MAX} photos</p>
      <p className="text-[#9B9B9B] text-xs mb-4">
        Your photos are private and only shared when you choose to accept a brother&apos;s interest.
      </p>
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-8">
        <p className="text-xs text-amber-700">
          🔒 Your photos are <strong>completely private</strong>. They are only released to a brother
          once you both agree to share — never visible publicly or to other matches.
        </p>
      </div>

      {/* Photo grid */}
      {paths.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {paths.map((_, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#F5E6F2]">
              {previews[i] ? (
                <img src={previews[i]} alt="Your photo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white text-xs hover:bg-black/80 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {paths.length < MAX && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className="rounded-2xl border-2 border-dashed border-[#EDE8E3] bg-[#FDF8F3] hover:border-[#AF4D98] hover:bg-[#F5E6F2] transition-all cursor-pointer flex flex-col items-center justify-center gap-3 py-10 mb-5">
          {uploading ? (
            <>
              <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[#5C5C5C]">Uploading securely...</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-[#EDE8E3] rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#9B9B9B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-[#5C5C5C] font-medium text-sm">Add photos</p>
                <p className="text-[#9B9B9B] text-xs mt-0.5">{paths.length} of {MAX} uploaded · JPG, PNG · Max 5MB each</p>
              </div>
            </>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={e => { if (e.target.files?.length) handleFiles(e.target.files) }} />

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
      )}

      <button onClick={handleNext} disabled={uploading}
        className="w-full py-3 bg-[#AF4D98] text-white font-medium rounded-full hover:bg-[#9B3D85] transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed">
        {paths.length > 0 ? 'Next →' : 'Continue without photos →'}
      </button>

      <button
        type="button"
        onClick={handleNext}
        disabled={uploading}
        className="w-full text-center text-sm text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors mt-4 disabled:opacity-60"
      >
        Skip for now
      </button>
    </div>
  )
}
