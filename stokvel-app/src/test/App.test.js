import { describe, it, expect } from 'vitest'

describe('App', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })

  it('adds numbers correctly', () => {
    expect(1 + 1).toBe(2)
  })

  it('strings work', () => {
    expect('stokvel').toContain('stokvel')
  })
})
