export default function PrivacyPage() {
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
            Privacy & data
          </h1>
          <p style={{ fontSize: '15px', color: '#9B9B9B', lineHeight: 1.6, margin: 0 }}>
            Your data belongs to you.
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.85)',
          border: '1px solid rgba(175,77,152,0.12)',
          borderRadius: '16px',
          padding: '40px 32px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(175,77,152,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#AF4D98" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '22px', fontWeight: 400, color: '#1A1A1A',
            margin: '0 0 12px',
          }}>
            Coming soon
          </h2>
          <p style={{ fontSize: '14px', color: '#5C5C5C', lineHeight: 1.7, margin: 0, maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
            We take your privacy seriously. A full privacy &amp; data page — including how to download or delete your data — is coming soon, in sha Allah.
          </p>
        </div>
      </div>
    </div>
  )
}
