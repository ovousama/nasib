'use client'

import { usePathname } from 'next/navigation'

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
    <div className="min-h-screen bg-[#FDFAF7]">
      {/* Fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-[#EBEBEB]">
        {/* Progress bar — very top */}
        {currentStep > 0 && (
          <div className="h-0.5 bg-[#EBEBEB]">
            <div
              className="h-0.5 bg-[#AF4D98] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <div className="max-w-lg mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-semibold text-[#AF4D98] tracking-tight">Nasib</span>
          {currentStep > 0 && (
            <span className="text-sm text-[#9B9B9B] font-medium tabular-nums">
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
