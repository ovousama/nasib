'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'

function toStoragePath(urlOrPath: string): string {
  const marker = '/object/public/brother-photos/'
  const idx = urlOrPath.indexOf(marker)
  if (idx !== -1) return decodeURIComponent(urlOrPath.slice(idx + marker.length))
  const signMarker = '/object/sign/brother-photos/'
  const signIdx = urlOrPath.indexOf(signMarker)
  if (signIdx !== -1) return decodeURIComponent(urlOrPath.slice(signIdx + signMarker.length).split('?')[0])
  return urlOrPath
}

async function getSignedUrl(path: string): Promise<string> {
  const supabase = createClient()
  const { data } = await supabase.storage.from('brother-photos').createSignedUrl(path, 3600)
  return data?.signedUrl ?? ''
}

export default function EditPhotoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [removeMessage, setRemoveMessage] = useState(false)
  const [toast, setToast] = useState(false)
  const [currentPath, setCurrentPath] = useState<string | null>(null)
  const [currentDisplayUrl, setCurrentDisplayUrl] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('gender').eq('id', user.id).single()
      if (!profile || profile.gender !== 'brother') {
        router.push('/dashboard/profile')
        return
      }
      setUserId(user.id)
      const { data } = await supabase.from('brother_profiles').select('photo_url').eq('id', user.id).single()
      if (data?.photo_url) {
        const path = toStoragePath(data.photo_url)
        setCurrentPath(path)
        const signed = await getSignedUrl(path)
        setCurrentDisplayUrl(signed)
      }
      setLoading(false)
    }
    load()
  }, [])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null)
    setRemoveMessage(false)
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be under 5MB.')
      return
    }

    setPendingFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function cancelPending() {
    setPendingFile(null)
    setPreviewUrl(null)
    setError(null)
  }

  async function handleSave() {
    if (!pendingFile || !userId) return
    setError(null)
    setSaving(true)
    try {
      const supabase = createClient()
      const ext = pendingFile.name.split('.').pop() ?? 'jpg'
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage.from('brother-photos').upload(path, pendingFile)
      if (uploadError) throw new Error('Upload failed. Please try again.')

      // Remove the old file from storage
      if (currentPath) {
        await supabase.storage.from('brother-photos').remove([currentPath])
      }

      const { error: updateError } = await supabase
        .from('brother_profiles')
        .update({ photo_url: path })
        .eq('id', userId)
      if (updateError) throw updateError

      recalculateProfileCompletion().catch(() => {})
      setToast(true)
      setTimeout(() => router.push('/dashboard/profile'), 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
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

  const displayUrl = previewUrl ?? currentDisplayUrl

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard/profile" className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
          </Link>
          <h1 className="text-base font-medium text-[#1A1A1A]">Edit Photo</h1>
        </div>

        <div className="flex flex-col items-center mb-8">
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayUrl}
              alt="Profile photo"
              className="w-[120px] h-[120px] rounded-full object-cover ring-2 ring-[#EDE8E3]"
            />
          ) : (
            <div className="w-[120px] h-[120px] rounded-full bg-[#F9F0F6] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#AF4D98" className="w-12 h-12 opacity-30">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <p className="text-xs text-[#9B9B9B] mt-2.5">{previewUrl ? 'New photo preview' : 'Current photo'}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {removeMessage && (
          <div className="bg-amber-50 border border-amber-100 text-amber-700 text-sm rounded-xl px-4 py-3 mb-4">
            Brothers must have a photo on their profile.
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={onFileChange}
        />

        {pendingFile ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3.5 bg-[#AF4D98] text-white font-medium rounded-full text-[15px] hover:bg-[#9B3D85] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={cancelPending}
              className="w-full py-3 text-sm text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => { setRemoveMessage(false); fileInputRef.current?.click() }}
              className="w-full py-3.5 bg-[#AF4D98] text-white font-medium rounded-full text-[15px] hover:bg-[#9B3D85] transition-colors"
            >
              Change photo
            </button>
            <button
              type="button"
              onClick={() => { setError(null); setRemoveMessage(true) }}
              className="w-full py-2 text-center text-sm text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors"
            >
              Remove photo
            </button>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto rounded-[10px] px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-sm font-medium text-center bg-[#AF4D98] text-white">
          Photo updated
        </div>
      )}
    </div>
  )
}
