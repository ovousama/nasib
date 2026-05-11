'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const MAX_PHOTOS = 5

export default function EditPhotosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('gender').eq('id', user.id).single()
      if (!profile || profile.gender !== 'sister') {
        router.push('/dashboard/profile')
        return
      }
      setUserId(user.id)
      const { data } = await supabase.from('sister_profiles').select('photo_urls').eq('id', user.id).single()
      if (data && Array.isArray(data.photo_urls)) setPhotoUrls(data.photo_urls)
      setLoading(false)
    }
    load()
  }, [])

  function removePhoto(index: number) {
    setPhotoUrls(prev => prev.filter((_, i) => i !== index))
  }

  async function handleAddPhoto(file: File) {
    setError(null)
    if (photoUrls.length >= MAX_PHOTOS) {
      setError(`You can upload a maximum of ${MAX_PHOTOS} photos.`)
      return
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Each image must be under 5MB.')
      return
    }
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const timestamp = Date.now()
      const path = `${userId}/photo-${timestamp}.${ext}`
      const { error: uploadError } = await supabase.storage.from('sister-photos').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('sister-photos').getPublicUrl(path)
      setPhotoUrls(prev => [...prev, publicUrl])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleAddPhoto(file)
    e.target.value = ''
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('sister_profiles')
        .update({ photo_urls: photoUrls, photos_uploaded: photoUrls.length > 0 })
        .eq('id', userId)
      if (updateError) throw updateError
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
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/profile" className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-[#1A1A1A]">Edit Photos</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <p className="text-sm text-[#9B9B9B] mb-4">{photoUrls.length} / {MAX_PHOTOS} photos</p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {photoUrls.map((url, index) => (
            <div key={url + index} className="relative aspect-square rounded-xl overflow-hidden border border-[#EBEBEB]">
              <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          ))}

          {photoUrls.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-xl border-2 border-dashed border-[#EBEBEB] hover:border-[#AF4D98] flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-60"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#AF4D98" className="w-5 h-5">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  <span className="text-xs text-[#AF4D98] font-medium">Add photo</span>
                </>
              )}
            </button>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={onFileChange} />

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading}
          className="w-full bg-[#AF4D98] text-white font-semibold rounded-xl py-3 mt-4 disabled:opacity-60 transition-opacity"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>

        <Link href="/dashboard/profile" className="block text-center text-sm text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors mt-4">
          Cancel
        </Link>
      </div>

      {toast && (
        <div className={`fixed bottom-20 left-4 right-4 max-w-lg mx-auto rounded-xl px-4 py-3 shadow-md text-sm font-medium text-center ${toast === 'success' ? 'bg-[#AF4D98] text-white' : 'bg-red-600 text-white'}`}>
          {toast === 'success' ? 'Photos saved' : 'Something went wrong'}
        </div>
      )}
    </div>
  )
}
