'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import NasibLogo from '@/components/ui/NasibLogo'
import AnimatedHero from './AnimatedHero'

const cormorant = "var(--font-cormorant, 'Cormorant Garamond', serif)"
const arabic = "var(--font-arabic, 'Noto Naskh Arabic', serif)"

// ─── Step cards data ───────────────────────────────────────────────────────

const STEPS = [
  {
    num: '01',
    title: 'Build your profile',
    body: 'Set aside about an hour. Your Naseeb profile is a genuine picture of who you are — your deen, your values, your family vision, and your character. The more honest your answers, the better your matches.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="20" cy="20" r="19" stroke="#AF4D98" strokeWidth="1.5" />
        <path d="M20 22a5 5 0 100-10 5 5 0 000 10z" stroke="#AF4D98" strokeWidth="1.5" />
        <path d="M11 31c0-4.418 4.03-8 9-8s9 3.582 9 8" stroke="#AF4D98" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M20 9.5a2.5 2 0 100-3.5" stroke="#AF4D98" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Get curated matches',
    body: 'Our team reviews completed profiles and manually curates matches based on deep compatibility — not just age and location. You will receive up to 5 carefully selected matches at a time.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="15" cy="20" r="10" stroke="#AF4D98" strokeWidth="1.5" />
        <circle cx="25" cy="20" r="10" stroke="#AF4D98" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Express interest',
    body: 'Either party can express interest in a match. When interest is mutual or accepted, a connection is created. Sisters share their photos only when they choose to accept.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M20 32s-13-8.5-13-16a7 7 0 0113-3.5A7 7 0 0133 16c0 7.5-13 16-13 16z" stroke="#AF4D98" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Chat with purpose',
    body: 'A three-way conversation opens between you, your match, and the sister\'s wali — who has read-only visibility throughout. Suggested questions help guide meaningful conversation.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M8 10h24a2 2 0 012 2v12a2 2 0 01-2 2H14l-6 4V12a2 2 0 012-2z" stroke="#AF4D98" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num: '05',
    title: 'Request a meeting',
    body: 'When you are both ready, either party can propose a meeting — virtual or in person. The process stays within the app so no personal contact details are exchanged prematurely.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="7" y="10" width="26" height="23" rx="3" stroke="#AF4D98" strokeWidth="1.5" />
        <path d="M7 17h26M14 7v6M26 7v6" stroke="#AF4D98" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M13 25h4M23 25h4M13 30h4" stroke="#AF4D98" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: '06',
    title: 'Move forward together',
    body: 'After meeting, both parties complete a private check-in. If you both want to move forward to nikah planning, Naseeb provides a comprehensive guide, checklist, and imam connection service.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M20 8c-2.5 0-4.5 2-4.5 4.5 0 2 1.3 3.7 3 4.3V32" stroke="#AF4D98" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M27 14c0 3.9-3.1 7-7 7s-7-3.1-7-7" stroke="#AF4D98" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M26 10.5c0 1.4-1.1 2.5-2.5 2.5S21 11.9 21 10.5 22.1 8 23.5 8 26 9.1 26 10.5z" stroke="#AF4D98" strokeWidth="1.5" />
      </svg>
    ),
  },
]

// ─── Differentiator cards ──────────────────────────────────────────────────

const DIFFS = [
  {
    icon: (
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
        <path d="M14 3L4 8v7c0 5.5 4.3 10.7 10 12 5.7-1.3 10-6.5 10-12V8L14 3z" stroke="#AF4D98" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 14l3 3 5-5" stroke="#AF4D98" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Wali from day one',
    body: 'The wali is not an afterthought. Sisters set up their wali profile before anything else. The wali has read-only visibility into the entire process — matches, chat, and meetings.',
  },
  {
    icon: (
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
        <rect x="4" y="4" width="20" height="20" rx="4" stroke="#AF4D98" strokeWidth="1.5" />
        <path d="M9 14a5 5 0 0010 0" stroke="#AF4D98" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4 9h20M4 19h20" stroke="#AF4D98" strokeWidth="1.5" strokeOpacity="0.3" />
        <path d="M10 9v10M18 9v10" stroke="#AF4D98" strokeWidth="1.5" strokeOpacity="0.3" />
      </svg>
    ),
    title: 'No photo browsing',
    body: "Brothers never browse sister photos. Sisters control exactly when and to whom their photos are shared — only after accepting an interest. Photos are revoked if a connection closes.",
  },
  {
    icon: (
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
        <path d="M14 4l2.5 7.5H24l-6.5 4.5 2.5 7.5L14 19l-6 4.5 2.5-7.5L4 11.5h7.5L14 4z" stroke="#AF4D98" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Deep compatibility',
    body: 'With over 100 profile questions covering deen, family values, emotional health, financial approach, and marriage vision — our matches go far beyond age and location.',
  },
  {
    icon: (
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
        <path d="M14 4l2 6h6l-5 3.5 2 6L14 16l-5 3.5 2-6L6 10h6l2-6z" stroke="#AF4D98" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="14" cy="14" r="10" stroke="#AF4D98" strokeWidth="1" strokeOpacity="0.2" />
      </svg>
    ),
    title: 'Intentional by design',
    body: 'No swiping. No browsing. No endless scrolling. You receive a small number of carefully curated matches and a guided process that respects the seriousness of what you are doing.',
  },
]

// ─── FAQ data ──────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'Is Naseeb free?',
    a: 'Yes — Naseeb is completely free for everyone, always. There are no subscriptions, no credits, and no hidden fees. If the platform helps you find your match, we simply ask that you consider making a voluntary donation to help keep it running for others.',
  },
  {
    q: 'Do I need a wali to sign up as a sister?',
    a: 'Yes. Setting up your wali profile is the first step in the sister onboarding. Your wali will be notified when your profile is created and given read-only access to your journey.',
  },
  {
    q: 'How are matches assigned?',
    a: 'During our early phase, matches are curated manually by our team. We review completed profiles carefully and assign up to 5 matches at a time based on deep compatibility across deen, values, lifestyle, and marriage vision.',
  },
  {
    q: 'Can I remain anonymous?',
    a: 'Your first name is shown on your profile. Your last name, contact details, and photos (for sisters) are never shown to strangers. You control exactly what is shared and when.',
  },
  {
    q: 'What if I am not ready to get married right now?',
    a: 'Naseeb is designed for people who are actively preparing for or pursuing marriage. If you are still some time away, we recommend coming back when you are ready — the process works best with genuine intent.',
  },
  {
    q: 'How long does the process take?',
    a: 'There is no timeline. Some connections progress to nikah planning within weeks. Others take longer. We encourage a thoughtful, unhurried approach — this is one of the most important decisions of your life.',
  },
  {
    q: 'Can I delete my account?',
    a: 'Yes. You can request account deletion from your profile settings at any time. All your data including messages, photos, and profile information will be permanently removed.',
  },
  {
    q: 'Where does Naseeb operate?',
    a: 'Naseeb currently serves Muslims across Canada, the United States, the United Kingdom, and the European Union. These are our primary markets for our initial launch. If you are based outside these regions, you are still welcome to sign up — simply set your location during onboarding. We are actively growing and will notify you as we expand to new regions, in sha Allah.',
  },
]

// ─── Component ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const howItWorksRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)

  function scrollToHowItWorks() {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">

      {/* ── FIXED NAV ─────────────────────────────────────────────────────── */}
      <div className="px-5 md:px-10" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingTop: '14px',
        paddingBottom: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'background 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease',
        background: scrolled ? 'rgba(255,255,255,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 1px 0 rgba(175,77,152,0.1)' : 'none',
      }}>
        <NasibLogo size="sm" theme="light" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href="/auth/login"
            style={{
              fontSize: '14px',
              fontWeight: 400,
              color: '#5C5C5C',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '999px',
              border: scrolled ? '1px solid #EDE8E3' : '1px solid rgba(175,77,152,0.25)',
              background: scrolled ? 'white' : 'rgba(255,255,255,0.7)',
              transition: 'all 0.3s ease',
            }}
          >
            Sign in
          </a>
          <a
            href="/auth/signup"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'white',
              textDecoration: 'none',
              padding: '8px 18px',
              borderRadius: '999px',
              background: '#AF4D98',
              transition: 'all 0.3s ease',
            }}
          >
            Begin my profile →
          </a>
        </div>
      </div>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        data-testid="landing-hero"
        style={{ background: 'linear-gradient(160deg, #FDF8F3 0%, #F5E6F2 100%)', paddingTop: '80px' }}
        className="px-5 md:px-10 lg:px-16 pb-12 lg:pb-[60px] lg:min-h-[90vh] lg:flex lg:flex-col lg:justify-center"
      >
        <div className="max-w-[700px] mx-auto text-center">
          {/* Ar-Rum verse — first element */}
          <p
            className="mb-2 text-[#AF4D98]"
            style={{ fontFamily: arabic, fontSize: '22px', lineHeight: 1.8 }}
          >
            وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا
          </p>
          <p className="text-[14px] italic text-[#9B9B9B] mb-1">
            &ldquo;And of His signs is that He created for you mates that you may find tranquillity in them&rdquo;
          </p>
          <p className="text-[12px] text-[#BDBDBD] mb-12">— Ar-Rum 30:21</p>

          {/* Main heading — animated */}
          <AnimatedHero />

          {/* Subheading */}
          <p
            className="text-[#5C5C5C] mx-auto mb-10 max-w-[560px]"
            style={{ fontSize: '18px', fontWeight: 300, lineHeight: 1.7 }}
          >
            A halal matchmaking platform built around Islamic values. Serious intent, wali involvement,
            and deep compatibility — from the very first step.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center text-[15px] font-medium text-white bg-[#AF4D98] rounded-full px-8 py-4 hover:bg-[#9B3D85] transition-colors"
            >
              Begin my profile →
            </Link>
            <Link
              href="/auth/login"
              className="w-full sm:w-auto inline-flex items-center justify-center text-[15px] text-[#5C5C5C] bg-white border border-[#EDE8E3] rounded-full px-8 py-4 hover:border-[#AF4D98] transition-colors"
            >
              Sign in
            </Link>
          </div>

          <p className="text-[13px] text-[#9B9B9B] text-center mt-4">
            Free, Forever
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section
        ref={howItWorksRef}
        data-testid="landing-how-it-works"
        className="bg-white px-6 py-[80px] lg:py-[120px]"
      >
        <div className="max-w-[900px] mx-auto">
          <h2
            className="text-center text-[#1A1A1A] mb-2"
            style={{ fontFamily: cormorant, fontSize: 'clamp(36px, 4vw, 44px)', fontWeight: 400 }}
          >
            How Naseeb works
          </h2>
          <p className="text-[15px] text-[#9B9B9B] text-center mt-2 mb-16">
            A guided process designed around Islamic values — not swipe culture
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="bg-white border border-[#EDE8E3] rounded-[20px] p-8"
              >
                <div className="w-10 h-10 bg-[#F5E6F2] rounded-xl flex items-center justify-center mb-4 flex-shrink-0 p-2">
                  {step.icon}
                </div>
                <p className="text-[11px] uppercase tracking-[0.1em] text-[#AF4D98] font-medium">{step.num}</p>
                <h3 className="text-[18px] font-medium text-[#1A1A1A] mt-2 mb-3">{step.title}</h3>
                <p className="text-[14px] text-[#5C5C5C] leading-[1.7]">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY NASEEB IS DIFFERENT ───────────────────────────────────────── */}
      <section
        data-testid="landing-differentiators"
        style={{ background: 'linear-gradient(135deg, #F5E6F2, #F4E4BA)' }}
        className="px-6 py-[80px] lg:py-[120px]"
      >
        <div className="max-w-[900px] mx-auto">
          <h2
            className="text-[#1A1A1A] text-center mb-12"
            style={{ fontFamily: cormorant, fontSize: 'clamp(36px, 4vw, 44px)', fontWeight: 400 }}
          >
            Built differently
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {DIFFS.map((d) => (
              <div key={d.title} className="bg-white rounded-[16px] p-7">
                <div className="mb-3">{d.icon}</div>
                <h3 className="text-[16px] font-medium text-[#1A1A1A] mb-2">{d.title}</h3>
                <p className="text-[14px] text-[#5C5C5C] leading-[1.7]">{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IT IS FOR ─────────────────────────────────────────────────── */}
      <section
        data-testid="landing-who-its-for"
        className="bg-white px-6 py-[80px] lg:py-[120px]"
      >
        <div className="max-w-[700px] mx-auto">
          <h2
            className="text-[#1A1A1A] text-center mb-12"
            style={{ fontFamily: cormorant, fontSize: 'clamp(36px, 4vw, 44px)', fontWeight: 400 }}
          >
            Who Naseeb is for
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Brothers */}
            <div>
              <p style={{ fontFamily: arabic, fontSize: '28px', color: '#AF4D98', marginBottom: '12px' }}>الإخوة</p>
              <div className="mb-4">
                <h3 className="text-[18px] font-medium text-[#1A1A1A]">Brothers</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Muslim men serious about marriage',
                  'Ready to lead with love and responsibility',
                  'Looking for a partner in deen, not just a partner',
                  'Willing to engage respectfully with a wali',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] text-[#5C5C5C]">
                    <span className="text-[#AF4D98] mt-0.5 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sisters */}
            <div>
              <p style={{ fontFamily: arabic, fontSize: '28px', color: '#AF4D98', marginBottom: '12px' }}>الأخوات</p>
              <div className="mb-4">
                <h3 className="text-[18px] font-medium text-[#1A1A1A]">Sisters</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Muslim women seeking a righteous spouse',
                  'Want their wali involved with dignity',
                  'Value privacy and modesty in the search',
                  'Ready for a serious, purposeful process',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] text-[#5C5C5C]">
                    <span className="text-[#AF4D98] mt-0.5 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-[14px] italic text-[#9B9B9B] text-center mt-10">
            &ldquo;Naseeb is not for casual browsing, cultural formality without faith, or anyone not ready
            for the responsibility of marriage.&rdquo;
          </p>
        </div>
      </section>

      {/* ── THE WALI SYSTEM ───────────────────────────────────────────────── */}
      <section
        data-testid="landing-wali-system"
        className="bg-[#FDF8F3] px-6 py-[80px] lg:py-[120px]"
      >
        <div className="max-w-[700px] mx-auto">
          <h2
            className="text-[#1A1A1A] text-center mb-2"
            style={{ fontFamily: cormorant, fontSize: 'clamp(36px, 4vw, 44px)', fontWeight: 400 }}
          >
            The wali system
          </h2>
          <p className="text-[15px] text-[#9B9B9B] text-center mb-10">Explained simply</p>

          <div className="border border-[rgba(175,77,152,0.15)] rounded-[20px] p-10 bg-white">
            <p className="text-[15px] text-[#5C5C5C] leading-[1.8] mb-8">
              In Islam, a wali (guardian) plays an important role in a woman&apos;s marriage. At Naseeb,
              the wali is a respected observer — not a gatekeeper.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-[12px] uppercase tracking-[0.08em] font-medium text-[#1A1A1A] mb-4">
                  Your wali can
                </p>
                <ul className="space-y-2.5">
                  {['View your matches', 'Read your conversations', 'See meeting details', 'Be notified of key moments in your journey'].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[14px] text-[#5C5C5C]">
                      <span className="text-[#00A699] font-medium flex-shrink-0 mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[12px] uppercase tracking-[0.08em] font-medium text-[#1A1A1A] mb-4">
                  Your wali cannot
                </p>
                <ul className="space-y-2.5">
                  {['Accept or decline on your behalf', 'Send messages', 'Block your progress', 'Control your profile'].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[14px] text-[#9B9B9B]">
                      <span className="text-[#9B9B9B] font-medium flex-shrink-0 mt-0.5">✗</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-[14px] italic text-[#9B9B9B] mt-8 pt-6 border-t border-[#EDE8E3]">
              The sister drives her own process. The wali is present with wisdom, not control.
            </p>
          </div>
        </div>
      </section>

      {/* ── PRIVACY & PHOTOS ──────────────────────────────────────────────── */}
      <section
        data-testid="landing-privacy"
        className="bg-white px-6 py-[80px] lg:py-[120px]"
      >
        <div className="max-w-[700px] mx-auto">
          <h2
            className="text-[#1A1A1A] text-center mb-12"
            style={{ fontFamily: cormorant, fontSize: 'clamp(36px, 4vw, 44px)', fontWeight: 400 }}
          >
            Your privacy, protected
          </h2>

          <div className="space-y-6">
            {[
              {
                icon: (
                  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <circle cx="16" cy="14" r="5" stroke="#AF4D98" strokeWidth="1.5" />
                    <path d="M6 26c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="#AF4D98" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M23 8l3-3M23 3h3v3" stroke="#AF4D98" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: 'Photos are private by default',
                body: 'Sisters never appear in a photo gallery. Photos are stored privately and only released to a specific brother when the sister chooses to accept his interest. If the connection closes, photo access is immediately revoked.',
              },
              {
                icon: (
                  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <rect x="6" y="14" width="20" height="14" rx="3" stroke="#AF4D98" strokeWidth="1.5" />
                    <path d="M10 14v-4a6 6 0 0112 0v4" stroke="#AF4D98" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="16" cy="21" r="2" fill="#AF4D98" />
                  </svg>
                ),
                title: 'No personal contact details shared',
                body: 'Phone numbers, email addresses, and social media handles are never exchanged through the platform. Virtual meetings are hosted in-app. The entire process stays within Naseeb until you are both ready.',
              },
              {
                icon: (
                  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M16 4L6 8v9c0 6 4.5 11.5 10 13 5.5-1.5 10-7 10-13V8L16 4z" stroke="#AF4D98" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M11 16l4 4 6-7" stroke="#AF4D98" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: 'Your data is yours',
                body: 'You can delete your profile and all associated data at any time. We do not sell your data, share it with third parties, or use it for advertising.',
              },
            ].map((block) => (
              <div key={block.title} className="flex items-start gap-5">
                <div className="w-[52px] h-[52px] flex-shrink-0 bg-[#F5E6F2] rounded-xl flex items-center justify-center p-3">
                  {block.icon}
                </div>
                <div>
                  <h3 className="text-[15px] font-medium text-[#1A1A1A] mb-1.5">{block.title}</h3>
                  <p className="text-[14px] text-[#5C5C5C] leading-[1.7]">{block.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQS ──────────────────────────────────────────────────────────── */}
      <section
        data-testid="landing-faqs"
        className="bg-[#FDF8F3] px-6 py-[80px] lg:py-[120px]"
      >
        <div className="max-w-[700px] mx-auto">
          <h2
            className="text-[#1A1A1A] text-center mb-10"
            style={{ fontFamily: cormorant, fontSize: 'clamp(36px, 4vw, 44px)', fontWeight: 400 }}
          >
            Common questions
          </h2>

          <div className="bg-white rounded-[20px] border border-[#EDE8E3] overflow-hidden">
            {FAQS.map((faq, i) => (
              <div key={i} className={i < FAQS.length - 1 ? 'border-b border-[#EDE8E3]' : ''}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-[15px] font-medium text-[#1A1A1A] pr-4">{faq.q}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`w-5 h-5 text-[#9B9B9B] flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                  >
                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-[14px] text-[#5C5C5C] leading-[1.7]">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DONATION ──────────────────────────────────────────────────────── */}
      <section style={{ background: 'white', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <p style={{ fontFamily: arabic, fontSize: '24px', color: '#AF4D98', marginBottom: '8px' }}>
            وَمَا تُنفِقُوا مِن خَيْرٍ فَلِأَنفُسِكُمْ
          </p>
          <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#9B9B9B', marginBottom: '32px' }}>
            &ldquo;Whatever good you spend is for yourselves&rdquo; — Al-Baqarah 2:272
          </p>

          <h2 style={{ fontFamily: cormorant, fontSize: '36px', fontWeight: 400, color: '#1A1A1A', marginBottom: '16px' }}>
            Naseeb is free, forever
          </h2>

          <p style={{ fontSize: '16px', color: '#5C5C5C', lineHeight: 1.8, marginBottom: '32px' }}>
            Naseeb is free for everyone — always. No subscriptions, no credits, no hidden fees.
            <br /><br />
            If this platform helps you find your match, consider making a donation to help keep it
            running for others who are still seeking theirs. Every contribution goes directly
            toward maintaining and growing Naseeb.
          </p>

          <div style={{ background: 'linear-gradient(135deg, #F5E6F2, #F4E4BA)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#AF4D98', marginBottom: '8px' }}>
              Why donate?
            </p>
            <p style={{ fontSize: '14px', color: '#5C5C5C', lineHeight: 1.7 }}>
              Facilitating a marriage is one of the greatest acts of sadaqah. The Prophet ﷺ
              said: &ldquo;There is no foundation that Allah loves more than marriage.&rdquo; Contributing
              to Naseeb is contributing to that.
            </p>
          </div>

          <p style={{ fontSize: '13px', color: '#9B9B9B', fontStyle: 'italic' }}>
            Donation details coming soon. Jazakallah khair for your support.
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section
        data-testid="landing-cta"
        style={{ background: 'linear-gradient(135deg, #AF4D98, #D66BA0)' }}
        className="px-6 py-[100px] text-white text-center"
      >
        <div className="max-w-[600px] mx-auto">
          <p
            className="mb-6 opacity-90"
            style={{ fontFamily: arabic, fontSize: '28px', lineHeight: 1.8 }}
          >
            بَارَكَ اللَّهُ لَكُمَا
          </p>

          <h2
            className="text-white mb-4"
            style={{
              fontFamily: cormorant,
              fontSize: 'clamp(32px, 6vw, 44px)',
              fontWeight: 300,
              lineHeight: 1.15,
            }}
          >
            Begin your search the right way
          </h2>

          <p className="text-[16px] text-white opacity-80 mt-4 mb-10">
            Halal. Intentional. Built around your deen.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center text-[15px] font-medium text-[#AF4D98] bg-white rounded-full px-8 py-4 hover:opacity-90 transition-opacity"
            >
              Begin my profile →
            </Link>
            <button
              onClick={scrollToHowItWorks}
              className="w-full sm:w-auto inline-flex items-center justify-center text-[15px] text-white border border-[rgba(255,255,255,0.4)] rounded-full px-8 py-4 hover:border-white transition-colors"
            >
              Learn more about how it works
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer
        data-testid="landing-footer"
        className="bg-[#1A1A1A] px-6 py-12"
      >
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 pb-10 border-b border-[#2C2C2C]">
            {/* Column 1 */}
            <div>
              <NasibLogo size="sm" theme="dark" />
              <p className="text-[13px] text-[#6B6B6B] mt-3 leading-[1.7]">
                Seek with sincerity.
              </p>
            </div>

            {/* Column 2 */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-4">Links</p>
              <nav className="space-y-2.5">
                <button
                  onClick={scrollToHowItWorks}
                  className="block text-[13px] text-[#9B9B9B] hover:text-white transition-colors text-left"
                >
                  How it works
                </button>
                <Link href="/auth/signup" className="block text-[13px] text-[#9B9B9B] hover:text-white transition-colors">Sign up</Link>
                <Link href="/auth/login" className="block text-[13px] text-[#9B9B9B] hover:text-white transition-colors">Sign in</Link>
                <Link href="/privacy" className="block text-[13px] text-[#9B9B9B] hover:text-white transition-colors">Privacy policy</Link>
                <Link href="/terms" className="block text-[13px] text-[#9B9B9B] hover:text-white transition-colors">Terms of service</Link>
              </nav>
            </div>

            {/* Column 3 */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-4">Questions?</p>
              <p className="text-[13px] text-[#9B9B9B]">
                hello@naseeb.app
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 gap-2">
            <p className="text-[12px] text-[#6B6B6B]">© 2026 Naseeb. All rights reserved.</p>
            <p className="text-[11px] text-[#4A4A4A]">Ad-free. Always.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
