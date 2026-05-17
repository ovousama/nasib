'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMeetingRequest, confirmMeetingSlot } from '@/app/dashboard/actions'
import type { MeetingRequest, ConnectionDetail } from '@/lib/database'

type Props = {
  connection: ConnectionDetail
  initialMeetings: MeetingRequest[]
  currentUserId: string
}

function formatSlot(slot: string) {
  return new Date(slot).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatusBadge({ status }: { status: MeetingRequest['status'] }) {
  const map = {
    pending: 'bg-amber-50 text-amber-700 border-amber-100',
    confirmed: 'bg-[#F5E6F2] text-[#AF4D98] border-[#AF4D98]/20',
    cancelled: 'bg-[#FDF8F3] text-[#5C5C5C] border-[#EDE8E3]',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${map[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function MeetingsUI({ connection, initialMeetings, currentUserId }: Props) {
  const router = useRouter()
  const [meetings, setMeetings] = useState<MeetingRequest[]>(initialMeetings)
  const [showForm, setShowForm] = useState(false)
  const [format, setFormat] = useState<'virtual' | 'in_person'>('virtual')
  const [slot1, setSlot1] = useState('')
  const [slot2, setSlot2] = useState('')
  const [slot3, setSlot3] = useState('')
  const [locationOrLink, setLocationOrLink] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!slot1) { setError('Please provide at least one time slot.'); return }
    setSubmitting(true)
    setError(null)
    const result = await createMeetingRequest(
      connection.id,
      format,
      [slot1, slot2 || undefined, slot3 || undefined],
      locationOrLink || undefined,
    )
    setSubmitting(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setShowForm(false)
      setSlot1(''); setSlot2(''); setSlot3(''); setLocationOrLink('')
      router.refresh()
    }
  }

  const handleConfirm = async (meetingId: string, slot: string) => {
    setConfirmingId(meetingId)
    const result = await confirmMeetingSlot(meetingId, slot)
    setConfirmingId(null)
    if (result?.error) {
      setError(result.error)
    } else {
      setMeetings(prev =>
        prev.map(m =>
          m.id === meetingId
            ? { ...m, status: 'confirmed', confirmed_slot: slot, confirmed_at: new Date().toISOString() }
            : m,
        ),
      )
      router.refresh()
    }
  }

  const pendingMeetings = meetings.filter(m => m.status === 'pending')
  const pastMeetings = meetings.filter(m => m.status !== 'pending')

  return (
    <div className="px-4 py-5 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Request new meeting */}
      {!showForm ? (
        <button
          data-testid="request-meeting-btn"
          onClick={() => setShowForm(true)}
          className="w-full bg-[#AF4D98] text-white font-medium py-3 rounded-2xl hover:bg-[#9B3D85] transition-colors text-sm"
        >
          + Request a Meeting
        </button>
      ) : (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#EDE8E3] space-y-4">
          <h3 className="font-medium text-[#1A1A1A]">New Meeting Request</h3>

          {/* Format */}
          <div>
            <p className="text-xs text-[#5C5C5C] mb-2 font-medium">Format</p>
            <div className="grid grid-cols-2 gap-2">
              {(['virtual', 'in_person'] as const).map(f => (
                <button
                  key={f}
                  data-testid={f === 'virtual' ? 'format-virtual' : 'format-in-person'}
                  onClick={() => setFormat(f)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    format === f
                      ? 'bg-[#AF4D98] text-white border-[#AF4D98]'
                      : 'text-[#5C5C5C] border-[#EDE8E3] hover:border-[#AF4D98]'
                  }`}
                >
                  {f === 'virtual' ? 'Virtual' : 'In Person'}
                </button>
              ))}
            </div>
          </div>

          {/* Slots */}
          <div className="space-y-3">
            <p className="text-xs text-[#5C5C5C] font-medium">Proposed times (up to 3)</p>
            {[
              { label: 'Time slot 1 *', value: slot1, set: setSlot1 },
              { label: 'Time slot 2', value: slot2, set: setSlot2 },
              { label: 'Time slot 3', value: slot3, set: setSlot3 },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className="text-xs text-[#5C5C5C] mb-1 block">{label}</label>
                <input
                  type="datetime-local"
                  value={value}
                  onChange={e => set(e.target.value)}
                  className="w-full border border-[#EDE8E3] rounded-xl px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#AF4D98]"
                />
              </div>
            ))}
          </div>

          {/* Location / link */}
          <div>
            <label className="text-xs text-[#5C5C5C] mb-1 block">
              {format === 'virtual' ? 'Meeting link (optional)' : 'Location (optional)'}
            </label>
            <input
              type="text"
              value={locationOrLink}
              onChange={e => setLocationOrLink(e.target.value)}
              placeholder={format === 'virtual' ? 'e.g. Zoom link' : 'e.g. Local café name'}
              className="w-full border border-[#EDE8E3] rounded-xl px-3 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#9B9B9B] focus:outline-none focus:ring-2 focus:ring-[#AF4D98]"
            />
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-[#AF4D98] text-white font-medium py-2.5 rounded-xl hover:bg-[#9B3D85] disabled:opacity-50 transition-colors text-sm"
            >
              {submitting ? 'Sending…' : 'Send Request'}
            </button>
            <button
              onClick={() => { setShowForm(false); setError(null) }}
              className="w-full text-[#5C5C5C] text-sm py-2 hover:text-[#1A1A1A] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Pending meetings */}
      {pendingMeetings.length > 0 && (
        <div>
          <h3 className="font-medium text-[#1A1A1A] mb-3">Awaiting Response</h3>
          <div className="space-y-3">
            {pendingMeetings.map(meeting => {
              const isRequester = meeting.requested_by === currentUserId
              const slots = [meeting.slot_1, meeting.slot_2, meeting.slot_3].filter(Boolean) as string[]
              return (
                <div key={meeting.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#EDE8E3]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#1A1A1A] capitalize">
                      {meeting.format === 'in_person' ? 'In Person' : 'Virtual'}
                    </span>
                    <StatusBadge status={meeting.status} />
                  </div>
                  <div className="space-y-2">
                    {slots.map((slot, i) => (
                      <div key={slot} className="flex items-center justify-between gap-3">
                        <p className="text-sm text-[#1A1A1A]">{formatSlot(slot)}</p>
                        {!isRequester && (
                          <button
                            onClick={() => handleConfirm(meeting.id, slot)}
                            disabled={confirmingId === meeting.id}
                            className="text-xs font-medium text-[#AF4D98] border border-[#AF4D98] px-3 py-1 rounded-full hover:bg-[#F5E6F2] transition-colors disabled:opacity-50"
                          >
                            {confirmingId === meeting.id ? '…' : `Confirm slot ${i + 1}`}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {isRequester && (
                    <p className="text-xs text-[#9B9B9B] mt-3">
                      Waiting for {connection.other_first_name} to confirm a time.
                    </p>
                  )}
                  {meeting.location_or_link && (
                    <p className="text-xs text-[#5C5C5C] mt-2 truncate">
                      {meeting.format === 'virtual' ? 'Link: ' : 'Location: '}
                      {meeting.location_or_link}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Past meetings */}
      {pastMeetings.length > 0 && (
        <div>
          <h3 className="font-medium text-[#1A1A1A] mb-3">Past Meetings</h3>
          <div className="space-y-3">
            {pastMeetings.map(meeting => (
              <div key={meeting.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#EDE8E3]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#1A1A1A] capitalize">
                    {meeting.format === 'in_person' ? 'In Person' : 'Virtual'}
                  </span>
                  <StatusBadge status={meeting.status} />
                </div>
                {meeting.confirmed_slot && (
                  <p className="text-sm text-[#1A1A1A]">{formatSlot(meeting.confirmed_slot)}</p>
                )}
                {meeting.location_or_link && (
                  <p className="text-xs text-[#5C5C5C] mt-1 truncate">
                    {meeting.location_or_link}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {meetings.length === 0 && !showForm && (
        <div className="bg-[#FDF8F3] rounded-2xl p-6 text-center border border-dashed border-[#EDE8E3]">
          <p className="text-[#5C5C5C] text-sm">
            No meetings yet. Request a time to connect with {connection.other_first_name}.
          </p>
        </div>
      )}
    </div>
  )
}
