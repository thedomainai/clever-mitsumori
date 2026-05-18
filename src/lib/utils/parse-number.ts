export function parseNumber(value: string | undefined | null): number | null {
  if (!value) {
    return null
  }

  const normalized = value
    .trim()
    .replace(/,/g, '')
    .replace(/¥/g, '')
    .replace(/\s/g, '')
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))

  if (normalized === '') {
    return null
  }

  const parsed = Number(normalized)

  if (isNaN(parsed)) {
    return null
  }

  return parsed
}
