/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'
import { PAGE_BG } from '../EditHelpers'

type PhotoSlot = {
  file: File | null
  preview: string
  path: string
  uploaded: boolean
} | null

function PhotoSlotComponent({ index, photo, onAdd, onRemove, required }: {
  index: number
  photo: PhotoSlot
  onAdd: () => void
  onRemove: () => void
  required: boolean
}) {
  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: '3/4',
        borderRadius: '12px',
        overflow: 'hidden',
        border: photo ? 'none' : `1.5px dashed ${required ? '#AF4D98' : '#EDE8E3'}`,
        background: photo ? 'transparent' : '#FDFAF7',
        cursor: photo ? 'default' : 'pointer',
      }}
      onClick={!photo ? onAdd : undefined}
    >
      {photo ? (
        <>
          <img
            src={photo.preview}
            alt={`Photo ${index + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <button
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}
          >
            ×
          </button>
          {index === 0 && (
            <span style={{
              position: 'absolute',
              bottom: '6px',
              left: '6px',
              background: '#AF4D98',
              color: 'white',
              fontSize: '10px',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: '999px',
            }}>
              Main
            </span>
          )}
          {!photo.uploaded && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div className="w-6 h-6 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: '6px',
        }}>
          <span style={{ fontSize: '24px', color: required ? '#AF4D98' : '#C0B8B0' }}>+</span>
          <span style={{
            fontSize: '10px',
            color: required ? '#AF4D98' : '#9B9B9B',
            fontWeight: required ? 500 : 400,
          }}>
            {required ? 'Required' : 'Optional'}
          </span>
        </div>
      )}
    </div>
  )
}

export default function EditPhotoPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [targetSlot, setTargetSlot] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState(false)
  const [userId, setUserId] = useState('')
  const [photos, setPhotos] = useState<PhotoSlot[]>([null, null, null, null, null])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('gender').eq('id', user.id).single()
      if (!profile || profile.gender !== 'brother') { router.push('/dashboard/profile'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('brother_profiles')
        .select('photo_urls, photo_url')
        .eq('id', user.id)
        .single()

      const existingPaths: string[] = data?.photo_urls?.length
        ? data.photo_urls
        : data?.photo_url
        ? [data.photo_url]
        : []

      if (existingPaths.length) {
        const loaded = existingPaths.map((path: string) => {
          const publicUrl = path.startsWith('http')
            ? path
            : supabase.storage.from('brother-photos').getPublicUrl(path).data.publicUrl
          return { file: null, preview: publicUrl, path, uploaded: true }
        })
        const slots: PhotoSlot[] = [null, null, null, null, null]
        loaded.forEach((p, i) => { if (i < 5) slots[i] = p })
        setPhotos(slots)
      }
      setLoading(false)
    }
    load()
  }, [])

  function triggerFileInput(index: number) {
    setTargetSlot(index)
    fileInputRef.current?.click()
  }

  async function uploadPhoto(file: File, index: number): Promise<string | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${Date.now()}-${index}.${ext}`
    const { data, error: uploadError } = await supabase.storage
      .from('brother-photos')
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (uploadError) { console.error('Upload error:', uploadError); return null }
    return data.path
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.')
      return
    }
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10MB.'); return }

    const slot = targetSlot
    const preview = URL.createObjectURL(file)
    setPhotos(prev => {
      const next = [...prev]
      next[slot] = { file, preview, path: '', uploaded: false }
      return next
    })

    const path = await uploadPhoto(file, slot)
    setPhotos(prev => {
      const next = [...prev]
      const current = next[slot]
      if (current && !current.uploaded) {
        next[slot] = { ...current, path: path ?? '', uploaded: !!path }
      }
      return next
    })
    if (!path) setError('Failed to upload photo. Please try again.')
  }

  async function removePhoto(index: number) {
    const photo = photos[index]
    if (!photo) return
    if (photo.path) {
      const supabase = createClient()
      await supabase.storage.from('brother-photos').remove([photo.path])
    }
    setPhotos(prev => {
      const next = [...prev]
      next[index] = null
      return next
    })
  }

  async function handleSave() {
    const paths = photos.filter(Boolean).map(p => p!.path).filter(Boolean)
    if (paths.length < 3) { setError('You need at least 3 photos.'); return }
    const stillUploading = photos.filter(Boolean).some(p => !p?.uploaded)
    if (stillUploading) { setError('Please wait for all photos to finish uploading.'); return }

    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('brother_profiles')
        .update({ photo_urls: paths, photo_url: paths[0] })
        .eq('id', userId)
      if (updateError) throw updateError
      recalculateProfileCompletion().catch(() => {})
      setToast(true)
      setTimeout(() => router.push('/dashboard/profile'), 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save photos. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: PAGE_BG }}>
        <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const uploadedCount = photos.filter(Boolean).length
  const allUploaded = photos.filter(Boolean).every(p => p?.uploaded)
  const canSave = uploadedCount >= 3 && allUploaded

  return (
    <div className="min-h-screen pt-[72px] lg:pt-[76px]" style={{ background: PAGE_BG }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 20px 80px' }}>
        <div style={{ marginBottom: '28px' }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'transparent', border: 'none',
              color: '#9B7090', fontSize: '13px', cursor: 'pointer',
              padding: 0, marginBottom: '12px',
            }}
          >
            ← Back to profile
          </button>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '26px', fontWeight: 400,
            color: '#1A1A1A', letterSpacing: '-0.01em', margin: 0,
          }}>
            My Photos
          </h1>
        </div>

        {error && (
          <div style={{ background: '#FDECEA', border: '1px solid #F5C6C6', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: '#C13515', margin: 0 }}>{error}</p>
          </div>
        )}

        <p className="text-sm text-[#9B9B9B] mb-4">
          {uploadedCount} of 5 photos · minimum 3 required
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
          {[0, 1, 2, 3, 4].map(index => (
            <PhotoSlotComponent
              key={index}
              index={index}
              photo={photos[index]}
              onAdd={() => triggerFileInput(index)}
              onRemove={() => removePhoto(index)}
              required={index < 3}
            />
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave || saving}
          style={{
            width: '100%',
            background: canSave ? '#AF4D98' : '#EDE8E3',
            color: canSave ? 'white' : '#9B9B9B',
            border: 'none',
            borderRadius: '999px',
            padding: '14px',
            fontSize: '15px',
            fontWeight: 500,
            cursor: canSave ? 'pointer' : 'not-allowed',
            marginTop: '4px',
          }}
        >
          {saving
            ? 'Saving...'
            : !allUploaded && uploadedCount > 0
            ? 'Uploading...'
            : canSave
            ? 'Save changes'
            : `Add ${Math.max(0, 3 - uploadedCount)} more photo${3 - uploadedCount !== 1 ? 's' : ''} to save`}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          style={{
            width: '100%', background: 'transparent', border: 'none',
            color: '#9B9B9B', fontSize: '14px', cursor: 'pointer',
            padding: '12px', marginTop: '4px', textAlign: 'center',
          }}
        >
          Cancel
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto rounded-[10px] px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-sm font-medium text-center bg-[#AF4D98] text-white">
          Photos updated
        </div>
      )}
    </div>
  )
}
