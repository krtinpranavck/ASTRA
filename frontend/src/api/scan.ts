import type { ScanHistoryEntry } from '../types'

const API_BASE = 'http://localhost:8000'

export async function scanCode(sourceCode: string, projectName?: string): Promise<ScanHistoryEntry> {
  const res = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_code: sourceCode,
      project_name: projectName || 'Untitled',
    }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.detail || `Server responded with ${res.status}`)
  }
  return res.json() as Promise<ScanHistoryEntry>
}

export async function scanUrl(url: string, projectName?: string): Promise<ScanHistoryEntry> {
  const res = await fetch(`${API_BASE}/scan/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, project_name: projectName || undefined }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.detail || `Server responded with ${res.status}`)
  }
  return res.json() as Promise<ScanHistoryEntry>
}

export async function getHistory(): Promise<ScanHistoryEntry[]> {
  const res = await fetch(`${API_BASE}/history`)
  if (!res.ok) throw new Error(`Could not load history (${res.status})`)
  return res.json() as Promise<ScanHistoryEntry[]>
}

export async function deleteHistory(): Promise<void> {
  await fetch(`${API_BASE}/history`, { method: 'DELETE' })
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' })
}
