'use client'

import { useRouter } from 'next/navigation'

export const PAGE_BG = 'linear-gradient(160deg, #F5E6F2 0%, #F4E4BA 60%, #FDF8F3 100%)'

// ─── Loading spinner ──────────────────────────────────────────────────────────

export function EditSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: PAGE_BG }}>
      <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ─── Page header ──────────────────────────────────────────────────────────────

export function EditPageHeader({ title }: { title: string }) {
  const router = useRouter()
  return (
    <div style={{ marginBottom: '28px' }}>
      <button
        type="button"
        onClick={() => router.back()}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'transparent', border: 'none',
          color: '#9B7090', fontSize: '13px', cursor: 'pointer',
          padding: 0, marginBottom: '12px',
        }}
      >
        ← Back to profile
      </button>
      <h1 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '26px', fontWeight: 400,
        color: '#1A1A1A', letterSpacing: '-0.01em', margin: 0,
      }}>
        {title}
      </h1>
    </div>
  )
}

// ─── Error alert ──────────────────────────────────────────────────────────────

export function ErrorAlert({ message }: { message: string }) {
  return (
    <div style={{
      background: '#FDECEA', border: '1px solid #F5C6C6',
      borderRadius: '10px', padding: '12px 14px', marginBottom: '16px',
    }}>
      <p style={{ fontSize: '13px', color: '#C13515', margin: 0 }}>{message}</p>
    </div>
  )
}

// ─── Pill (single-select) ─────────────────────────────────────────────────────

export function Pill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '8px 16px',
      borderRadius: '999px',
      border: selected ? '1.5px solid #AF4D98' : '1px solid #EDE8E3',
      background: selected ? 'rgba(175,77,152,0.08)' : 'white',
      color: selected ? '#AF4D98' : '#5C5C5C',
      fontSize: '13px',
      fontWeight: selected ? 500 : 400,
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    }}>
      {label}
    </button>
  )
}

// ─── Pill group ───────────────────────────────────────────────────────────────

export function PillGroup({ label, options, value, onChange, optional }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void; optional?: boolean
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1A1A1A', marginBottom: '10px' }}>
        {label}
        {optional && <span style={{ fontSize: '12px', color: '#9B9B9B', fontWeight: 400, marginLeft: '6px' }}>(optional)</span>}
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {options.map(o => <Pill key={o} label={o} selected={value === o} onClick={() => onChange(o)} />)}
      </div>
    </div>
  )
}

// ─── Yes / No toggle ─────────────────────────────────────────────────────────

export function YesNo({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1A1A1A', marginBottom: '10px' }}>
        {label}
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {([true, false] as const).map(v => (
          <button key={String(v)} type="button" onClick={() => onChange(v)} style={{
            padding: '12px',
            borderRadius: '12px',
            border: value === v ? '1.5px solid #AF4D98' : '1px solid #EDE8E3',
            background: value === v ? 'rgba(175,77,152,0.06)' : 'white',
            color: value === v ? '#AF4D98' : '#5C5C5C',
            fontSize: '14px', fontWeight: value === v ? 500 : 400,
            cursor: 'pointer', transition: 'all 0.15s ease',
          }}>
            {v ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Labeled textarea ─────────────────────────────────────────────────────────

export function TA({ label, value, onChange, placeholder, optional, rows }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; optional?: boolean; rows?: number;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1A1A1A', marginBottom: '10px' }}>
        {label}
        {optional && <span style={{ fontSize: '12px', color: '#9B9B9B', fontWeight: 400, marginLeft: '6px' }}>(optional)</span>}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows ?? 3}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '12px 14px',
          border: '1px solid #EDE8E3', borderRadius: '12px',
          fontSize: '14px', color: '#1A1A1A', background: 'white',
          outline: 'none', resize: 'vertical', minHeight: '100px',
          fontFamily: 'inherit', lineHeight: '1.6', boxSizing: 'border-box',
        }}
        onFocus={e => { e.currentTarget.style.border = '1.5px solid #AF4D98' }}
        onBlur={e => { e.currentTarget.style.border = '1px solid #EDE8E3' }}
      />
    </div>
  )
}

// ─── Styled dropdown ──────────────────────────────────────────────────────────

export function SimpleDropdown({ label, value, onChange, options, optional, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; optional?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1A1A1A', marginBottom: '10px' }}>
        {label}
        {optional && <span style={{ fontSize: '12px', color: '#9B9B9B', fontWeight: 400, marginLeft: '6px' }}>(optional)</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', padding: '12px 40px 12px 14px',
            border: '1px solid #EDE8E3', borderRadius: '12px',
            fontSize: '14px', color: value ? '#1A1A1A' : '#9B9B9B',
            background: 'white', cursor: 'pointer', outline: 'none',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            appearance: 'none' as any, WebkitAppearance: 'none' as any,
          }}
        >
          <option value="">{placeholder ?? 'Select...'}</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
          ))}
        </select>
        <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="2" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </div>
  )
}

// ─── Pill group (key-value, stores value not label) ──────────────────────────

export function PillGroupKV({ label, options, value, onChange, optional }: {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  optional?: boolean
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1A1A1A', marginBottom: '10px' }}>
        {label}
        {optional && <span style={{ fontSize: '12px', color: '#9B9B9B', fontWeight: 400, marginLeft: '6px' }}>(optional)</span>}
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {options.map(o => (
          <Pill key={o.value} label={o.label} selected={value === o.value} onClick={() => onChange(o.value)} />
        ))}
      </div>
    </div>
  )
}

// ─── Multi-select pill group (key-value, stores value array) ──────────────────

export function MultiPillGroupKV({ label, options, value, onChange, optional, max }: {
  label: string
  options: { value: string; label: string }[]
  value: string[]
  onChange: (v: string[]) => void
  optional?: boolean
  max?: number
}) {
  function toggle(v: string) {
    if (value.includes(v)) {
      onChange(value.filter(x => x !== v))
    } else if (!max || value.length < max) {
      onChange([...value, v])
    }
  }
  return (
    <div>
      <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1A1A1A', marginBottom: '10px' }}>
        {label}
        {optional && <span style={{ fontSize: '12px', color: '#9B9B9B', fontWeight: 400, marginLeft: '6px' }}>(optional)</span>}
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {options.map(o => (
          <Pill key={o.value} label={o.label} selected={value.includes(o.value)} onClick={() => toggle(o.value)} />
        ))}
      </div>
    </div>
  )
}

// ─── Radio card (Practicing / Moderately / Learning style) ───────────────────

export function RadioCard({ selected, label, sublabel, onClick }: {
  selected: boolean; label: string; sublabel?: string; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 16px', borderRadius: '12px',
        border: selected ? '1.5px solid #AF4D98' : '1px solid #EDE8E3',
        background: selected ? 'rgba(175,77,152,0.06)' : 'white',
        cursor: 'pointer', marginBottom: '8px',
        transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', gap: '12px',
      }}
    >
      <div style={{
        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
        border: selected ? 'none' : '1.5px solid #D4CBC4',
        background: selected ? '#AF4D98' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {selected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />}
      </div>
      <div>
        <p style={{ fontSize: '14px', fontWeight: selected ? 500 : 400, color: selected ? '#AF4D98' : '#1A1A1A', margin: sublabel ? '0 0 2px' : 0 }}>
          {label}
        </p>
        {sublabel && <p style={{ fontSize: '12px', color: '#9B9B9B', margin: 0 }}>{sublabel}</p>}
      </div>
    </div>
  )
}

// ─── Save + cancel ────────────────────────────────────────────────────────────

export function SaveButton({ saving }: { saving: boolean }) {
  const router = useRouter()
  return (
    <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(175,77,152,0.1)' }}>
      <button
        type="submit"
        disabled={saving}
        style={{
          width: '100%', padding: '14px',
          background: '#AF4D98', color: 'white',
          border: 'none', borderRadius: '999px',
          fontSize: '15px', fontWeight: 500,
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.7 : 1,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => {
          if (!saving) {
            e.currentTarget.style.background = '#9B3D88'
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(175,77,152,0.3)'
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#AF4D98'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {saving ? 'Saving...' : 'Save changes'}
      </button>
      <button
        type="button"
        onClick={() => router.back()}
        style={{
          width: '100%', background: 'transparent', border: 'none',
          color: '#9B9B9B', fontSize: '14px', cursor: 'pointer',
          padding: '12px', marginTop: '4px', textAlign: 'center',
        }}
      >
        Cancel
      </button>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export function EditToast({ toast }: { toast: 'success' | 'error' | null }) {
  if (!toast) return null
  return (
    <div style={{
      position: 'fixed', bottom: '80px', left: '16px', right: '16px',
      maxWidth: '560px', margin: '0 auto',
      borderRadius: '10px', padding: '12px 16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      fontSize: '14px', fontWeight: 500, textAlign: 'center',
      background: toast === 'success' ? '#AF4D98' : '#C13515',
      color: 'white',
    }}>
      {toast === 'success' ? 'Changes saved' : 'Something went wrong'}
    </div>
  )
}
