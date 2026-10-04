import { Outlet, NavLink } from 'react-router-dom'
import {
  House,
  Plus,
  ClockCounterClockwise,
  GitBranch,
  ArrowSquareOut,
} from '@phosphor-icons/react'

const navItems = [
  { to: '/', icon: House, label: 'Home', end: true },
  { to: '/scan', icon: Plus, label: 'New Scan', end: false },
  { to: '/history', icon: ClockCounterClockwise, label: 'History', end: false },
]

export default function Layout() {
  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: '#09090b' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 232,
          flexShrink: 0,
          background: '#0f0f12',
          borderRight: '1px solid #27272a',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Brand */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1f1f23' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                background: '#22d3ee',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <GitBranch size={15} weight="bold" color="#09090b" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#f4f4f5', letterSpacing: '0.04em' }}>ASTRA</div>
              <div style={{ fontSize: 10, color: '#52525b', marginTop: 1, letterSpacing: '0.02em' }}>
                Accessibility Review Tool
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'background 0.15s, color 0.15s',
                background: isActive ? '#1e1e24' : 'transparent',
                color: isActive ? '#f4f4f5' : '#71717a',
                borderLeft: isActive ? '2px solid #22d3ee' : '2px solid transparent',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={15} weight={isActive ? 'fill' : 'regular'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #1f1f23',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontSize: 10,
                fontFamily: 'ui-monospace, monospace',
                color: '#22d3ee',
                background: 'rgba(34,211,238,0.08)',
                border: '1px solid rgba(34,211,238,0.15)',
                padding: '2px 7px',
                borderRadius: 4,
                letterSpacing: '0.05em',
              }}
            >
              WCAG 2.2
            </span>
            <span style={{ fontSize: 10, color: '#3f3f46', fontFamily: 'ui-monospace, monospace' }}>v1.0</span>
          </div>
          <a
            href="https://www.w3.org/WAI/WCAG22/quickref/"
            target="_blank"
            rel="noopener noreferrer"
            title="WCAG 2.2 Quick Reference"
            style={{ color: '#3f3f46', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#71717a')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#3f3f46')}
          >
            <ArrowSquareOut size={12} />
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  )
}
