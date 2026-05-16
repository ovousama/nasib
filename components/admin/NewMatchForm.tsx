'use client'

import { useState, useMemo } from 'react'
import { adminAssignMatch } from '@/app/admin/actions'

type Person = { id: string; full_name: string }

type Props = {
  brothers: Person[]
  sisters: Person[]
  defaultBrotherId?: string
  defaultSisterId?: string
}

function SearchSelect({
  label,
  people,
  value,
  onChange,
}: {
  label: string
  people: Person[]
  value: string
  onChange: (id: string) => void
}) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(
    () => people.filter(p => p.full_name.toLowerCase().includes(search.toLowerCase())),
    [people, search],
  )

  const selected = people.find(p => p.id === value)

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">{label}</label>
      <div
        className="border border-[#EDE8E3] rounded-[10px] px-3 py-2.5 cursor-pointer flex items-center justify-between hover:border-[#AF4D98] transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className={selected ? 'text-sm text-[#1A1A1A]' : 'text-sm text-[#9B9B9B]'}>
          {selected ? selected.full_name : `Select ${label}…`}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#9B9B9B] flex-shrink-0">
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
        </svg>
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-[#EDE8E3] rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="p-2 border-b border-[#EDE8E3]">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full text-sm px-2 py-1.5 outline-none"
              onClick={e => e.stopPropagation()}
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-[#9B9B9B]">No results</li>
            )}
            {filtered.map(p => (
              <li
                key={p.id}
                onClick={() => { onChange(p.id); setOpen(false); setSearch('') }}
                className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-[#F9F0F6] hover:text-[#AF4D98] transition-colors ${p.id === value ? 'text-[#AF4D98] font-medium' : 'text-[#1A1A1A]'}`}
              >
                {p.full_name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function NewMatchForm({ brothers, sisters, defaultBrotherId = '', defaultSisterId = '' }: Props) {
  const [brotherId, setBrotherId] = useState(defaultBrotherId)
  const [sisterId, setSisterId] = useState(defaultSisterId)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!brotherId || !sisterId) { setError('Please select both a brother and a sister.'); return }
    setSubmitting(true)
    setError(null)
    const result = await adminAssignMatch(brotherId, sisterId, note)
    setSubmitting(false)
    if (result?.error) setError(result.error)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#EDE8E3] max-w-lg space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[10px] p-3 text-sm text-red-700">{error}</div>
      )}

      <SearchSelect label="Brother" people={brothers} value={brotherId} onChange={setBrotherId} />
      <SearchSelect label="Sister" people={sisters} value={sisterId} onChange={setSisterId} />

      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
          Compatibility Note <span className="text-[#9B9B9B] font-normal">(optional)</span>
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={4}
          placeholder="Why this pair is a good match…"
          className="w-full border border-[#EDE8E3] rounded-[10px] px-3 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#9B9B9B] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-[#AF4D98] text-white font-medium py-2 hover:bg-[#9B3D85] disabled:opacity-50 transition-colors text-sm"
      >
        {submitting ? 'Assigning…' : 'Assign Match'}
      </button>
    </form>
  )
}
