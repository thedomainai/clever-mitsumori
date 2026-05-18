import { parseDate } from '@/lib/utils/date'

describe('parseDate', () => {
  it('should return null for null input', () => {
    expect(parseDate(null)).toBeNull()
  })

  it('should return null for undefined input', () => {
    expect(parseDate(undefined)).toBeNull()
  })

  it('should return null for empty string', () => {
    expect(parseDate('')).toBeNull()
  })

  it('should return null for whitespace-only string', () => {
    expect(parseDate('   ')).toBeNull()
  })

  it('should parse ISO format date', () => {
    const result = parseDate('2024-01-15')
    expect(result).not.toBeNull()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)

    const date = new Date(result!)
    expect(date.getFullYear()).toBe(2024)
    expect(date.getMonth()).toBe(0) // January (0-indexed)
    expect(date.getDate()).toBe(15)
  })

  it('should parse slash format date', () => {
    const result = parseDate('2024/01/15')
    expect(result).not.toBeNull()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)

    const date = new Date(result!)
    expect(date.getFullYear()).toBe(2024)
    expect(date.getMonth()).toBe(0)
    expect(date.getDate()).toBe(15)
  })

  it('should return null for invalid date string', () => {
    expect(parseDate('invalid')).toBeNull()
  })

  it('should return null for invalid date format', () => {
    expect(parseDate('2024-13-40')).toBeNull()
  })

  it('should parse date with time', () => {
    const result = parseDate('2024-01-15T10:30:00')
    expect(result).not.toBeNull()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  })

  it('should handle date with extra whitespace', () => {
    const result = parseDate('  2024-01-15  ')
    expect(result).not.toBeNull()

    const date = new Date(result!)
    expect(date.getFullYear()).toBe(2024)
    expect(date.getMonth()).toBe(0)
    expect(date.getDate()).toBe(15)
  })
})
