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
  '/onboarding/brother/deepdive',
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
  '/onboarding/sister/deepdive',
  '/onboarding/sister/photos',
  '/onboarding/sister/reference',
]

const STEP_QUOTES: Record<number, string> = {
  1: 'Begin with bismillah',
  2: 'Your deen is your foundation',
  3: 'Honesty builds trust',
  4: 'Your family shapes you',
  5: 'Clarity prevents conflict',
  6: 'Know yourself first',
  7: 'A face of modesty',
  8: 'Go deeper — this is where it matters',
  9: 'Character is everything',
  10: 'Almost there',
  11: 'Almost there',
}

const STEP_NAMES: Record<number, string> = {
  1: 'Getting started',
  2: 'Your deen',
  3: 'Your lifestyle',
  4: 'Marriage goals',
  5: 'Preferences',
  6: 'Your character',
  7: 'More about you',
  8: 'Deep dive',
  9: 'Photos',
  10: 'Reference',
  11: 'Reference',
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isBrother = pathname.startsWith('/onboarding/brother')
  const isSister = pathname.startsWith('/onboarding/sister')
  const steps = isBrother ? BROTHER_STEPS : isSister ? SISTER_STEPS : []

  const idx = steps.indexOf(pathname)
  const currentStep = idx + 1
  const totalSteps = steps.length
  const progress = totalSteps > 0 && currentStep > 0 ? (currentStep / totalSteps) * 100 : 0
  const stepName = STEP_NAMES[currentStep] ?? ''
  const quote = STEP_QUOTES[currentStep] ?? ''

  return (
    <div className="min-h-screen bg-[#FDF8F3] lg:flex">
      {/* Desktop left panel — hidden on mobile */}
      <div
        className="hidden lg:flex lg:flex-col lg:justify-between lg:w-[420px] lg:flex-shrink-0 lg:px-12 lg:py-16 lg:sticky lg:top-0 lg:h-screen"
        style={{ background: 'linear-gradient(160deg, #AF4D98, #D66BA0)' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
          <span style={{ fontFamily: 'var(--font-arabic, "Noto Naskh Arabic", serif)', fontSize: '26px', color: '#fff', fontWeight: 500, lineHeight: 1 }}>
            نصيب
          </span>
          <span style={{ fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)', fontSize: '9px', color: 'rgba(255,255,255,0.7)', fontWeight: 200, letterSpacing: '0.3em', textTransform: 'uppercase', lineHeight: 1 }}>
            Naseeb
          </span>
        </div>

        <div>
          <p style={{ fontFamily: 'var(--font-arabic, "Noto Naskh Arabic", serif)', fontSize: '24px', color: '#fff', lineHeight: 1.7, marginBottom: '10px' }}>
            وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا
          </p>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', marginBottom: '4px', lineHeight: 1.5 }}>
            &ldquo;And of His signs is that He created for you mates&rdquo;
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>— Ar-Rum 30:21</p>

          {currentStep > 0 && (
            <>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '32px' }}>
                Step {currentStep} of {totalSteps}{stepName ? ` · ${stepName}` : ''}
              </p>
              {/* Progress dots */}
              <div style={{ display: 'flex', gap: '4px', marginTop: '10px', flexWrap: 'wrap' }}>
                {steps.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '6px', height: '6px', borderRadius: '3px',
                      background: i < currentStep ? '#fff' : 'rgba(255,255,255,0.3)',
                      transition: 'background 0.2s',
                    }}
                  />
                ))}
              </div>
              {quote && (
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', fontStyle: 'italic', marginTop: '16px' }}>
                  &ldquo;{quote}&rdquo;
                </p>
              )}
            </>
          )}
        </div>

        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
          Finding your nasib, the halal way.
        </p>
      </div>

      {/* Right panel — the form content */}
      <div className="flex-1 min-w-0">
        {/* Mobile top bar (hidden on desktop) */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-10 bg-white border-b border-[#EDE8E3]">
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

        {/* Desktop progress bar (hidden on mobile, shown at top of right panel) */}
        {currentStep > 0 && (
          <div className="hidden lg:block h-[2px] bg-[#EDE8E3] sticky top-0 z-10">
            <div
              className="h-[2px] bg-[#AF4D98] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Page content */}
        <div className="pt-16 lg:pt-0">{children}</div>
      </div>
    </div>
  )
}
