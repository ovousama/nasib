'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type QuickViewData = {
  first_name: string
  age: number
  location: string | null
  verification_badge: boolean
  religiosity_level: string | null
  education_level: string | null
  occupation: string | null
  wants_children: boolean | null
  timeline_to_marry: string | null
  photo_url: string | null
  reference_status: 'pending' | 'completed' | null
}

type Props = {
  profileId: string | null
  gender: 'brother' | 'sister'
  isOpen: boolean
  onClose: () => void
  onAccept?: () => void
  onDecline?: () => void
  showActions: boolean
  introMessage?: string | null
  compatibilityNote?: string | null
  interestId?: string
}

function Skeleton({ className }: { className: string }) {
  return <div className={`bg-[#EDE8E3] animate-pulse rounded ${className}`} />
}

function InfoRow({ label, value }: { label: string; value: string | boolean | null | undefined }) {
  if (value === null || value === undefined || value === '') return null
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#9B9B9B]">{label}</span>
      <span className="text-sm font-medium text-[#1A1A1A]">{display}</span>
    </div>
  )
}

export default function ProfileQuickView({
  profileId,
  gender,
  isOpen,
  onClose,
  onAccept,
  onDecline,
  showActions,
  introMessage,
  compatibilityNote,
  interestId,
}: Props) {
  const [data, setData] = useState<QuickViewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [panelIn, setPanelIn] = useState(false)

  useEffect(() => {
    if (isOpen && profileId) {
      setMounted(true)
      const raf = requestAnimationFrame(() => setPanelIn(true))
      fetchData()
      return () => cancelAnimationFrame(raf)
    } else {
      setPanelIn(false)
      const t = setTimeout(() => {
        setMounted(false)
        setData(null)
      }, 250)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, profileId])

  async function fetchData() {
    if (!profileId) return
    setLoading(true)
    setData(null)
    try {
      const supabase = createClient()
      const table = gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
      const select = gender === 'brother'
        ? 'full_name, age, location, religiosity_level, education_level, occupation, wants_children, timeline_to_marry, photo_url'
        : 'full_name, age, location, religiosity_level, education_level, occupation, wants_children, timeline_to_marry'

      const [{ data: ext }, { data: base }, { data: ref }] = await Promise.all([
        supabase.from(table).select(select).eq('id', profileId).single(),
        supabase.from('profiles').select('verification_badge').eq('id', profileId).single(),
        supabase.from('references').select('status').eq('profile_id', profileId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ])

      if (ext) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = ext as any
        setData({
          first_name: (e.full_name as string).split(' ')[0],
          age: e.age,
          location: e.location ?? null,
          verification_badge: base?.verification_badge ?? false,
          religiosity_level: e.religiosity_level ?? null,
          education_level: e.education_level ?? null,
          occupation: e.occupation ?? null,
          wants_children: e.wants_children ?? null,
          timeline_to_marry: e.timeline_to_marry ?? null,
          photo_url: gender === 'brother' ? (e.photo_url ?? null) : null,
          reference_status: ref?.status ?? null,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  const fullProfileHref = interestId
    ? `/dashboard/profile/${profileId}?context=interest&interestId=${interestId}`
    : `/dashboard/profile/${profileId}`

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${panelIn ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-[28px] z-50 transition-transform duration-300 ease-out ${panelIn ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '85vh', overflowY: 'auto' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white z-10">
          <div className="w-10 h-1 bg-[#EDE8E3] rounded-full" />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F5] text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors z-10"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>

        <div className="px-6 pb-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6 pt-2">
            {loading ? (
              <>
                <Skeleton className="w-20 h-20 rounded-full mb-3" />
                <Skeleton className="w-28 h-6 mb-1" />
                <Skeleton className="w-20 h-4" />
              </>
            ) : data ? (
              <>
                {gender === 'brother' && data.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.photo_url}
                    alt={data.first_name}
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-[#EDE8E3] mb-3"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#F4E4BA] flex items-center justify-center text-[#AF4D98] text-3xl font-medium mb-3">
                    {data.first_name[0]?.toUpperCase()}
                  </div>
                )}
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#AF4D98]/60 mb-0.5">نصيب</p>
                <h2 className="text-[24px] font-medium text-[#1A1A1A] tracking-[-0.02em]">{data.first_name}</h2>
                <p className="text-[15px] text-[#9B9B9B] mt-0.5">
                  {[data.age ? `${data.age} yrs` : null, data.location].filter(Boolean).join(' · ')}
                </p>
                {data.verification_badge && (
                  <span className="mt-2 inline-flex items-center gap-1.5 bg-[#F9F0F6] text-[#AF4D98] text-xs font-medium px-3 py-1.5 rounded-full border border-[#AF4D98]/20">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
              </>
            ) : (
              <p className="text-sm text-[#9B9B9B]">Profile unavailable</p>
            )}
          </div>

          {/* Key info grid */}
          {(loading || data) && (
            <div className="bg-[#FAF4EE] rounded-[16px] p-4 mb-5">
              {loading ? (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <Skeleton className="w-16 h-3" />
                      <Skeleton className="w-24 h-4" />
                    </div>
                  ))}
                </div>
              ) : data ? (
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="Religiosity" value={data.religiosity_level} />
                  <InfoRow label="Education" value={data.education_level} />
                  <InfoRow label="Location" value={data.location} />
                  <InfoRow label="Timeline" value={data.timeline_to_marry} />
                  <InfoRow label="Children" value={data.wants_children} />
                  <InfoRow label="Occupation" value={data.occupation} />
                </div>
              ) : null}
            </div>
          )}

          {/* Intro message */}
          {introMessage && (
            <div className="mb-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#9B9B9B] mb-2">Their introduction</p>
              <p className="border-l-2 border-[#E5A9A9] pl-3 text-sm italic text-[#5C5C5C] leading-relaxed">
                &ldquo;{introMessage}&rdquo;
              </p>
            </div>
          )}

          {/* Compatibility note */}
          {compatibilityNote && !introMessage && (
            <div className="mb-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#9B9B9B] mb-2">Why you matched</p>
              <p className="border-l-2 border-[#E5A9A9] pl-3 text-sm italic text-[#5C5C5C] leading-relaxed">
                {compatibilityNote}
              </p>
            </div>
          )}

          {/* Reference status */}
          {data?.reference_status && (
            <div className="mb-5">
              {data.reference_status === 'completed' ? (
                <span className="inline-flex items-center gap-1.5 bg-[#E6F9F7] text-[#00A699] text-xs font-medium px-3 py-1.5 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.844-8.791a.75.75 0 00-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 10-1.114 1.004l2.25 2.5a.75.75 0 001.15-.086l4.25-5.5-.001-.002z" clipRule="evenodd" />
                  </svg>
                  Reference verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full border border-amber-100">
                  Reference pending
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2.5">
            <Link
              href={fullProfileHref}
              className="block w-full text-center py-3 border border-[#EDE8E3] rounded-full text-sm font-medium text-[#1A1A1A] hover:border-[#D4CBC4] hover:bg-[#FAF4EE] transition-all"
            >
              View full profile
            </Link>

            {showActions && (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={onDecline}
                  className="py-3 text-sm font-medium text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={onAccept}
                  className="py-3 bg-[#AF4D98] text-white text-sm font-medium rounded-full hover:bg-[#9B3D85] transition-colors"
                >
                  Accept
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
