export interface Issue {
  rule_id: string
  severity: 'high' | 'medium' | 'low'
  wcag_ref: string
  wcag_level: string
  line: number
  message: string
  recommendation: string
}

export interface SeveritySummary {
  high: number
  medium: number
  low: number
}

export interface ScanReport {
  project_name: string
  score: number
  total_issues: number
  severity_summary: SeveritySummary
  issues: Issue[]
}

/** Returned by both /scan and /scan/url — includes DB id and timestamp. */

export interface ScanHistoryEntry extends ScanReport {
  id: string
  date: string
}
