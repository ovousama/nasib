'use client'

type SliderProps = {
  value: number
  onChange: (value: number) => void
  leftLabel: string
  rightLabel: string
  centerLabel?: string
}

export default function Slider({ value, onChange, leftLabel, rightLabel, centerLabel }: SliderProps) {
  const pct = value
  return (
    <div style={{ width: '100%' }}>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: '#AF4D98',
          background: `linear-gradient(to right, #AF4D98 0%, #AF4D98 ${pct}%, #EDE8E3 ${pct}%, #EDE8E3 100%)`,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
        <span style={{ fontSize: '11px', color: '#9B9B9B', fontWeight: 500 }}>{leftLabel}</span>
        {centerLabel && <span style={{ fontSize: '11px', color: '#AF4D98', fontWeight: 500 }}>{centerLabel}</span>}
        <span style={{ fontSize: '11px', color: '#9B9B9B', fontWeight: 500 }}>{rightLabel}</span>
      </div>
      <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '12px', color: '#AF4D98', fontWeight: 500 }}>
        {value}%
      </div>
    </div>
  )
}
