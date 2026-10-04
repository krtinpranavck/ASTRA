import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Code, BookOpen, Lightbulb, Warning } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import type { Issue, ScanHistoryEntry } from '../types'
import SeverityBadge from '../components/SeverityBadge'

function humanizeRuleId(id: string): string {
  return id
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// WCAG Success Criterion reference data
const WCAG_INFO: Record<string, { title: string; slug: string }> = {
  '1.1.1': { title: 'Non-text Content', slug: 'non-text-content' },
  '1.3.1': { title: 'Info and Relationships', slug: 'info-and-relationships' },
  '1.4.3': { title: 'Contrast (Minimum)', slug: 'contrast-minimum' },
  '2.1.1': { title: 'Keyboard', slug: 'keyboard' },
  '2.4.6': { title: 'Headings and Labels', slug: 'headings-and-labels' },
  '3.1.1': { title: 'Language of Page', slug: 'language-of-page' },
  '4.1.2': { title: 'Name, Role, Value', slug: 'name-role-value' },
}

// Concrete before/after code fix examples for each rule
const FIX_EXAMPLES: Record<string, { bad: string; good: string }> = {
  'alt-text': {
    bad: '<img src="hero.jpg" />',
    good: '<img src="hero.jpg" alt="Team photo in the office" />',
  },
  'form-label': {
    bad: '<input type="email" placeholder="Email" />',
    good: `<label for="email">Email address</label>\n<input id="email" type="email" placeholder="you@example.com" />`,
  },
  'heading-order': {
    bad: `<h1>Page Title</h1>\n<h3>Sub-section</h3>  {/* ❌ skipped h2 */}`,
    good: `<h1>Page Title</h1>\n<h2>Section</h2>\n<h3>Sub-section</h3>  {/* ✓ sequential */}`,
  },
  'semantic-html': {
    bad: `<div role="navigation">...</div>\n<div role="main">...</div>`,
    good: `<nav>...</nav>\n<main>...</main>`,
  },
  'keyboard-access': {
    bad: '<div onClick={handleClick}>Open menu</div>',
    good: '<button onClick={handleClick}>Open menu</button>',
  },
  'lang-attribute': {
    bad: '<html>',
    good: '<html lang="en">',
  },
  'empty-interactive': {
    bad: `<button><svg aria-hidden="true">...</svg></button>  {/* ❌ no label */}`,
    good: `<button aria-label="Close dialog">\n  <svg aria-hidden="true">...</svg>\n</button>`,
  },
  'table-headers': {
    bad: `<table>\n  <tr><td>Name</td><td>Score</td></tr>\n  <tr><td>Alice</td><td>95</td></tr>\n</table>`,
    good: `<table>\n  <thead>\n    <tr><th scope="col">Name</th><th scope="col">Score</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Alice</td><td>95</td></tr>\n  </tbody>\n</table>`,
  },
  'color-contrast': {
    bad: '<p style="color: #999999; background-color: #ffffff;">Light grey text</p>  {/* 2.85:1 */}',
    good: '<p style="color: #595959; background-color: #ffffff;">Darker grey text</p>  {/* 7.0:1 */}',
  },
}

function WcagLevelBadge({ level }: { level: string }) {
  const isAA = level === 'AA'
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        fontFamily: 'ui-monospace, monospace',
        color: isAA ? '#a78bfa' : '#22d3ee',
        background: isAA ? 'rgba(167,139,250,0.12)' : 'rgba(34,211,238,0.12)',
        border: `1px solid ${isAA ? 'rgba(167,139,250,0.3)' : 'rgba(34,211,238,0.3)'}`,
        borderRadius: 5,
        padding: '2px 8px',
      }}
    >
      Level {level}
    </span>
  )
}

export default function IssueDetail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { index } = useParams<{ index: string }>()

  const state = location.state as { issue?: Issue; report?: ScanHistoryEntry } | null
  let issue: Issue | null = state?.issue ?? null
  const report: ScanHistoryEntry | null = state?.report ?? null

  if (!issue && report && index !== undefined) {
    issue = report.issues[parseInt(index, 10)] ?? null
  }

  if (!issue) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', gap: 16 }}>
        <Warning size={36} color="#27272a" />
        <p style={{ color: '#52525b', fontSize: 14 }}>Issue not found.</p>
        <button
          onClick={() => navigate(-1)}
          style={{ background: '#1e1e24', color: '#a1a1aa', border: '1px solid #27272a', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
        >
          Go Back
        </button>
      </div>
    )
  }

  const wcag = WCAG_INFO[issue.wcag_ref]
  const fix = FIX_EXAMPLES[issue.rule_id]

  return (
    <div style={{ padding: '36px 44px', maxWidth: 780, minHeight: '100dvh' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#52525b', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 22 }}
        >
          <ArrowLeft size={13} />
          Back to Results
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', letterSpacing: '-0.02em', margin: 0, flex: 1 }}>
            {humanizeRuleId(issue.rule_id)}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {issue.wcag_level && <WcagLevelBadge level={issue.wcag_level} />}
            <SeverityBadge severity={issue.severity} size="lg" />
          </div>
        </div>

        {/* Location badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <span
            style={{
              fontSize: 11,
              fontFamily: 'ui-monospace, monospace',
              color: '#71717a',
              background: '#1a1a1f',
              border: '1px solid #27272a',
              padding: '3px 9px',
              borderRadius: 6,
            }}
          >
            Line {issue.line}
          </span>
          {report && (
            <span style={{ fontSize: 11, color: '#3f3f46' }}>in {report.project_name}</span>
          )}
        </div>

        {/* Cards grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 28 }}>

          {/* What's wrong */}
          <DetailCard icon={<Warning size={16} color="#f59e0b" />} title="What's Wrong">
            <p style={{ fontSize: 13.5, color: '#a1a1aa', lineHeight: 1.65, margin: 0 }}>{issue.message}</p>
          </DetailCard>

          {/* WCAG rule — dynamic */}
          <DetailCard icon={<BookOpen size={16} color="#22d3ee" />} title="WCAG Rule">
            {wcag ? (
              <>
                <p style={{ fontSize: 13.5, color: '#a1a1aa', lineHeight: 1.65, margin: '0 0 10px' }}>
                  <strong style={{ color: '#e4e4e7' }}>SC {issue.wcag_ref}</strong> — {wcag.title}
                  {' '}
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: 'ui-monospace, monospace',
                      color: issue.wcag_level === 'AA' ? '#a78bfa' : '#22d3ee',
                      background: issue.wcag_level === 'AA' ? 'rgba(167,139,250,0.1)' : 'rgba(34,211,238,0.1)',
                      border: `1px solid ${issue.wcag_level === 'AA' ? 'rgba(167,139,250,0.25)' : 'rgba(34,211,238,0.25)'}`,
                      borderRadius: 4,
                      padding: '1px 5px',
                      marginLeft: 4,
                      verticalAlign: 'middle',
                    }}
                  >
                    Level {issue.wcag_level}
                  </span>
                </p>
                <a
                  href={`https://www.w3.org/WAI/WCAG22/Understanding/${wcag.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: '#22d3ee', textDecoration: 'none' }}
                >
                  Read WCAG {issue.wcag_ref} guideline →
                </a>
              </>
            ) : (
              <p style={{ fontSize: 13.5, color: '#a1a1aa', margin: 0 }}>
                SC {issue.wcag_ref} — Level {issue.wcag_level}
              </p>
            )}
          </DetailCard>

          {/* How to fix */}
          <DetailCard icon={<Lightbulb size={16} color="#22c55e" />} title="How to Fix">
            <p style={{ fontSize: 13.5, color: '#a1a1aa', lineHeight: 1.65, margin: '0 0 14px' }}>
              {issue.recommendation}
            </p>

            {fix && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <CodeBlock label="Before (failing)" labelColor="#ef4444" code={fix.bad} />
                <CodeBlock label="After (passing)" labelColor="#22c55e" code={fix.good} />
              </div>
            )}
          </DetailCard>

          {/* Impact */}
          <DetailCard icon={<Code size={16} color="#a78bfa" />} title="Accessibility Impact">
            <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.6, margin: 0 }}>
              {IMPACT[issue.rule_id] ?? defaultImpact(issue.wcag_level)}
            </p>
          </DetailCard>

        </div>
      </motion.div>
    </div>
  )
}

// Impact descriptions per rule
const IMPACT: Record<string, string> = {
  'alt-text': 'Screen readers announce images as "image" with no context. Users who are blind or have images disabled receive no information about what the image shows or its purpose on the page.',
  'form-label': 'Without a label, screen reader users hear "edit text" or "combo box" with no indication of what to enter. VoiceOver and NVDA users cannot fill out the form efficiently.',
  'heading-order': 'Screen reader users navigate pages by jumping between headings. A skipped level breaks this outline, making it hard to understand the page structure and find content quickly.',
  'semantic-html': 'Browser accessibility trees expose landmark regions (nav, main, aside) as navigation points. Using <div> with a role means the element works visually but the native keyboard shortcuts for landmarks stop working.',
  'keyboard-access': 'Keyboard-only users (including many with motor disabilities) cannot reach or activate this element at all. The element is invisible to Tab navigation.',
  'lang-attribute': 'Screen readers pick the pronunciation engine based on the page language. Without lang="en", a French screen reader might read English text with French phonetics, making it unintelligible.',
  'empty-interactive': 'Screen readers announce buttons and links by their accessible name. An empty name means the user hears just "button" or "link" with no idea what it does.',
  'table-headers': 'Screen readers announce each cell along with its column and row header. Without <th> headers, users in a table hear only the cell value — there is no way to know which column "95" belongs to.',
  'color-contrast': 'Low contrast text is difficult or impossible to read for users with low vision, color blindness, or anyone in bright sunlight. This is one of the most common WCAG failures.',
}

function defaultImpact(level: string): string {
  if (level === 'AA') return 'This is a Level AA issue — the standard required by most accessibility laws (ADA, EN 301 549, WCAG 2.2).'
  return 'This is a Level A issue — the minimum baseline for accessibility. Failing Level A blocks entire groups of users from using the page.'
}

function CodeBlock({ label, labelColor, code }: { label: string; labelColor: string; code: string }) {
  return (
    <div>
      <span style={{ fontSize: 10, fontWeight: 600, color: labelColor, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
        {label}
      </span>
      <pre
        style={{
          margin: 0,
          fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
          fontSize: 12,
          color: '#e4e4e7',
          background: '#0a0a0d',
          border: '1px solid #1e1e24',
          borderRadius: 8,
          padding: '12px 14px',
          overflowX: 'auto',
          lineHeight: 1.7,
          whiteSpace: 'pre',
        }}
      >
        {code}
      </pre>
    </div>
  )
}

function DetailCard({
  icon, title, children,
}: {
  icon: React.ReactNode; title: string; children: React.ReactNode
}) {
  return (
    <div
      style={{
        background: '#111115',
        border: '1px solid #1e1e24',
        borderRadius: 12,
        padding: '18px 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {icon}
        <span style={{ fontSize: 12, fontWeight: 600, color: '#71717a', letterSpacing: '0.04em' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}
