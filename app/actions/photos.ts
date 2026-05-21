'use server'

import { createStorageClient } from '@/lib/supabase'

function cleanStoragePath(raw: string): string | null {
  if (!raw) return null
  // Strip any full URL prefix, keeping only the bucket-relative path
  const match = raw.match(/sister-photos\/(.+?)(?:\?|$)/)
  if (match) return match[1]
  // If it looks like a plain path already (no http), return as-is
  if (!raw.startsWith('http')) return raw
  return null
}

export async function getSisterPhotoUrls(photoUrls: string[]): Promise<string[]> {
  if (!photoUrls || photoUrls.length === 0) return []
  const storage = createStorageClient().storage
  const signedUrls = await Promise.all(
    photoUrls.map(async (raw) => {
      const storagePath = cleanStoragePath(raw)
      if (!storagePath) return null
      const { data, error } = await storage
        .from('sister-photos')
        .createSignedUrl(storagePath, 3600)
      console.log('Signed URL:', data?.signedUrl, 'Error:', error)
      if (error || !data) return null
      return data.signedUrl
    })
  )
  return signedUrls.filter(Boolean) as string[]
}
