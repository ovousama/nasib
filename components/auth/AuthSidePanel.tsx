export default function AuthSidePanel({ headline }: { headline: string }) {
  return (
    <div
      className="hidden lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-16 lg:min-h-screen"
      style={{ background: 'linear-gradient(160deg, #AF4D98, #D66BA0)' }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
        <span style={{ fontFamily: 'var(--font-arabic, "Noto Naskh Arabic", serif)', fontSize: '26px', color: '#fff', fontWeight: 500, lineHeight: 1 }}>
          نصيب
        </span>
        <span style={{ fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)', fontSize: '9px', color: 'rgba(255,255,255,0.7)', fontWeight: 200, letterSpacing: '0.3em', textTransform: 'uppercase' as const, lineHeight: 1 }}>
          Naseeb
        </span>
      </div>

      {/* Center content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontFamily: 'var(--font-arabic, "Noto Naskh Arabic", serif)', fontSize: '26px', color: '#fff', lineHeight: 1.6, marginBottom: '12px' }}>
          وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا
        </p>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', marginBottom: '6px', lineHeight: 1.5 }}>
          &ldquo;And of His signs is that He created for you mates from among yourselves&rdquo;
        </p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>— Ar-Rum 30:21</p>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', marginTop: '32px', lineHeight: 1.7 }}>
          {headline}
        </p>
      </div>

      {/* Footer */}
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', position: 'relative', zIndex: 1 }}>
        Seek with sincerity · نصيب
      </p>

    </div>
  )
}
