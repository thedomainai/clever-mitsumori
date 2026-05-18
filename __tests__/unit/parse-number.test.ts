import { parseNumber } from '@/lib/utils/parse-number'

describe('parseNumber', () => {
  it('should return null for null input', () => {
    expect(parseNumber(null)).toBeNull()
  })

  it('should return null for undefined input', () => {
    expect(parseNumber(undefined)).toBeNull()
  })

  it('should return null for empty string', () => {
    expect(parseNumber('')).toBeNull()
  })

  it('should parse normal number string', () => {
    expect(parseNumber('123')).toBe(123)
  })

  it('should parse number with comma', () => {
    expect(parseNumber('1,234')).toBe(1234)
  })

  it('should parse number with yen symbol', () => {
    expect(parseNumber('¥511')).toBe(511)
  })

  it('should parse number with yen symbol and comma', () => {
    expect(parseNumber('¥2,310')).toBe(2310)
  })

  it('should parse decimal number', () => {
    expect(parseNumber('12.5')).toBe(12.5)
  })

  it('should parse full-width number', () => {
    expect(parseNumber('１２３')).toBe(123)
  })

  it('should parse number with whitespace', () => {
    expect(parseNumber(' 100 ')).toBe(100)
  })

  it('should return null for non-numeric string', () => {
    expect(parseNumber('abc')).toBeNull()
  })

  it('should return null for string that becomes empty after normalization', () => {
    expect(parseNumber('¥ ')).toBeNull()
  })

  it('should parse complex formatted number', () => {
    expect(parseNumber('¥1,234,567')).toBe(1234567)
  })

  it('should parse full-width number with comma', () => {
    expect(parseNumber('１,２３４')).toBe(1234)
  })
})
