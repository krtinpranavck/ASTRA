import { useNavigate } from 'react-router-dom'
import {
  Code,
  Globe,
  ArrowRight,
  Image,
  TextT,
  ListNumbers,
  Keyboard,
  Tag,
  ArrowsIn,
} from '@phosphor-icons/react'
import { motion } from 'motion/react'
import type { ScanHistoryEntry } from '../types'
import ScoreRing, { scoreColor, scoreLabel } from '../components/ScoreRing'

const checks = [
  {
    icon: Image,
    label: 'Missing Alt Text',
    desc: 'Images without descriptive text for screen readers',
    wcag: '1.1.1',
  },
  {
    icon: TextT,
    label: 'Unlabeled Forms',
    desc: 'Inputs and controls missing associated labels',
    wcag: '1.3.1',
  },
  {
    icon: ListNumbers,
    label: 'Heading Order',
    desc: 'Skipped heading levels break document structure',
    wcag: '1.3.1',
  },
  {
    icon: Keyboard,
    label: 'Keyboard Access',
    desc: 'Interactive elements unreachable by keyboard',
    wcag: '2.1.1',
  },
  {
    icon: Tag,
    label: 'Semantic HTML',
    desc: 'Non-semantic elements used for structural roles',
    wcag: '4.1.2',
  },
  {
    icon: ArrowsIn,
    label: 'ARIA Attributes',
    desc: 'Missing or incorrect ARIA roles and labels',
    wcag: '4.1.2',
  },
]

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
})

export default function Home() {
  const navigate = useNavigate()
  const history: ScanHistoryEntry[] = JSON.parse(localStorage.getItem('astra-history') || '[]')

  return (
    <div style={{ padding: '40px 44px', maxWidth: 960, minHeight: '100dvh' }}>
      {/* Hero */}
      <motion.div {...fade(0)}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#f4f4f5',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          Catch accessibility issues
          <br />
          <span style={{ color: '#22d3ee' }}>before they ship.</span>
        </h1>
        <p
          style={{
            marginTop: 12,
            color: '#71717a',
            fontSize: 14,
            lineHeight: 1.6,
            maxWidth: 480,
          }}
        >
          ASTRA scans React and JSX source code for WCAG 2.2 violations using AST-level static analysis. Upload code, get an accessibility score and a list of issues with fixes.
        </p>
      </motion.div>

      {/* Action cards */}
      <motion.div
        {...fade(0.08)}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 32, maxWidth: 600 }}
      >
        <ActionCard
          icon={<Code size={20} color="#22d3ee" />}
          title="Upload React Code"
          desc="Paste or drop a JSX / TSX source file"
          onClick={() => navigate('/scan', { state: { mode: 'code' } })}
        />
        <ActionCard
          icon={<Globe size={20} color="#22d3ee" />}
          title="Analyze Website"
          desc="Enter a URL to scan a live webpage"
          onClick={() => navigate('/scan', { state: { mode: 'url' } })}
        />
      </motion.div>

      {/* What ASTRA checks */}
      <motion.div {...fade(0.14)} style={{ marginTop: 44 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#52525b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
          What gets analyzed
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {checks.map(({ icon: Icon, label, desc, wcag }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                background: '#111115',
                border: '1px solid #1e1e24',
                borderRadius: 10,
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: 'rgba(34,211,238,0.07)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={16} color="#22d3ee" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>{label}</span>
                  <span
                    style={{
                      fontSize: 9,
                      fontFamily: 'ui-monospace, monospace',
                      color: '#3f3f46',
                      background: '#1a1a1f',
                      border: '1px solid #2a2a30',
                      padding: '1px 5px',
                      borderRadius: 4,
                    }}
                  >
                    {wcag}
                  </span>
                </div>
                <p style={{ fontSize: 11.5, color: '#52525b', marginTop: 3, lineHeight: 1.5, margin: '3px 0 0' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent scans */}
      {history.length > 0 && (
        <motion.div {...fade(0.2)} style={{ marginTop: 44 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#52525b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Recent Scans
            </p>
            <button
              onClick={() => navigate('/history')}
              style={{ fontSize: 12, color: '#52525b', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 600 }}>
            {history.slice(0, 4).map((entry) => (
              <div
                key={entry.id}
                style={{
                  background: '#111115',
                  border: '1px solid #1e1e24',
                  borderRadius: 10,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <ScoreRing score={entry.score} size={56} animate={false} />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#e4e4e7',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {entry.project_name}
                  </div>
                  <div style={{ fontSize: 11, color: scoreColor(entry.score), marginTop: 2 }}>{scoreLabel(entry.score)}</div>
                  <div style={{ fontSize: 11, color: '#3f3f46', marginTop: 1 }}>
                    {entry.total_issues} issue{entry.total_issues !== 1 ? 's' : ''} &middot; {new Date(entry.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function ActionCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 0,
        background: '#111115',
        border: '1px solid #1e1e24',
        borderRadius: 12,
        padding: '18px 20px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.15s, background 0.15s',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.borderColor = 'rgba(34,211,238,0.3)'
        el.style.background = '#13131a'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.borderColor = '#1e1e24'
        el.style.background = '#111115'
      }}
      onMouseDown={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.985)')}
      onMouseUp={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}
    >
      <div
        style={{
          width: 36,
          height: 36,
          background: 'rgba(34,211,238,0.08)',
          borderRadius: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>{title}</div>
      <div style={{ fontSize: 12, color: '#52525b', marginTop: 4 }}>{desc}</div>
      <ArrowRight
        size={13}
        color="#3f3f46"
        style={{ position: 'absolute', bottom: 18, right: 18 }}
      />
    </button>
  )
}
