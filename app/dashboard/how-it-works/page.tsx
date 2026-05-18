import Link from 'next/link'

const cormorant = "var(--font-cormorant, 'Cormorant Garamond', serif)"
const arabic = "var(--font-arabic, 'Noto Naskh Arabic', serif)"

const STEPS = [
  {
    num: '01',
    title: 'Build your profile',
    body: 'Complete every section honestly. Your deen, values, family vision, and character all feed into the matching process. Profiles that are incomplete will not receive matches.',
  },
  {
    num: '02',
    title: 'Receive curated matches',
    body: 'Once your profile is complete and verified, our team assigns up to 5 carefully matched profiles at a time. You are not browsing — you are receiving considered suggestions.',
  },
  {
    num: '03',
    title: 'Express or accept interest',
    body: 'Either party can express interest. If both are interested, or the receiving party accepts, a connection is created. Sisters share their photos only at the point of acceptance.',
  },
  {
    num: '04',
    title: 'Chat with purpose',
    body: 'A three-way chat opens with you, your match, and the sister\'s wali (read-only). Use the suggested questions to guide meaningful, purposeful conversation.',
  },
  {
    num: '05',
    title: 'Request a meeting',
    body: 'When both parties are ready, a meeting — virtual or in person — can be proposed in-app. No personal contact details are exchanged.',
  },
  {
    num: '06',
    title: 'Check in and move forward',
    body: 'After meeting, both parties complete a private check-in. If both want to proceed, Naseeb provides a nikah planning guide, checklist, and imam connection service.',
  },
]

const TIPS = [
  'Complete your profile fully before your matches are assigned',
  'Be honest — compatibility is only as good as the information you provide',
  'Involve your wali early — do not wait until you are interested in someone',
  'Approach each conversation with niyyah and respect',
  'Take your time — this is not a race',
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F3] pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-8">
        <Link href="/dashboard/profile" className="inline-flex items-center gap-1 text-[13px] text-[#9B9B9B] mb-6">
          ← Back
        </Link>

        <h1
          className="text-[#1A1A1A] mb-2"
          style={{ fontFamily: cormorant, fontSize: '32px', fontWeight: 400 }}
        >
          How Naseeb works
        </h1>
        <p className="text-[14px] text-[#9B9B9B]">
          A practical guide to the process
        </p>
      </div>

      {/* The process */}
      <section data-testid="hiw-process" className="px-4 mb-8">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[#9B9B9B] font-medium mb-4">
          The process
        </p>
        <div className="space-y-3">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="bg-white rounded-[16px] border border-[#EDE8E3] p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] uppercase tracking-[0.08em] text-[#AF4D98] font-medium">
                  {step.num}
                </span>
                <h3 className="text-[15px] font-medium text-[#1A1A1A]">{step.title}</h3>
              </div>
              <p className="text-[13px] text-[#5C5C5C] leading-[1.7]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The wali system */}
      <section data-testid="hiw-wali" className="px-4 mb-8">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[#9B9B9B] font-medium mb-4">
          The wali system
        </p>
        <div className="bg-white rounded-[16px] border border-[#EDE8E3] p-5 space-y-5">
          <p className="text-[14px] text-[#5C5C5C] leading-[1.8]">
            In Islam, a wali (guardian) plays an important role in a woman&apos;s marriage. At Naseeb,
            the wali is a respected observer — not a gatekeeper.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.06em] font-medium text-[#1A1A1A] mb-3">
                Can
              </p>
              <ul className="space-y-2">
                {['View matches', 'Read conversations', 'See meeting details', 'Receive notifications'].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] text-[#5C5C5C]">
                    <span className="text-[#00A699] flex-shrink-0 font-medium mt-px">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.06em] font-medium text-[#1A1A1A] mb-3">
                Cannot
              </p>
              <ul className="space-y-2">
                {['Accept or decline', 'Send messages', 'Block progress', 'Control profile'].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] text-[#9B9B9B]">
                    <span className="text-[#9B9B9B] flex-shrink-0 font-medium mt-px">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-[13px] italic text-[#9B9B9B] pt-2 border-t border-[#EDE8E3]">
            The sister drives her own process. The wali is present with wisdom, not control.
          </p>
        </div>
      </section>

      {/* Privacy and photos */}
      <section data-testid="hiw-privacy" className="px-4 mb-8">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[#9B9B9B] font-medium mb-4">
          Privacy &amp; photos
        </p>
        <div className="bg-white rounded-[16px] border border-[#EDE8E3] p-5 space-y-4">
          {[
            {
              title: 'Photos are private by default',
              body: "Sisters' photos are never shown in a gallery. They are only shared with a specific brother when the sister accepts his interest, and revoked if the connection closes.",
            },
            {
              title: 'No contact details exchanged',
              body: 'Phone numbers, email, and social handles are never shared via the platform. Meetings are arranged in-app.',
            },
            {
              title: 'Your data is yours',
              body: 'You can request account deletion at any time. All data — messages, photos, profile — is permanently removed.',
            },
          ].map((block) => (
            <div key={block.title} className="pb-4 border-b border-[#EDE8E3] last:border-0 last:pb-0">
              <p className="text-[14px] font-medium text-[#1A1A1A] mb-1">{block.title}</p>
              <p className="text-[13px] text-[#5C5C5C] leading-[1.7]">{block.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Match system */}
      <section data-testid="hiw-matches" className="px-4 mb-8">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[#9B9B9B] font-medium mb-4">
          The match system
        </p>
        <div className="bg-white rounded-[16px] border border-[#EDE8E3] p-5">
          <p className="text-[14px] text-[#5C5C5C] leading-[1.8] mb-4">
            Matches are curated manually by the Naseeb team. We do not use algorithms to suggest
            matches — every pairing is reviewed by a human who has read both profiles carefully.
          </p>
          <ul className="space-y-3">
            {[
              'Your profile must be 100% complete to receive matches',
              'You receive up to 5 matches at a time',
              'Matches are based on deen, values, lifestyle, location, and marriage vision',
              'You will not be matched with someone you already have a connection with',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[13px] text-[#5C5C5C]">
                <span className="text-[#AF4D98] flex-shrink-0 mt-0.5">—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tips */}
      <section data-testid="hiw-tips" className="px-4 mb-8">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[#9B9B9B] font-medium mb-4">
          Tips for a great experience
        </p>
        <div className="bg-white rounded-[16px] border border-[#EDE8E3] p-5 space-y-3">
          {TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 pb-3 border-b border-[#EDE8E3] last:border-0 last:pb-0">
              <span className="w-5 h-5 rounded-full bg-[#F5E6F2] text-[#AF4D98] text-[11px] font-medium flex items-center justify-center flex-shrink-0 mt-px">
                {i + 1}
              </span>
              <p className="text-[13px] text-[#5C5C5C] leading-[1.6]">{tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing du'a */}
      <div className="px-4 pb-4">
        <div className="bg-[#F5E6F2] rounded-[16px] p-6 text-center">
          <p
            className="text-[#AF4D98] mb-2"
            style={{ fontFamily: arabic, fontSize: '20px', lineHeight: 1.8 }}
          >
            اللَّهُمَّ يَسِّرْ وَلَا تُعَسِّرْ
          </p>
          <p className="text-[13px] italic text-[#9B9B9B]">
            &ldquo;O Allah, make it easy and do not make it difficult.&rdquo;
          </p>
        </div>
      </div>
    </div>
  )
}
