const DATE_FIELD_PATTERN = /\b(date|time|at|timestamp|expir|birth|dob|created|updated|modified|start|end)\b/i
// Matches ISO 8601 dates: 2026-04-01, 2026-04-01T00:00:00Z, 2026-04-01T00:00:00.000Z, 2026-04-01T00:00:00+07:00
const ISO_DATE_VALUE_PATTERN = /^\d{4}-\d{2}-\d{2}(T[\d:.]+([Z+-]|$))?/

export function isDateField(fieldName: string): boolean {
  return DATE_FIELD_PATTERN.test(fieldName)
}

export function isDateValue(value: string | null | undefined): boolean {
  if (!value) return false
  return ISO_DATE_VALUE_PATTERN.test(value.trim())
}

export function formatRelativeTime(date: string | null): string {
  if (!date) return 'Never'
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  return 'Just now'
}
