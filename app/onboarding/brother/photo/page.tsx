/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type PhotoSlot = {
  file: File | null
  preview: string
  path?: string
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

export default function BrotherPhotoPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [targetSlot, setTargetSlot] = useState(0)
  const [photos, setPhotos] = useState<PhotoSlot[]>([null, null, null, null, null])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadExisting() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }

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

      if (!existingPaths.length) return

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
    loadExisting()
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10MB.'); return }

    const slot = targetSlot
    const preview = URL.createObjectURL(file)
    setPhotos(prev => {
      const next = [...prev]
      next[slot] = { file, preview, uploaded: false }
      return next
    })

    const path = await uploadPhoto(file, slot)
    setPhotos(prev => {
      const next = [...prev]
      const current = next[slot]
      if (current && !current.uploaded) {
        next[slot] = { ...current, path: path ?? undefined, uploaded: !!path }
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

  async function handleNext() {
    const filled = photos.filter(Boolean)
    if (filled.length < 3) { setError('Please upload at least 3 photos.'); return }
    const stillUploading = filled.some(p => !p?.uploaded)
    if (stillUploading) { setError('Please wait for all photos to finish uploading.'); return }

    const paths = photos.filter(Boolean).map(p => p!.path!).filter(Boolean)
    if (paths.length < 3) { setError('Please upload at least 3 photos.'); return }

    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { data: existingRow } = await supabase.from('brother_profiles').select('id').eq('id', user.id).maybeSingle()
    if (!existingRow) {
      await supabase.from('brother_profiles').insert({ id: user.id })
    }

    const { error: saveError } = await supabase
      .from('brother_profiles')
      .update({ photo_urls: paths, photo_url: paths[0] })
      .eq('id', user.id)

    if (saveError) {
      setError('Could not save photos. Please try again.')
      setSaving(false)
      return
    }

    const { data: fullProfile } = await supabase
      .from('brother_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (fullProfile) {
      const { calculateCompletion } = await import('@/lib/profile-completion')
      const { percentage, isComplete } = calculateCompletion(fullProfile as Record<string, unknown>, 'brother')
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('status, profile_complete')
        .eq('id', user.id)
        .single()
      await supabase
        .from('profiles')
        .update({
          profile_completion_percentage: percentage,
          profile_complete: currentProfile?.profile_complete || isComplete,
          status: currentProfile?.status === 'active' ? 'active' : (isComplete ? 'active' : 'pending_verification'),
        })
        .eq('id', user.id)
    }

    router.push('/onboarding/brother/reference')
  }

  const uploadedCount = photos.filter(Boolean).length
  const allUploaded = photos.filter(Boolean).every(p => p?.uploaded)
  const canContinue = uploadedCount >= 3 && allUploaded

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[480px] mx-auto px-5 py-8 pb-32">
        <h2 className="text-2xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-1">Your photos</h2>
        <p className="text-[14px] text-[#9B9B9B] mb-6">
          Upload at least 3 photos so sisters can get a genuine sense of who you are. You can add up to 5.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '8px' }}>
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
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {error && (
          <div className="mt-3 border border-[#C13515]/20 bg-[#FDECEA] text-[#C13515] text-sm rounded-[10px] px-4 py-3">
            {error}
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!canContinue || saving}
          style={{
            width: '100%',
            background: canContinue ? '#AF4D98' : '#EDE8E3',
            color: canContinue ? 'white' : '#9B9B9B',
            border: 'none',
            borderRadius: '999px',
            padding: '14px',
            fontSize: '15px',
            fontWeight: 500,
            cursor: canContinue ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            marginTop: '20px',
          }}
        >
          {saving
            ? 'Saving...'
            : !allUploaded && uploadedCount > 0
            ? 'Uploading...'
            : uploadedCount < 3
            ? `Add ${3 - uploadedCount} more photo${3 - uploadedCount > 1 ? 's' : ''} to continue`
            : 'Continue →'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#9B9B9B', marginTop: '10px' }}>
          {uploadedCount} of 5 photos added
          {uploadedCount >= 3 && uploadedCount < 5 && ' · You can add more'}
        </p>
      </div>
    </div>
  )
}
