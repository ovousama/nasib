export default function ResourcesPage() {
  const planned = [
    'Questions to ask during the talking phase',
    'Understanding the wali process',
    'Discussing finances and household responsibilities',
    'Setting healthy expectations for marriage',
    'The sunnah of choosing a spouse',
    'Common pitfalls in Muslim courtship',
    'Building a home rooted in taqwa',
  ]

  return (
    <div style={{
      background: 'linear-gradient(160deg, #F5E6F2 0%, #F4E4BA 60%, #FDF8F3 100%)',
      minHeight: '100vh',
      paddingTop: '76px',
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 20px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ fontFamily: 'Noto Naskh Arabic, serif', fontSize: '24px', color: '#AF4D98', marginBottom: '12px' }}>
            نَصِيحَة
          </p>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '32px', fontWeight: 400, color: '#1A1A1A',
            marginBottom: '8px', letterSpacing: '-0.02em',
          }}>
            Resources
          </h1>
          <p style={{ fontSize: '15px', color: '#9B9B9B', lineHeight: 1.6, margin: 0 }}>
            Guidance, reflections, and articles on Islamic marriage and finding your nasib.
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
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
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
            We are preparing a thoughtful collection of articles, hadith, and guidance on Islamic marriage — including how to approach pre-marital conversations, the role of the wali, financial planning together, and building a home rooted in taqwa.
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
              What you can expect
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

          <p style={{
            fontSize: '13px', color: '#9B7090', marginTop: '20px',
            fontStyle: 'italic', marginBottom: 0,
          }}>
            We will notify you when new resources are published.
          </p>
        </div>
      </div>
    </div>
  )
}
