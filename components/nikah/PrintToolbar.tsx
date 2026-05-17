'use client'

export default function PrintToolbar() {
  return (
    <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
      <button
        onClick={() => window.print()}
        style={{ background: '#AF4D98', color: 'white', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}
      >
        Print / Save as PDF
      </button>
      <button
        onClick={() => window.close()}
        style={{ background: 'white', color: '#5C5C5C', border: '1px solid #EDE8E3', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}
      >
        Close
      </button>
    </div>
  )
}
