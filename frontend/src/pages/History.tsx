import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClockCounterClockwise, Trash, ArrowRight, CircleNotch } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import type { ScanHistoryEntry } from '../types'
import SeverityBadge from '../components/SeverityBadge'
import { scoreColor } from '../components/ScoreRing'
import { getHistory, deleteHistory, deleteHistoryEntry } from '../api/scan'

export default function History() {
  const navigate = useNavigate()
  const [history, setHistory] = useState<ScanHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getHistory()
      .then(setHistory)
      .catch(() => setError('Could not load history. Make sure the backend is running.'))
      .finally(() => setLoading(false))
  }, [])

  const clearAll = async () => {
    await deleteHistory()
    setHistory([])
  }

  const removeEntry = async (id: string) => {
    await deleteHistoryEntry(id)
    setHistory((h) => h.filter((e) => e.id !== id))
  }

  return (
    <div style={{ padding: '40px 44px', maxWidth: 900, minHeight: '100dvh' }}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', letterSpacing: '-0.02em', margin: 0 }}>
              Scan History
            </h1>
            <p style={{ color: '#52525b', fontSize: 13, marginTop: 5 }}>
              {loading ? 'Loading…' : `${history.length} scan${history.length !== 1 ? 's' : ''} saved`}
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearAll}
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
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#f87171')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#71717a')}
            >
              <Trash size={13} />
              Clear All
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <CircleNotch size={24} color="#3f3f46" style={{ animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            style={{
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10,
              padding: '14px 16px',
              fontSize: 13,
              color: '#f87171',
            }}
          >
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && history.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#111115',
              border: '1px solid #1e1e24',
              borderRadius: 14,
              padding: '64px 24px',
              textAlign: 'center',
              gap: 12,
            }}
          >
            <ClockCounterClockwise size={36} color="#27272a" />
            <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>No scans yet.</p>
            <button
              onClick={() => navigate('/scan')}
              style={{
                background: '#22d3ee',
                color: '#09090b',
                border: 'none',
                borderRadius: 8,
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: 4,
              }}
            >
              Run your first scan
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && history.length > 0 && (
          <div
            style={{
              background: '#111115',
              border: '1px solid #1e1e24',
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 80px 120px 56px',
                gap: 16,
                padding: '11px 20px',
                borderBottom: '1px solid #1e1e24',
                alignItems: 'center',
              }}
            >
              {['Project', 'Date', 'Score', 'Issues', ''].map((h) => (
                <span
                  key={h}
                  style={{ fontSize: 11, fontWeight: 600, color: '#3f3f46', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {history.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <HistoryRow
                  entry={entry}
                  onView={() => navigate('/results', { state: { report: entry } })}
                  onDelete={() => removeEntry(entry.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function HistoryRow({
  entry,
  onView,
  onDelete,
}: {
  entry: ScanHistoryEntry
  onView: () => void
  onDelete: () => void
}) {
  const color = scoreColor(entry.score)
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 80px 120px 56px',
        gap: 16,
        padding: '14px 20px',
        borderBottom: '1px solid #18181c',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'background 0.12s',
      }}
      onClick={onView}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = '#13131a')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
    >
      {/* Project */}
      <span style={{ fontSize: 13.5, fontWeight: 600, color: '#e4e4e7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {entry.project_name}
      </span>

      {/* Date */}
      <span style={{ fontSize: 12, color: '#52525b', fontFamily: 'ui-monospace, monospace' }}>
        {new Date(entry.date).toLocaleDateString()}
      </span>

      {/* Score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color }}>{entry.score}</span>
        <span style={{ fontSize: 11, color: '#3f3f46' }}>/ 100</span>
      </div>

      {/* Issues */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {entry.severity_summary.high > 0 && (
          <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
            <SeverityBadge severity="high" size="sm" />
            <span style={{ color: '#3f3f46', fontSize: 10 }}>{entry.severity_summary.high}</span>
          </span>
        )}
        {entry.severity_summary.medium > 0 && (
          <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
            <SeverityBadge severity="medium" size="sm" />
            <span style={{ color: '#3f3f46', fontSize: 10 }}>{entry.severity_summary.medium}</span>
          </span>
        )}
        {entry.severity_summary.low > 0 && (
          <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
            <SeverityBadge severity="low" size="sm" />
            <span style={{ color: '#3f3f46', fontSize: 10 }}>{entry.severity_summary.low}</span>
          </span>
        )}
        {entry.total_issues === 0 && (
          <span style={{ fontSize: 11, color: '#22c55e' }}>Clean</span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          title="Delete this scan"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#3f3f46',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 4,
            transition: 'color 0.12s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#f87171')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#3f3f46')}
        >
          <Trash size={13} />
        </button>
        <ArrowRight size={13} color="#3f3f46" />
      </div>
    </div>
  )
}
