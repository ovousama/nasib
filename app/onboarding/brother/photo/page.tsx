/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const KEY = 'nasib_onboarding_brother'

function toStoragePath(urlOrPath: string): string {
  const marker = '/object/public/brother-photos/'
  const idx = urlOrPath.indexOf(marker)
  if (idx !== -1) return decodeURIComponent(urlOrPath.slice(idx + marker.length))
  const signMarker = '/object/sign/brother-photos/'
  const signIdx = urlOrPath.indexOf(signMarker)
  if (signIdx !== -1) return decodeURIComponent(urlOrPath.slice(signIdx + signMarker.length).split('?')[0])
  return urlOrPath
}

export default function BrotherPhoto() {
  const router      = useRouter()
  const inputRef    = useRef<HTMLInputElement>(null)
  const [preview,   setPreview]   = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded,  setUploaded]  = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    async function loadSaved() {
      try {
        const s = JSON.parse(localStorage.getItem(KEY) || '{}')
        if (!s.photo_url) return
        setUploaded(true)
        const path = toStoragePath(s.photo_url)
        const supabase = createClient()
        const { data } = await supabase.storage.from('brother-photos').createSignedUrl(path, 3600)
        if (data?.signedUrl) setPreview(data.signedUrl)
      } catch {}
    }
    loadSaved()
  }, [])

  async function handleFile(file: File) {
    setError(null)
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB.')
      return
    }

    setPreview(URL.createObjectURL(file))
    setUploading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const ext  = file.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/photo.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('brother-photos')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      // Store the storage path (not a public URL) — signed URL generated at display time
      const s = JSON.parse(localStorage.getItem(KEY) || '{}')
      localStorage.setItem(KEY, JSON.stringify({ ...s, photo_url: path }))
      setUploaded(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleNext() {
    if (!uploaded) { setError('Please upload a photo to continue.'); return }
    router.push('/onboarding/brother/reference')
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[480px] mx-auto px-5 py-8 pb-28">
        <h2 className="text-2xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-1">Your Photo</h2>
        <p className="text-[15px] text-[#9B9B9B] mb-2">Upload a clear photo of yourself</p>
        <p className="text-xs text-[#9B9B9B] mb-8">
          Your photo is only shared with sisters you are connected with — not publicly visible.
        </p>

        {/* Upload area */}
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className={`relative rounded-2xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden ${
            uploaded
              ? 'border-[#AF4D98] bg-[#F9F0F6]'
              : 'border-[#EDE8E3] bg-[#FDF8F3] hover:border-[#AF4D98] hover:bg-[#F9F0F6]'
          }`}
          style={{ minHeight: 280 }}
        >
          {preview ? (
            <img src={preview} alt="Your photo" className="w-full h-72 object-cover rounded-2xl" />
          ) : uploaded ? (
            <div className="flex flex-col items-center justify-center h-72 gap-3">
              <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-72 gap-3 px-4 text-center">
              <div className="w-14 h-14 bg-[#EDE8E3] rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-[#9B9B9B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[#5C5C5C] font-medium text-sm">Tap to upload a photo</p>
                <p className="text-[#9B9B9B] text-xs mt-1">JPG, PNG or WEBP · Max 5MB</p>
              </div>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[#5C5C5C]">Uploading...</p>
              </div>
            </div>
          )}
        </div>

        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />

        {error && (
          <div className="mt-4 border border-[#C13515]/20 bg-[#FDECEA] text-[#C13515] text-sm rounded-[10px] px-4 py-3">{error}</div>
        )}

        <button onClick={handleNext} disabled={uploading}
          className="w-full py-3.5 bg-[#AF4D98] text-white font-medium rounded-full text-[15px] hover:bg-[#9B3D85] transition-colors mt-6 disabled:opacity-40 disabled:cursor-not-allowed">
          Next →
        </button>
      </div>
    </div>
  )
}
