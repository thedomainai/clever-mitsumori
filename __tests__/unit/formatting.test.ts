import { formatPrice, formatDate, formatStock } from '@/lib/utils/formatting'

describe('formatPrice', () => {
  it('should format zero price', () => {
    expect(formatPrice(0)).toBe('¥0')
  })

  it('should format price with thousand separator', () => {
    expect(formatPrice(1500)).toBe('¥1,500')
  })

  it('should format large price', () => {
    expect(formatPrice(1234567)).toBe('¥1,234,567')
  })

  it('should format small price', () => {
    expect(formatPrice(100)).toBe('¥100')
  })

  it('should format price without thousand separator for small numbers', () => {
    expect(formatPrice(999)).toBe('¥999')
  })
})

describe('formatDate', () => {
  it('should return dash for null', () => {
    expect(formatDate(null)).toBe('-')
  })

  it('should format ISO date string', () => {
    const result = formatDate('2024-01-15T00:00:00.000Z')
    expect(result).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/)
  })

  it('should format ISO date string to Japanese locale', () => {
    const result = formatDate('2024-12-31T00:00:00.000Z')
    expect(result).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/)
  })

  it('should handle different ISO formats', () => {
    const result = formatDate('2024-06-15T12:30:45.123Z')
    expect(result).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/)
  })
})

describe('formatStock', () => {
  it('should format zero stock', () => {
    expect(formatStock(0)).toBe('0.0m')
  })

  it('should format decimal stock', () => {
    expect(formatStock(12.5)).toBe('12.5m')
  })

  it('should format large stock', () => {
    expect(formatStock(150)).toBe('150.0m')
  })

  it('should format stock with one decimal place', () => {
    expect(formatStock(45.7)).toBe('45.7m')
  })

  it('should round to one decimal place', () => {
    expect(formatStock(12.345)).toBe('12.3m')
  })

  it('should format small stock', () => {
    expect(formatStock(0.5)).toBe('0.5m')
  })
})
