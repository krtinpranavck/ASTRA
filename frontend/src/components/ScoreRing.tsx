import { useEffect, useRef } from 'react'

interface Props {
  score: number
  size?: number
  animate?: boolean
}

export function scoreColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'Good'
  if (score >= 60) return 'Needs Work'
  return 'Critical'
}

export default function ScoreRing({ score, size = 140, animate = true }: Props) {
  const circleRef = useRef<SVGCircleElement>(null)
  const strokeWidth = size * 0.065
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const color = scoreColor(score)
  const cx = size / 2
  const cy = size / 2

  useEffect(() => {
    const el = circleRef.current
    if (!el || !animate) {
      if (el) el.style.strokeDashoffset = String(circumference * (1 - score / 100))
      return
    }
    // Start at 0 fill, animate to score
    el.style.strokeDashoffset = String(circumference)
    el.style.transition = 'none'
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(0.16, 1, 0.3, 1)'
        el.style.strokeDashoffset = String(circumference * (1 - score / 100))
      })
    })
    return () => cancelAnimationFrame(raf)
  }, [score, circumference, animate])

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`Accessibility score: ${score} out of 100`}>
      {/* Background track */}
      <circle
        cx={cx} cy={cy} r={radius}
        fill="none"
        stroke="#27272a"
        strokeWidth={strokeWidth}
      />
      {/* Score arc */}
      <circle
        ref={circleRef}
        cx={cx} cy={cy} r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      {/* Score number */}
      <text
        x={cx} y={cy - size * 0.06}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize={size * 0.235}
        fontWeight="700"
        fontFamily="-apple-system, BlinkMacSystemFont, system-ui, sans-serif"
      >
        {score}
      </text>
      {/* /100 label */}
      <text
        x={cx} y={cy + size * 0.175}
        textAnchor="middle"
        fill="#52525b"
        fontSize={size * 0.095}
        fontFamily="-apple-system, BlinkMacSystemFont, system-ui, sans-serif"
      >
        / 100
      </text>
    </svg>
  )
}
