export default function SettingsPage() {
  const planned = [
    'Email and notification preferences',
    'Password and authentication',
    'Privacy and visibility controls',
    'Pause or close your account',
  ]

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
            Settings
          </h1>
          <p style={{ fontSize: '15px', color: '#9B9B9B', lineHeight: 1.6, margin: 0 }}>
            Account preferences and privacy controls will live here.
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.85)',
          border: '1px solid rgba(175,77,152,0.12)',
          borderRadius: '16px',
          padding: '32px 24px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #F5E6F2, #F4E4BA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#AF4D98" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>

          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '22px', fontWeight: 400, color: '#1A1A1A',
            margin: '0 0 10px',
          }}>
            Coming soon, in sha Allah
          </h2>

          <p style={{
            fontSize: '14px', color: '#5C5C5C', lineHeight: 1.7,
            maxWidth: '440px', margin: '0 auto 20px',
          }}>
            We are working on detailed account settings. In the meantime, you can update your profile from the Profile page or reach out via Contact Us for anything urgent.
          </p>

          <div style={{
            textAlign: 'left',
            background: 'rgba(245,230,242,0.4)',
            borderRadius: '12px',
            padding: '18px 20px',
            marginTop: '24px',
          }}>
            <p style={{
              fontSize: '11px', fontWeight: 600, color: '#9B7090',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              margin: '0 0 12px',
            }}>
              What is coming
            </p>
            {planned.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px',
              }}>
                <span style={{ color: '#AF4D98', fontSize: '14px', lineHeight: 1 }}>·</span>
                <p style={{ fontSize: '13px', color: '#5C5C5C', lineHeight: 1.5, margin: 0 }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
