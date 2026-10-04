import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, ArrowRight, ChartBar } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import type { ScanHistoryEntry, Issue } from '../types'
import ScoreRing from '../components/ScoreRing'
import SeverityBadge from '../components/SeverityBadge'

function humanizeRuleId(id: string): string {
  return id
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

type Filter = 'all' | 'high' | 'medium' | 'low'

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')

  const report: ScanHistoryEntry | null =
    (location.state as { report?: ScanHistoryEntry } | null)?.report ??
    (() => {
      try {
        return JSON.parse(sessionStorage.getItem('astra-last-report') ?? 'null')
      } catch {
        return null
      }
    })()

  if (!report) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', gap: 16 }}>
        <ChartBar size={40} color="#27272a" />
        <p style={{ color: '#52525b', fontSize: 14 }}>No scan results found.</p>
        <button
          onClick={() => navigate('/scan')}
          style={{ background: '#22d3ee', color: '#09090b', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          Run a Scan
        </button>
      </div>
    )
  }

  const filtered: Issue[] =
    filter === 'all' ? report.issues : report.issues.filter((i) => i.severity === filter)

  const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
  const sorted = [...filtered].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  const scannedAt = report.date
    ? new Date(report.date).toLocaleString()
    : 'Just now'

  return (
    <div style={{ padding: '36px 44px', maxWidth: 900, minHeight: '100dvh' }}>
      {/* Back + header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#52525b', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 20 }}
        >
          <ArrowLeft size={13} /> Back
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', letterSpacing: '-0.02em', margin: 0 }}>
              {report.project_name}
            </h1>
            <p style={{ color: '#52525b', fontSize: 12, marginTop: 4 }}>Scanned {scannedAt}</p>
          </div>
          <button
            onClick={() => navigate('/scan')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: '#71717a',
              background: '#111115',
              border: '1px solid #27272a',
              borderRadius: 8,
              padding: '7px 13px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Plus size={12} /> New Scan
          </button>
        </div>
      </motion.div>

      {/* Score + severity summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 24,
          background: '#111115',
          border: '1px solid #1e1e24',
          borderRadius: 14,
          padding: '28px 32px',
          marginTop: 24,
          alignItems: 'center',
        }}
      >
        <ScoreRing score={report.score} size={148} />

        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#52525b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18 }}>
            Issue Breakdown
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SeverityRow
              label="High severity"
              count={report.severity_summary.high}
              total={report.total_issues}
              color="#ef4444"
              barBg="rgba(239,68,68,0.15)"
            />
            <SeverityRow
              label="Medium severity"
              count={report.severity_summary.medium}
              total={report.total_issues}
              color="#f59e0b"
              barBg="rgba(245,158,11,0.15)"
            />
            <SeverityRow
              label="Low severity"
              count={report.severity_summary.low}
              total={report.total_issues}
              color="#84cc16"
              barBg="rgba(132,204,22,0.15)"
            />
          </div>
          <p style={{ fontSize: 12, color: '#3f3f46', marginTop: 18 }}>
            {report.total_issues} total issue{report.total_issues !== 1 ? 's' : ''} detected
          </p>
        </div>
      </motion.div>

      {/* Issue list */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginTop: 32 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e4e4e7', margin: 0 }}>Issues</h2>
          <div style={{ display: 'flex', gap: 4, background: '#111115', border: '1px solid #1e1e24', borderRadius: 8, padding: 3 }}>
            {(['all', 'high', 'medium', 'low'] as Filter[]).map((f) => {
              const count =
                f === 'all'
                  ? report.total_issues
                  : f === 'high'
                  ? report.severity_summary.high
                  : f === 'medium'
                  ? report.severity_summary.medium
                  : report.severity_summary.low
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 11px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.12s, color 0.12s',
                    background: filter === f ? '#1e1e28' : 'transparent',
                    color: filter === f ? '#f4f4f5' : '#52525b',
                    textTransform: 'capitalize',
                  }}
                >
                  {f}
                  <span
                    style={{
                      fontSize: 10,
                      background: filter === f ? '#2a2a36' : '#1a1a1f',
                      color: filter === f ? '#a1a1aa' : '#3f3f46',
                      borderRadius: 99,
                      padding: '0px 5px',
                    }}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {sorted.length === 0 ? (
          <div
            style={{
              background: '#111115',
              border: '1px solid #1e1e24',
              borderRadius: 12,
              padding: '40px 24px',
              textAlign: 'center',
              color: '#3f3f46',
              fontSize: 13,
            }}
          >
            No {filter === 'all' ? '' : filter + ' '}issues found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sorted.map((issue, idx) => (
              <IssueRow
                key={idx}
                issue={issue}
                index={report.issues.indexOf(issue)}
                onClick={() =>
                  navigate(`/results/issue/${report.issues.indexOf(issue)}`, {
                    state: { issue, report },
                  })
                }
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function SeverityRow({
  label, count, total, color, barBg,
}: {
  label: string; count: number; total: number; color: string; barBg: string
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 12, color: '#71717a', width: 110, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: '#1e1e24', borderRadius: 99, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: '100%', background: barBg, borderRadius: 99, position: 'relative' }}
        >
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 2, background: color, borderRadius: 99 }} />
        </motion.div>
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color, width: 20, textAlign: 'right', flexShrink: 0 }}>{count}</span>
    </div>
  )
}

function WcagBadge({ level }: { level: string }) {
  const isAA = level === 'AA'
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        fontFamily: 'ui-monospace, monospace',
        color: isAA ? '#a78bfa' : '#22d3ee',
        background: isAA ? 'rgba(167,139,250,0.1)' : 'rgba(34,211,238,0.1)',
        border: `1px solid ${isAA ? 'rgba(167,139,250,0.25)' : 'rgba(34,211,238,0.25)'}`,
        borderRadius: 4,
        padding: '1px 5px',
        flexShrink: 0,
      }}
    >
      {level}
    </span>
  )
}

function IssueRow({ issue, onClick }: { issue: Issue; index: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: '#111115',
        border: '1px solid #1e1e24',
        borderRadius: 10,
        padding: '13px 16px',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'border-color 0.12s, background 0.12s',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a36'
        ;(e.currentTarget as HTMLButtonElement).style.background = '#13131a'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#1e1e24'
        ;(e.currentTarget as HTMLButtonElement).style.background = '#111115'
      }}
    >
      <SeverityBadge severity={issue.severity} size="sm" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#e4e4e7' }}>
            {humanizeRuleId(issue.rule_id)}
          </span>
          {issue.wcag_level && <WcagBadge level={issue.wcag_level} />}
          <span style={{ fontSize: 11, color: '#3f3f46' }}>SC {issue.wcag_ref}</span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#52525b',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {issue.message}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span
          style={{
            fontSize: 11,
            fontFamily: 'ui-monospace, monospace',
            color: '#3f3f46',
            background: '#1a1a1f',
            border: '1px solid #272730',
            padding: '2px 7px',
            borderRadius: 5,
          }}
        >
          Line {issue.line}
        </span>
        <ArrowRight size={13} color="#3f3f46" />
      </div>
    </button>
  )
}
