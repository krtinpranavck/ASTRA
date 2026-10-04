import { useState, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FileCode, Globe, Upload, CircleNotch, WarningCircle, X } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { scanCode, scanUrl } from '../api/scan'
import type { ScanHistoryEntry } from '../types'
// ScanHistoryEntry is used as the report type; scan endpoints now return it directly

type Mode = 'code' | 'url'

export default function NewScan() {
  const location = useLocation()
  const initialMode = (location.state as { mode?: Mode } | null)?.mode ?? 'code'
  const [mode, setMode] = useState<Mode>(initialMode)
  const [code, setCode] = useState('')
  const [url, setUrl] = useState('')
  const [projectName, setProjectName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const loadFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => setCode((e.target?.result as string) ?? '')
    reader.readAsText(file)
    if (!projectName) {
      setProjectName(file.name.replace(/\.(jsx?|tsx?)$/, ''))
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) loadFile(file)
    },
    [projectName],
  )

  const handleScan = async () => {
    const input = mode === 'code' ? code : url
    if (!input.trim()) {
      setError(mode === 'code' ? 'Please provide source code to scan.' : 'Please enter a website URL.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const report = mode === 'url'
        ? await scanUrl(url, projectName.trim() || undefined)
        : await scanCode(code, projectName.trim() || 'Untitled')

      // Backend saves to DB; we only keep last report in session for Results page
      sessionStorage.setItem('astra-last-report', JSON.stringify(report))

      navigate('/results', { state: { report } })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Scan failed. Make sure the backend is running on port 8000.',
      )
      setLoading(false)
    }
  }

  const canScan = mode === 'code' ? code.trim().length > 0 : url.trim().length > 0

  return (
    <div style={{ padding: '40px 44px', maxWidth: 740, minHeight: '100dvh' }}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f4f4f5', letterSpacing: '-0.02em', margin: 0 }}>
          New Accessibility Scan
        </h1>
        <p style={{ marginTop: 8, color: '#71717a', fontSize: 13.5, lineHeight: 1.55 }}>
          Upload or paste React/JSX source code to detect WCAG 2.2 violations.
        </p>

        {/* Mode toggle */}
        <div
          style={{
            display: 'inline-flex',
            background: '#111115',
            border: '1px solid #1e1e24',
            borderRadius: 10,
            padding: 4,
            marginTop: 28,
            gap: 4,
          }}
        >
          {(['code', 'url'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 14px',
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s',
                background: mode === m ? '#1e1e28' : 'transparent',
                color: mode === m ? '#f4f4f5' : '#52525b',
              }}
            >
              {m === 'code' ? <FileCode size={14} /> : <Globe size={14} />}
              {m === 'code' ? 'React Source Code' : 'Website URL'}
            </button>
          ))}
        </div>

        {/* Project name */}
        <div style={{ marginTop: 24 }}>
          <Label>Project Name</Label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="my-react-app"
            style={inputStyle}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(34,211,238,0.4)' }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#27272a' }}
          />
        </div>

        {/* Code input */}
        {mode === 'code' && (
          <div style={{ marginTop: 18 }}>
            <Label>Source Code</Label>

            {/* Drop zone overlay */}
            <div
              style={{ position: 'relative' }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {isDragging && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(34,211,238,0.06)',
                    border: '2px dashed rgba(34,211,238,0.5)',
                    borderRadius: 12,
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <span style={{ color: '#22d3ee', fontSize: 13, fontWeight: 500 }}>Drop to load file</span>
                </div>
              )}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`function Hero() {\n  return (\n    <div>\n      <img src="banner.png" />\n      <button>Click</button>\n    </div>\n  )\n}`}
                rows={14}
                style={{
                  ...inputStyle,
                  fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
                  fontSize: 12,
                  lineHeight: 1.65,
                  resize: 'vertical',
                  minHeight: 200,
                  display: 'block',
                  width: '100%',
                }}
                onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(34,211,238,0.4)' }}
                onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = '#27272a' }}
              />
            </div>

            {/* Upload controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  color: '#71717a',
                  background: '#111115',
                  border: '1px solid #27272a',
                  borderRadius: 7,
                  padding: '5px 11px',
                  cursor: 'pointer',
                  transition: 'color 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#f4f4f5'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#3f3f46'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#71717a'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#27272a'
                }}
              >
                <Upload size={12} />
                Upload .jsx / .tsx
              </button>
              {code && (
                <button
                  onClick={() => setCode('')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    color: '#52525b',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '5px 4px',
                  }}
                >
                  <X size={11} /> Clear
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".jsx,.tsx,.js,.ts"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) loadFile(f)
                e.target.value = ''
              }}
            />
          </div>
        )}

        {/* URL input */}
        {mode === 'url' && (
          <div style={{ marginTop: 18 }}>
            <Label>Website URL</Label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              style={{ ...inputStyle, fontFamily: 'ui-monospace, monospace', fontSize: 13 }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(34,211,238,0.4)' }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#27272a' }}
            />
            <p style={{ fontSize: 11.5, color: '#3f3f46', marginTop: 6 }}>
              ASTRA will fetch the page HTML and analyze it for accessibility issues.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10,
              padding: '12px 14px',
              marginTop: 16,
            }}
          >
            <WarningCircle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: '#f87171', margin: 0, lineHeight: 1.5 }}>{error}</p>
          </div>
        )}

        {/* Scan button */}
        <div style={{ marginTop: 24 }}>
          <button
            onClick={handleScan}
            disabled={loading || !canScan}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: loading || !canScan ? '#1e1e24' : '#22d3ee',
              color: loading || !canScan ? '#3f3f46' : '#09090b',
              border: 'none',
              borderRadius: 9,
              padding: '10px 22px',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading || !canScan ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s, transform 0.1s',
            }}
            onMouseEnter={(e) => {
              if (!loading && canScan) (e.currentTarget as HTMLButtonElement).style.background = '#67e8f9'
            }}
            onMouseLeave={(e) => {
              if (!loading && canScan) (e.currentTarget as HTMLButtonElement).style.background = '#22d3ee'
            }}
            onMouseDown={(e) => {
              if (!loading && canScan) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
            }}
          >
            {loading && <CircleNotch size={15} style={{ animation: 'spin 0.8s linear infinite' }} />}
            {loading ? 'Scanning...' : 'Run Scan'}
          </button>
          {loading && (
            <p style={{ fontSize: 12, color: '#52525b', marginTop: 8 }}>
              Parsing AST and checking WCAG rules...
            </p>
          )}
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#71717a', marginBottom: 7 }}>
      {children}
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0d0d10',
  border: '1px solid #27272a',
  color: '#f4f4f5',
  fontSize: 13.5,
  borderRadius: 9,
  padding: '9px 13px',
  outline: 'none',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
}
