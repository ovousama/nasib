'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

type ChecklistItem = {
  item_key: string
  completed: boolean
  completed_at: string | null
  completed_by: string | null
}

type Props = {
  connectionId: string
  brotherName: string
  sisterName: string
  brotherId: string
  sisterId: string
  currentUserId: string
  currentUserFirstName: string
  otherUserFirstName: string
  initialChecklist: ChecklistItem[]
  imamRequestSubmitted: boolean
  imamRequestDate: string | null
}

// ─── Checklist data ───────────────────────────────────────────────────────────

const CHECKLIST_CATEGORIES = [
  {
    label: 'Families & People',
    items: [
      { key: 'families_introduced', label: 'Families have been introduced to each other' },
      { key: 'wali_consent',        label: 'Wali has given consent' },
      { key: 'witnesses_arranged',  label: 'Two Muslim witnesses have been arranged' },
      { key: 'imam_contacted',      label: 'An imam or officiant has been contacted' },
    ],
  },
  {
    label: 'Agreement & Finances',
    items: [
      { key: 'mahr_agreed',              label: 'Mahr amount has been agreed upon' },
      { key: 'mahr_timeline',            label: 'Mahr payment timeline has been discussed' },
      { key: 'nikah_contract_reviewed',  label: 'Nikah contract has been reviewed by both parties' },
      { key: 'civil_marriage_checked',   label: 'Civil marriage requirements checked for your country' },
    ],
  },
  {
    label: 'Planning',
    items: [
      { key: 'living_arrangements', label: 'Living arrangements after nikah have been discussed' },
      { key: 'walima_discussed',     label: 'Walima plans have been discussed' },
      { key: 'pre_nikah_questions',  label: 'All important pre-nikah questions have been discussed' },
      { key: 'families_approved',    label: 'Both families are in agreement' },
    ],
  },
]

const ALL_KEYS = CHECKLIST_CATEGORIES.flatMap(c => c.items.map(i => i.key))

function buildChecklistMap(items: ChecklistItem[]): Record<string, ChecklistItem> {
  const base: Record<string, ChecklistItem> = {}
  for (const key of ALL_KEYS) {
    base[key] = { item_key: key, completed: false, completed_at: null, completed_by: null }
  }
  for (const item of items) {
    base[item.item_key] = item
  }
  return base
}

// ─── Pre-nikah questions ──────────────────────────────────────────────────────

const QUESTIONS = [
  {
    q: 'What are the financial arrangements?',
    a: 'Discuss who will manage finances, joint or separate accounts, budgeting approach, and any financial obligations each party has to their family. Transparency here prevents misunderstandings later.',
  },
  {
    q: 'Where will you live after nikah?',
    a: 'Discuss the city, the type of home, whether with family initially, and the long-term plan. Moving cities or countries is a significant discussion to have before nikah.',
  },
  {
    q: 'What role will each family play?',
    a: 'Boundaries with in-laws, frequency of visits, family obligations, and how decisions will be made as a new family unit.',
  },
  {
    q: 'What is the timeline for children?',
    a: 'How soon, how many, schooling preferences, parenting styles, and what happens if children are not possible.',
  },
  {
    q: 'How will household responsibilities be shared?',
    a: 'Who manages what at home, expectations around cooking, cleaning, and daily routines. No assumption is too small to discuss.',
  },
  {
    q: 'What does Islamic practice look like in the home?',
    a: 'Prayer times, Quran, Islamic education for children, halal standards, how you observe Ramadan, and how you handle differences in opinion.',
  },
  {
    q: 'What are your career plans and ambitions?',
    a: 'Will both work? What happens when children arrive? How do you support each other\'s goals while building a home together?',
  },
  {
    q: 'How do you handle conflict?',
    a: 'Discuss your communication styles, what happens during disagreements, and agree on a process for resolving disputes before they arise — including involving a third party if needed.',
  },
]

// ─── Section: Celebration Header ─────────────────────────────────────────────

function CelebrationHeader({ brotherName, sisterName }: { brotherName: string; sisterName: string }) {
  const brotherFirst = brotherName.split(' ')[0]
  const sisterFirst = sisterName.split(' ')[0]
  return (
    <div
      className="rounded-[20px] p-10 text-center mb-8"
      style={{ background: 'linear-gradient(135deg, #F5E6F2 0%, #F4E4BA 100%)' }}
      data-testid="celebration-header"
    >
      <p
        className="mb-1 leading-loose"
        style={{ fontFamily: 'var(--font-arabic)', fontSize: 32, color: '#AF4D98', direction: 'rtl' }}
      >
        بَارَكَ اللَّهُ لَكُمَا
      </p>
      <p className="text-sm italic text-[#9B9B9B] mb-4">May Allah bless you both</p>
      <div className="w-16 h-px bg-[#D4CBC4] mx-auto mb-4" />
      <p
        className="text-2xl text-[#AF4D98] mb-1"
        style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500 }}
      >
        {brotherFirst} &amp; {sisterFirst}
      </p>
      <p className="section-label tracking-[0.12em] text-[#9B9B9B] mb-6">
        Nikah Planning — نصيب
      </p>
      <div
        className="rounded-xl px-5 py-4 text-center mx-auto max-w-sm"
        style={{ border: '1px solid rgba(175,77,152,0.2)', background: 'white' }}
      >
        <p
          className="mb-2 leading-loose"
          style={{ fontFamily: 'var(--font-arabic)', fontSize: 17, color: '#5C5C5C', direction: 'rtl' }}
        >
          اللَّهُمَّ بَارِكْ لَهُمَا وَبَارِكْ عَلَيْهِمَا وَاجْمَعْ بَيْنَهُمَا فِي خَيْرٍ
        </p>
        <p className="text-xs italic text-[#5C5C5C] mb-1">
          &ldquo;O Allah, bless them, and shower blessings upon them, and join them together in goodness.&rdquo;
        </p>
        <p className="text-[11px] text-[#9B9B9B]">— Du&apos;a at Nikah</p>
      </div>
    </div>
  )
}

// ─── Section: Checklist ───────────────────────────────────────────────────────

function ChecklistSection({
  checklistMap,
  toggling,
  onToggle,
  brotherId,
  brotherName,
  sisterName,
}: {
  checklistMap: Record<string, ChecklistItem>
  toggling: string | null
  onToggle: (key: string, current: boolean) => void
  brotherId: string
  brotherName: string
  sisterName: string
}) {
  const total = ALL_KEYS.length
  const done = ALL_KEYS.filter(k => checklistMap[k]?.completed).length
  const pct = Math.round((done / total) * 100)

  function checkerName(by: string | null) {
    if (!by) return null
    if (by === brotherId) return brotherName.split(' ')[0]
    return sisterName.split(' ')[0]
  }

  return (
    <section data-testid="nikah-checklist" className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-medium text-[#1A1A1A]">Pre-Nikah Checklist</h2>
        <span className="text-sm font-medium text-[#AF4D98]">{done} of {total} completed</span>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 bg-[#EDE8E3] rounded-full mb-6 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: '#AF4D98' }}
        />
      </div>

      <div className="space-y-6">
        {CHECKLIST_CATEGORIES.map(cat => (
          <div key={cat.label}>
            <p className="section-label mb-3">{cat.label}</p>
            <div className="space-y-2">
              {cat.items.map(item => {
                const state = checklistMap[item.key]
                const checked = state?.completed ?? false
                const by = checkerName(state?.completed_by ?? null)
                const isToggling = toggling === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => onToggle(item.key, checked)}
                    disabled={isToggling}
                    data-testid={`checklist-item-${item.key}`}
                    className={`w-full text-left p-4 rounded-[16px] border transition-all duration-150 flex items-start gap-3 ${
                      checked
                        ? 'bg-[#F5E6F2] border-[#AF4D98]'
                        : 'bg-white border-[#EDE8E3] hover:border-[#D4CBC4]'
                    } ${isToggling ? 'opacity-60' : ''}`}
                  >
                    {/* Custom checkbox */}
                    <div className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      checked ? 'bg-[#AF4D98] border-[#AF4D98]' : 'border-[#D4CBC4] bg-white'
                    }`}>
                      {checked && (
                        <svg viewBox="0 0 10 8" fill="none" className="w-3 h-2.5">
                          <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[15px] leading-snug ${checked ? 'line-through text-[#9B9B9B]' : 'text-[#1A1A1A]'}`}>
                        {item.label}
                      </p>
                      {checked && by && (
                        <p className="text-[11px] text-[#9B9B9B] mt-0.5">Checked by {by}</p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Section: Questions Accordion ────────────────────────────────────────────

function QuestionsSection() {
  const [open, setOpen] = useState<number[]>([])
  const toggle = (i: number) =>
    setOpen(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])

  return (
    <section className="mb-8" data-testid="nikah-questions">
      <h2 className="text-base font-medium text-[#1A1A1A] mb-1">Questions to Discuss Before Nikah</h2>
      <p className="text-sm text-[#9B9B9B] mb-4">Work through these together before your nikah day</p>
      <div className="space-y-2">
        {QUESTIONS.map((item, i) => {
          const isOpen = open.includes(i)
          return (
            <div
              key={i}
              className={`bg-white rounded-xl border transition-colors overflow-hidden ${
                isOpen ? 'border-[#AF4D98]' : 'border-[#EDE8E3]'
              }`}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full text-left p-4 flex items-center justify-between gap-3"
              >
                <span className="text-[15px] font-medium text-[#1A1A1A]">{item.q}</span>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-4 h-4 flex-shrink-0 text-[#9B9B9B] transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                >
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
              {isOpen && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-[#5C5C5C] leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── Section: Nikah Contract ──────────────────────────────────────────────────

function ContractSection() {
  const cards = [
    {
      title: 'What Must Be Included',
      bullets: [
        'The mahr (dowry) amount and terms',
        'Consent of both parties freely given',
        'Presence of the wali for the bride',
        'Two adult Muslim witnesses',
        'The offer (ijab) and acceptance (qabul)',
      ],
    },
    {
      title: 'Optional Clauses You Can Add',
      bullets: [
        'The right of the wife to initiate divorce (isma)',
        'Conditions around relocation',
        'Agreements around the wife\'s career',
        'Conditions around a second marriage',
      ],
      note: 'These are legally binding within the Islamic contract.',
    },
    {
      title: 'Islamic vs Civil Marriage',
      text: 'An Islamic nikah is spiritually and religiously binding but may not be legally recognized in your country. Many couples complete both an Islamic nikah and a civil marriage registration. Check the requirements in your country.',
    },
  ]
  return (
    <section className="mb-8" data-testid="nikah-contract">
      <h2 className="text-base font-medium text-[#1A1A1A] mb-4">The Nikah Contract</h2>
      <div className="space-y-3">
        {cards.map(card => (
          <div key={card.title} className="bg-white border border-[#EDE8E3] rounded-[16px] p-5">
            <p className="text-sm font-medium text-[#1A1A1A] mb-3">{card.title}</p>
            {card.bullets && (
              <ul className="space-y-1.5">
                {card.bullets.map(b => (
                  <li key={b} className="flex items-start gap-2 text-sm text-[#5C5C5C]">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#AF4D98] flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
            {card.note && <p className="text-xs text-[#9B9B9B] mt-3 italic">{card.note}</p>}
            {card.text && <p className="text-sm text-[#5C5C5C] leading-relaxed">{card.text}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Section: Mahr ────────────────────────────────────────────────────────────

function MahrSection() {
  return (
    <section className="mb-8" data-testid="nikah-mahr">
      <h2 className="text-base font-medium text-[#1A1A1A] mb-4">Understanding the Mahr</h2>
      <div className="bg-white border border-[#EDE8E3] rounded-[16px] p-5 space-y-3 text-sm text-[#5C5C5C] leading-relaxed">
        <p>
          The mahr is a gift given by the husband to the wife as a right established by Allah. It is not a bride price or a transaction — it is an expression of honor and commitment.
        </p>
        <p>The mahr belongs entirely to the wife. It can be:</p>
        <ul className="space-y-1.5">
          {[
            'Prompt (muajjal) — paid at the time of nikah',
            'Deferred (muwajjal) — paid at an agreed later date',
            'A combination of both',
          ].map(b => (
            <li key={b} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#AF4D98] flex-shrink-0" />
              {b}
            </li>
          ))}
        </ul>
        <p className="italic text-[#9B9B9B]">
          &ldquo;And give the women their dowries as a gift.&rdquo; — An-Nisa 4:4
        </p>
        <p>
          The amount should be agreed upon with mutual respect. The Prophet ﷺ said the best mahr is the one that is easiest.
        </p>
      </div>
    </section>
  )
}

// ─── Section: Walima ──────────────────────────────────────────────────────────

function WalimaSection() {
  return (
    <section className="mb-8" data-testid="nikah-walima">
      <h2 className="text-base font-medium text-[#1A1A1A] mb-4">The Walima</h2>
      <div className="bg-white border border-[#EDE8E3] rounded-[16px] p-5 space-y-3 text-sm text-[#5C5C5C] leading-relaxed">
        <p>
          The walima is a celebratory meal hosted by the groom&apos;s family after the nikah. It is a sunnah of the Prophet ﷺ and an announcement of the marriage to the community.
        </p>
        <p>Key points:</p>
        <ul className="space-y-1.5">
          {[
            'Should be held within 7 days of the nikah',
            'Every Muslim invited is obligated to attend unless they have a valid excuse',
            'Keep it simple, halal, and free of extravagance',
            'It does not need to be expensive to be blessed',
          ].map(b => (
            <li key={b} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#AF4D98] flex-shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ─── Section: Du'as ───────────────────────────────────────────────────────────

function DuasSection() {
  const duas = [
    {
      arabic: 'بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
      transliteration: "Barakallahu laka wa baraka alayka wa jama'a baynakuma fi khayr",
      translation: 'May Allah bless you and shower blessings upon you and unite you both in goodness.',
      ref: 'Du\'a at Nikah',
    },
    {
      arabic: 'اللَّهُمَّ أَلِّفْ بَيْنَ قُلُوبِهِمَا',
      translation: 'O Allah, unite their hearts.',
    },
    {
      arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ',
      translation: 'Our Lord, grant us from our spouses and offspring comfort of our eyes.',
      ref: 'Al-Furqan 25:74',
    },
  ]
  return (
    <section className="mb-8" data-testid="nikah-duas">
      <h2 className="text-base font-medium text-[#1A1A1A] mb-4">Du&apos;as for Your Nikah</h2>
      <div className="space-y-3">
        {duas.map((d, i) => (
          <div
            key={i}
            className="rounded-[16px] p-5 text-center"
            style={{ background: 'linear-gradient(135deg, #F5E6F2, #FAF4EE)' }}
          >
            <p
              className="mb-2 leading-loose"
              style={{ fontFamily: 'var(--font-arabic)', fontSize: 20, color: '#AF4D98', direction: 'rtl' }}
            >
              {d.arabic}
            </p>
            {d.transliteration && (
              <p className="text-xs italic text-[#9B9B9B] mb-2">{d.transliteration}</p>
            )}
            <p className="text-[13px] text-[#5C5C5C]">{d.translation}</p>
            {d.ref && <p className="text-[11px] text-[#9B9B9B] mt-2">— {d.ref}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Section: Imam Contact Form ───────────────────────────────────────────────

function ImamSection({
  connectionId,
  currentUserId,
  imamSubmitted,
  imamDate,
  onSubmitted,
}: {
  connectionId: string
  currentUserId: string
  imamSubmitted: boolean
  imamDate: string | null
  onSubmitted: (date: string) => void
}) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputClass = 'w-full border border-[#EDE8E3] rounded-[10px] px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder-[#9B9B9B] focus:outline-none focus:border-[#AF4D98] transition-colors bg-white'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !location.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: dbErr } = await supabase.from('imam_contact_requests').insert({
      connection_id: connectionId,
      profile_id: currentUserId,
      full_name: name.trim(),
      location: location.trim(),
      preferred_contact_email: email.trim(),
      preferred_contact_phone: phone.trim() || null,
      message: message.trim(),
    })
    setLoading(false)
    if (dbErr) {
      setError('Something went wrong. Please try again.')
      return
    }
    onSubmitted(new Date().toISOString())
  }

  if (imamSubmitted) {
    return (
      <section className="mb-8" data-testid="imam-section">
        <h2 className="text-base font-medium text-[#1A1A1A] mb-1">Connect with an Imam</h2>
        <div className="bg-[#F5E6F2] border border-[#AF4D98]/20 rounded-[16px] p-5">
          <p className="text-sm font-medium text-[#AF4D98] mb-1">Request sent — we will be in touch soon</p>
          {imamDate && (
            <p className="text-xs text-[#9B9B9B]">
              Submitted on {new Date(imamDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-8" data-testid="imam-section">
      <h2 className="text-base font-medium text-[#1A1A1A] mb-1">Connect with an Imam</h2>
      <p className="text-sm text-[#9B9B9B] mb-4">We will help connect you with a local imam to officiate your nikah</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className={inputClass} type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
        <input className={inputClass} type="text" placeholder="Location — city and country" value={location} onChange={e => setLocation(e.target.value)} />
        <input className={inputClass} type="email" placeholder="Preferred contact email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className={inputClass} type="tel" placeholder="Preferred contact phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} />
        <textarea
          className={`${inputClass} resize-none`}
          rows={4}
          placeholder="Tell us a little about your situation — your location, preferred date, and any specific requirements for your nikah..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        {error && <p className="text-sm text-[#C13515]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#AF4D98] text-white font-medium py-3 text-sm hover:bg-[#9B3D85] disabled:opacity-40 transition-colors"
        >
          {loading ? 'Sending…' : 'Send Request'}
        </button>
      </form>
      <p className="text-xs text-[#9B9B9B] mt-3 text-center leading-relaxed">
        We review all requests personally and connect you with a trusted imam in your area. This is a free service.
      </p>
    </section>
  )
}

// ─── Section: Download ────────────────────────────────────────────────────────

function DownloadSection({ connectionId }: { connectionId: string }) {
  return (
    <section className="mb-8" data-testid="nikah-download">
      <h2 className="text-base font-medium text-[#1A1A1A] mb-1">Download Your Checklist</h2>
      <p className="text-sm text-[#9B9B9B] mb-4">Print or save your nikah checklist to share with your families.</p>
      <button
        onClick={() => window.open(`/dashboard/nikah/${connectionId}/print`, '_blank')}
        className="w-full border border-[#EDE8E3] text-[#5C5C5C] font-medium py-3 rounded-[12px] hover:bg-[#FAF4EE] transition-colors text-sm flex items-center justify-center gap-2"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.046.752.097 1.126.153A2.212 2.212 0 0118 8.653v4.097A2.25 2.25 0 0115.75 15h-.241l.305 1.984A1.75 1.75 0 0114.084 19H5.915a1.75 1.75 0 01-1.73-2.016L4.49 15H4.25A2.25 2.25 0 012 12.75V8.653c0-1.082.775-2.034 1.874-2.198.374-.056.75-.107 1.126-.153V2.75zm4.5 14.5h1l.321-2h-1.642l.321 2zm-4.049 0h1.572l-.321-2H5.377l.074.481A.25.25 0 005.7 17.25zm9.449-2h-1.323l-.321 2h1.572l.074-.481a.25.25 0 00-.002-.037L14.9 15.25zM6.5 4v8.25a.75.75 0 01-1.5 0v-3.5H4.25a.75.75 0 010-1.5H5V4h10v3.25h.75a.75.75 0 010 1.5H15v3.5a.75.75 0 01-1.5 0V4h-7z" clipRule="evenodd" />
        </svg>
        Download Checklist PDF
      </button>
    </section>
  )
}

// ─── Sticky Bottom Bar ────────────────────────────────────────────────────────

function BottomBar({
  connectionId,
  done,
  total,
  brotherFirst,
  sisterFirst,
}: {
  connectionId: string
  done: number
  total: number
  brotherFirst: string
  sisterFirst: string
}) {
  const [copied, setCopied] = useState(false)
  const handleShare = () => {
    const text = `Alhamdulillah! ${brotherFirst} and ${sisterFirst} are moving forward to nikah. May Allah bless their union. 🤍`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EDE8E3] px-4 py-3 flex items-center justify-between safe-area-pb z-30"
      data-testid="nikah-bottom-bar"
    >
      <Link
        href={`/dashboard/chat/${connectionId}`}
        className="text-sm text-[#9B9B9B] hover:text-[#5C5C5C] flex items-center gap-1"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
        </svg>
        Chat
      </Link>
      <span className="text-xs font-medium text-[#AF4D98]">{done} of {total} complete</span>
      <button onClick={handleShare} className="text-sm text-[#9B9B9B] hover:text-[#AF4D98] flex items-center gap-1">
        {copied ? (
          <span className="text-[#AF4D98] text-xs">Copied!</span>
        ) : (
          <>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.341l-6.733-3.367a2.5 2.5 0 110-3.475l6.733-3.366A2.52 2.52 0 0113 4.5z" />
            </svg>
            Share
          </>
        )}
      </button>
    </div>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function NikahPlanningClient({
  connectionId,
  brotherName,
  sisterName,
  brotherId,
  currentUserId,
  initialChecklist,
  imamRequestSubmitted,
  imamRequestDate,
}: Props) {
  const [checklistMap, setChecklistMap] = useState<Record<string, ChecklistItem>>(
    () => buildChecklistMap(initialChecklist)
  )
  const [toggling, setToggling] = useState<string | null>(null)
  const [imamSubmitted, setImamSubmitted] = useState(imamRequestSubmitted)
  const [imamDate, setImamDate] = useState(imamRequestDate)

  const refreshChecklist = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('nikah_checklist')
      .select('item_key, completed, completed_at, completed_by')
      .eq('connection_id', connectionId)
    if (data) setChecklistMap(buildChecklistMap(data))
  }, [connectionId])

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`nikah-${connectionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'nikah_checklist', filter: `connection_id=eq.${connectionId}` },
        () => { refreshChecklist() }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [connectionId, refreshChecklist])

  const handleToggle = async (itemKey: string, currentCompleted: boolean) => {
    setToggling(itemKey)
    const newCompleted = !currentCompleted
    // Optimistic update
    setChecklistMap(prev => ({
      ...prev,
      [itemKey]: {
        item_key: itemKey,
        completed: newCompleted,
        completed_by: newCompleted ? currentUserId : null,
        completed_at: newCompleted ? new Date().toISOString() : null,
      },
    }))
    const supabase = createClient()
    await supabase.from('nikah_checklist').upsert(
      {
        connection_id: connectionId,
        item_key: itemKey,
        completed: newCompleted,
        completed_by: newCompleted ? currentUserId : null,
        completed_at: newCompleted ? new Date().toISOString() : null,
      },
      { onConflict: 'connection_id,item_key' }
    )
    setToggling(null)
  }

  const done = ALL_KEYS.filter(k => checklistMap[k]?.completed).length

  return (
    <div className="min-h-screen bg-[#FDF8F3] pt-[72px] pb-24 lg:pt-[76px] lg:pb-8">
      <div className="max-w-[640px] mx-auto px-5 pt-4 pb-2 lg:max-w-[1100px] lg:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-[#9B9B9B] hover:text-[#5C5C5C] transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          Dashboard
        </Link>
      </div>

      <div className="max-w-[640px] mx-auto px-5 pt-4 lg:max-w-[1100px] lg:px-8 flex flex-col lg:flex-row lg:gap-8 lg:items-start">
        {/* Right column: celebration + content — first in DOM so it appears first on mobile */}
        <div className="lg:order-2 lg:flex-1 lg:min-w-0">
          <CelebrationHeader brotherName={brotherName} sisterName={sisterName} />
          <QuestionsSection />
          <ContractSection />
          <MahrSection />
          <WalimaSection />
          <DuasSection />
          <ImamSection
            connectionId={connectionId}
            currentUserId={currentUserId}
            imamSubmitted={imamSubmitted}
            imamDate={imamDate}
            onSubmitted={date => { setImamSubmitted(true); setImamDate(date) }}
          />
          <DownloadSection connectionId={connectionId} />
        </div>

        {/* Left column: checklist — second in DOM, appears left on desktop via lg:order-1 */}
        <div className="lg:order-1 lg:w-80 lg:flex-shrink-0 lg:sticky lg:top-24">
          <ChecklistSection
            checklistMap={checklistMap}
            toggling={toggling}
            onToggle={handleToggle}
            brotherId={brotherId}
            brotherName={brotherName}
            sisterName={sisterName}
          />
        </div>
      </div>

      <BottomBar
        connectionId={connectionId}
        done={done}
        total={ALL_KEYS.length}
        brotherFirst={brotherName.split(' ')[0]}
        sisterFirst={sisterName.split(' ')[0]}
      />
    </div>
  )
}
