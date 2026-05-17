'use client'

import { usePathname } from 'next/navigation'
import NasibLogo from '@/components/ui/NasibLogo'

const BROTHER_STEPS = [
  '/onboarding/brother',
  '/onboarding/brother/religiosity',
  '/onboarding/brother/lifestyle',
  '/onboarding/brother/marriage',
  '/onboarding/brother/preferences',
  '/onboarding/brother/character',
  '/onboarding/brother/additional',
  '/onboarding/brother/photo',
  '/onboarding/brother/reference',
]

const SISTER_STEPS = [
  '/onboarding/sister',
  '/onboarding/sister/info',
  '/onboarding/sister/religiosity',
  '/onboarding/sister/lifestyle',
  '/onboarding/sister/marriage',
  '/onboarding/sister/preferences',
  '/onboarding/sister/character',
  '/onboarding/sister/additional',
  '/onboarding/sister/photos',
  '/onboarding/sister/reference',
]

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isBrother = pathname.startsWith('/onboarding/brother')
  const isSister = pathname.startsWith('/onboarding/sister')
  const steps = isBrother ? BROTHER_STEPS : isSister ? SISTER_STEPS : []

  const idx = steps.indexOf(pathname)
  const currentStep = idx + 1
  const totalSteps = steps.length
  const progress = totalSteps > 0 && currentStep > 0 ? (currentStep / totalSteps) * 100 : 0

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      {/* Fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-[#EDE8E3]">
        {/* Progress bar — very top, 2px, no border-radius */}
        {currentStep > 0 && (
          <div className="h-[2px] bg-[#EDE8E3]">
            <div
              className="h-[2px] bg-[#AF4D98] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <div className="max-w-lg mx-auto px-6 h-14 flex items-center justify-between">
          <NasibLogo size="sm" theme="light" />
          {currentStep > 0 && (
            <span className="text-[13px] text-[#9B9B9B] tabular-nums">
              Step {currentStep} of {totalSteps}
            </span>
          )}
        </div>
      </div>

      {/* Page content */}
      <div className="pt-16">{children}</div>
    </div>
  )
}
