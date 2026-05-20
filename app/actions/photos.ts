'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function getSisterPhotoUrls(photoUrls: string[]): Promise<string[]> {
  if (!photoUrls || photoUrls.length === 0) return []
  const supabase = await createServerSupabaseClient()
  const signedUrls = await Promise.all(
    photoUrls.map(async (path) => {
      const storagePath = path.includes('/object/sign/')
        ? path.split('sister-photos/')[1]?.split('?')[0]
        : path
      if (!storagePath) return null
      const { data, error } = await supabase.storage
        .from('sister-photos')
        .createSignedUrl(storagePath, 3600)
      if (error || !data) return null
      return data.signedUrl
    })
  )
  return signedUrls.filter(Boolean) as string[]
}
