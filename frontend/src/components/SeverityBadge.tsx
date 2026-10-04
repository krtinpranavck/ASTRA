interface Props {
  severity: 'high' | 'medium' | 'low'
  size?: 'sm' | 'md' | 'lg'
}

const config = {
  high: {
    label: 'High',
    bg: 'rgba(239,68,68,0.1)',
    text: '#f87171',
    border: 'rgba(239,68,68,0.25)',
  },
  medium: {
    label: 'Medium',
    bg: 'rgba(245,158,11,0.1)',
    text: '#fbbf24',
    border: 'rgba(245,158,11,0.25)',
  },
  low: {
    label: 'Low',
    bg: 'rgba(132,204,22,0.1)',
    text: '#a3e635',
    border: 'rgba(132,204,22,0.25)',
  },
}

const sizes = {
  sm: { fontSize: 10, padding: '2px 8px', borderRadius: 99 },
  md: { fontSize: 11, padding: '3px 10px', borderRadius: 99 },
  lg: { fontSize: 12, padding: '4px 12px', borderRadius: 99 },
}

export default function SeverityBadge({ severity, size = 'sm' }: Props) {
  const c = config[severity]
  const s = sizes[size]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        fontFamily: 'ui-monospace, monospace',
        ...s,
      }}
    >
      {c.label}
    </span>
  )
}
