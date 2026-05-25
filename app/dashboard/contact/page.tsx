'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'technical', label: 'Technical' },
  { value: 'account', label: 'Account' },
  { value: 'feedback', label: 'Feedback' },
]

export default function ContactPage() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState('general')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!subject.trim() || !message.trim()) {
      setError('Please complete both fields.')
      return
    }

    setSending(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Session expired. Please sign in again.')
        setSending(false)
        return
      }

      const { error: insertError } = await supabase
        .from('support_messages')
        .insert({
          user_id: user.id,
          category,
          subject: subject.trim(),
          message: message.trim(),
          status: 'open',
        })

      if (insertError) throw insertError

      setSent(true)
      setSubject('')
      setMessage('')
      setCategory('general')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not send message.'
      setError(msg)
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(160deg, #F5E6F2 0%, #F4E4BA 60%, #FDF8F3 100%)',
      minHeight: '100vh',
      paddingTop: '76px',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 20px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '32px', fontWeight: 400, color: '#1A1A1A',
            margin: '0 0 8px', letterSpacing: '-0.02em',
          }}>
            Contact us
          </h1>
          <p style={{ fontSize: '15px', color: '#9B9B9B', lineHeight: 1.6, margin: 0 }}>
            We are here to help. Send us a message and we will respond within 24 hours, in sha Allah.
          </p>
        </div>

        {sent ? (
          <div style={{
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(175,77,152,0.12)',
            borderRadius: '16px',
            padding: '40px 32px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: '#E6F7F5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A8A7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '22px', fontWeight: 400, color: '#1A1A1A',
              margin: '0 0 8px',
            }}>
              Message sent
            </h2>
            <p style={{ fontSize: '14px', color: '#5C5C5C', lineHeight: 1.6, margin: '0 0 24px' }}>
              Jazakallah khair for reaching out. We will respond to your message within 24 hours.
            </p>
            <button
              onClick={() => setSent(false)}
              style={{
                background: 'transparent',
                border: '1px solid #AF4D98',
                color: '#AF4D98',
                borderRadius: '999px',
                padding: '10px 20px',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              Send another message
            </button>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(175,77,152,0.12)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: 500,
                color: '#1A1A1A', marginBottom: '8px',
              }}>
                What is this about?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {CATEGORIES.map(opt => {
                  const active = category === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setCategory(opt.value)}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: active ? '1.5px solid #AF4D98' : '1px solid #EDE8E3',
                        background: active ? 'rgba(175,77,152,0.08)' : 'white',
                        color: active ? '#AF4D98' : '#5C5C5C',
                        fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: 500,
                color: '#1A1A1A', marginBottom: '8px',
              }}>
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Briefly describe your issue"
                maxLength={120}
                style={{
                  width: '100%', padding: '12px 14px',
                  border: '1px solid #EDE8E3', borderRadius: '10px',
                  fontSize: '14px', color: '#1A1A1A',
                  background: 'white', outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: 500,
                color: '#1A1A1A', marginBottom: '8px',
              }}>
                Message
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Provide as much detail as you can"
                rows={6}
                maxLength={2000}
                style={{
                  width: '100%', padding: '12px 14px',
                  border: '1px solid #EDE8E3', borderRadius: '10px',
                  fontSize: '14px', color: '#1A1A1A',
                  background: 'white', outline: 'none',
                  resize: 'vertical', fontFamily: 'inherit',
                }}
              />
            </div>

            {error && (
              <div style={{
                background: '#FDECEA',
                border: '1px solid #F5C6C6',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '16px',
              }}>
                <p style={{ fontSize: '13px', color: '#C13515', margin: 0 }}>{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={sending}
              style={{
                width: '100%',
                background: '#AF4D98',
                color: 'white',
                border: 'none',
                borderRadius: '999px',
                padding: '14px',
                fontSize: '14px', fontWeight: 500,
                cursor: sending ? 'not-allowed' : 'pointer',
                opacity: sending ? 0.7 : 1,
                transition: 'all 0.15s ease',
              }}
            >
              {sending ? 'Sending...' : 'Send message'}
            </button>

            <p style={{
              fontSize: '12px', color: '#9B9B9B',
              textAlign: 'center', marginTop: '16px',
              lineHeight: 1.5, marginBottom: 0,
            }}>
              You can also reach us directly at{' '}
              <a href="mailto:hello@mynaseeb.com" style={{ color: '#AF4D98', textDecoration: 'none', fontWeight: 500 }}>
                hello@mynaseeb.com
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
