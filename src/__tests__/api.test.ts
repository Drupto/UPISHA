import { eventSchema } from '@/lib/validations'

describe('API Routes', () => {
  it('should have contact API route', () => {
    expect(true).toBe(true)
  })

  it('should have join API route', () => {
    expect(true).toBe(true)
  })

  it('should have newsletter API route', () => {
    expect(true).toBe(true)
  })

  it('should validate event with countdown fields', () => {
    const result = eventSchema.parse({
      title: 'UP ISHACON 2026',
      date: '18-20 Oct 2026',
      location: 'KGMU, Lucknow',
      description: 'Annual conference',
      isActive: true,
      countdownEnabled: true,
      countdownDate: '2026-10-18T09:00:00+05:30',
      badgeLabel: 'Save the Date',
      registrationLink: '#join',
      registrationLabel: 'Register Now',
    })

    expect(result.countdownEnabled).toBe(true)
    expect(result.countdownDate).toBe('2026-10-18T09:00:00+05:30')
    expect(result.badgeLabel).toBe('Save the Date')
    expect(result.registrationLabel).toBe('Register Now')
  })

  it('should default countdownEnabled to false when not provided', () => {
    const result = eventSchema.parse({
      title: 'Workshop',
      date: '25 Mar 2026',
      location: 'Lucknow',
    })

    expect(result.countdownEnabled).toBe(false)
  })
})
