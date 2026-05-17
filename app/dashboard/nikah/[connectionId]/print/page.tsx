import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import PrintToolbar from '@/components/nikah/PrintToolbar'

type Props = { params: Promise<{ connectionId: string }> }

const CHECKLIST_ITEMS = [
  { key: 'families_introduced',    label: 'Families have been introduced to each other',          cat: 'Families & People' },
  { key: 'wali_consent',           label: 'Wali has given consent',                               cat: 'Families & People' },
  { key: 'witnesses_arranged',     label: 'Two Muslim witnesses have been arranged',               cat: 'Families & People' },
  { key: 'imam_contacted',         label: 'An imam or officiant has been contacted',               cat: 'Families & People' },
  { key: 'mahr_agreed',            label: 'Mahr amount has been agreed upon',                     cat: 'Agreement & Finances' },
  { key: 'mahr_timeline',          label: 'Mahr payment timeline has been discussed',             cat: 'Agreement & Finances' },
  { key: 'nikah_contract_reviewed',label: 'Nikah contract has been reviewed by both parties',     cat: 'Agreement & Finances' },
  { key: 'civil_marriage_checked', label: 'Civil marriage requirements checked for your country', cat: 'Agreement & Finances' },
  { key: 'living_arrangements',    label: 'Living arrangements after nikah have been discussed',  cat: 'Planning' },
  { key: 'walima_discussed',       label: 'Walima plans have been discussed',                     cat: 'Planning' },
  { key: 'pre_nikah_questions',    label: 'All important pre-nikah questions have been discussed',cat: 'Planning' },
  { key: 'families_approved',      label: 'Both families are in agreement',                       cat: 'Planning' },
]
const CATS = ['Families & People', 'Agreement & Finances', 'Planning']

export default async function NikahPrintPage({ params }: Props) {
  const { connectionId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: conn } = await supabase
    .from('connections')
    .select('id, brother_id, sister_id')
    .eq('id', connectionId)
    .single()

  if (!conn) redirect('/dashboard')
  if (conn.brother_id !== user.id && conn.sister_id !== user.id) redirect('/dashboard')

  const [{ data: brotherProfile }, { data: sisterProfile }, { data: checklist }] = await Promise.all([
    supabase.from('brother_profiles').select('full_name').eq('id', conn.brother_id).single(),
    supabase.from('sister_profiles').select('full_name').eq('id', conn.sister_id).single(),
    supabase.from('nikah_checklist').select('item_key, completed').eq('connection_id', connectionId),
  ])

  const brotherFirst = (brotherProfile?.full_name ?? 'Brother').split(' ')[0]
  const sisterFirst  = (sisterProfile?.full_name  ?? 'Sister').split(' ')[0]
  const completedKeys = new Set((checklist ?? []).filter(i => i.completed).map(i => i.item_key))
  const doneCount = completedKeys.size
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500&display=swap');
        body { background: white !important; }
        .print-page { font-family: 'Inter', sans-serif; color: #1A1A1A; background: white; max-width: 680px; margin: 0 auto; padding: 48px 40px; min-height: 100vh; }
        .print-logo { font-size: 20px; font-weight: 500; color: #AF4D98; letter-spacing: -0.02em; margin-bottom: 32px; }
        .print-logo-sub { font-size: 14px; color: #9B9B9B; margin-left: 8px; }
        .print-title { font-size: 26px; font-weight: 500; letter-spacing: -0.02em; margin-bottom: 4px; }
        .print-names { font-size: 18px; color: #AF4D98; margin-bottom: 4px; }
        .print-date { font-size: 13px; color: #9B9B9B; margin-bottom: 8px; }
        .print-progress { font-size: 13px; color: #5C5C5C; margin-bottom: 32px; }
        .print-cat { font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #9B9B9B; margin: 28px 0 12px; }
        .print-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F0EBE5; }
        .print-checkbox { width: 18px; height: 18px; min-width: 18px; border-radius: 50%; border: 2px solid; margin-top: 2px; display: flex; align-items: center; justify-content: center; font-size: 10px; }
        .print-checkbox-done { background: #AF4D98; border-color: #AF4D98; color: white; }
        .print-checkbox-undone { border-color: #D4CBC4; }
        .print-label { font-size: 14px; line-height: 1.4; }
        .print-label-done { color: #9B9B9B; text-decoration: line-through; }
        .print-dua { margin-top: 48px; border: 1px solid #EDE8E3; border-radius: 12px; padding: 24px; text-align: center; background: #FAF4EE; }
        .print-dua-arabic { font-family: 'Noto Naskh Arabic', serif; font-size: 20px; color: #AF4D98; direction: rtl; line-height: 2; margin-bottom: 8px; }
        .print-dua-trans { font-size: 13px; color: #5C5C5C; font-style: italic; margin-bottom: 4px; }
        .print-dua-ref { font-size: 11px; color: #9B9B9B; }
        .print-footer { margin-top: 32px; font-size: 11px; color: #9B9B9B; text-align: center; }
        @media print {
          .print-page { padding: 0; }
        }
      `}</style>

      <div className="print-page">
        <PrintToolbar />

        <p className="print-logo">
          Naseeb <span className="print-logo-sub">نصيب</span>
        </p>
        <h1 className="print-title">Nikah Planning Checklist</h1>
        <p className="print-names">{brotherFirst} &amp; {sisterFirst}</p>
        <p className="print-date">Generated {dateStr}</p>
        <p className="print-progress">{doneCount} of {CHECKLIST_ITEMS.length} items completed</p>

        {CATS.map(cat => (
          <div key={cat}>
            <p className="print-cat">{cat}</p>
            {CHECKLIST_ITEMS.filter(i => i.cat === cat).map((item, idx, arr) => {
              const done = completedKeys.has(item.key)
              const isLast = idx === arr.length - 1
              return (
                <div key={item.key} className="print-item" style={isLast ? { borderBottom: 'none' } : undefined}>
                  <div className={`print-checkbox ${done ? 'print-checkbox-done' : 'print-checkbox-undone'}`}>
                    {done && '✓'}
                  </div>
                  <span className={`print-label ${done ? 'print-label-done' : ''}`}>{item.label}</span>
                </div>
              )
            })}
          </div>
        ))}

        <div className="print-dua">
          <p className="print-dua-arabic">
            بَارَكَ اللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
          </p>
          <p className="print-dua-trans">
            &ldquo;May Allah bless you both and join you together in goodness.&rdquo;
          </p>
          <p className="print-dua-ref">— Du&apos;a at Nikah · Abu Dawud &amp; Tirmidhi</p>
        </div>

        <p className="print-footer">Generated by Naseeb — نصيب &nbsp;·&nbsp; {dateStr}</p>
      </div>
    </>
  )
}
