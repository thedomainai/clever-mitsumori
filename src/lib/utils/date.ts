export function parseDate(value: string | undefined | null): string | null {
  if (!value || value.trim() === '') {
    return null
  }

  const normalized = value.trim().replace(/\//g, '-')

  const date = new Date(normalized)

  if (isNaN(date.getTime())) {
    return null
  }

  return date.toISOString()
}
