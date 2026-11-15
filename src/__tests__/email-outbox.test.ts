import {
  announcementUpdateSchema,
  eventUpdateSchema,
  newsletterCampaignUpdateSchema,
  webinarUpdateSchema,
} from '@/lib/validations'
import { outboxDocumentId } from '@/lib/email-outbox-types'
import { stripUndefined } from '@/lib/email-outbox-types'

describe('outboxDocumentId', () => {
  it('produces a stable Firestore-safe ID and never contains a slash', () => {
    expect(outboxDocumentId('contact-ack:ABC123')).toBe('contact-ack:abc123')
    expect(outboxDocumentId('source/with/slashes')).toBe('source_with_slashes')
    expect(outboxDocumentId('  Mixed CASE & symbols  ')).toBe('mixed_case_symbols')
    expect(outboxDocumentId('a/b'.repeat(500)).length).toBeLessThanOrEqual(380)
  })
})

describe('update schemas do not inject creation defaults', () => {
  it('webinar partial update does not force type/isActive defaults', () => {
    const parsed = webinarUpdateSchema.parse({ isActive: false })
    expect(parsed).toEqual({ isActive: false })
    expect(parsed).not.toHaveProperty('type')
  })

  it('campaign partial update does not reset sent campaigns to draft', () => {
    const parsed = newsletterCampaignUpdateSchema.parse({ subject: 'Updated subject' })
    expect(parsed).toEqual({ subject: 'Updated subject' })
    expect(parsed).not.toHaveProperty('status')
  })

  it('announcement/event partial updates do not force isActive', () => {
    expect(announcementUpdateSchema.parse({ title: 'New title' })).toEqual({ title: 'New title' })
    expect(eventUpdateSchema.parse({ title: 'New title' })).toEqual({ title: 'New title' })
  })
})

describe('stripUndefined', () => {
  it('removes undefined fields so template data is always Firestore-safe', () => {
    const input = {
      fullName: 'Test User',
      webinarSpeaker: undefined,
      webinarDuration: undefined,
      meetingLink: 'https://meet.example/x',
      transactionNumber: null,
      receipt: { number: 'R-1', paidAt: undefined },
      tags: ['a', undefined, 'b'] as unknown as string[],
    }
    const cleaned = stripUndefined(input) as Record<string, unknown>
    expect(cleaned).toEqual({
      fullName: 'Test User',
      meetingLink: 'https://meet.example/x',
      transactionNumber: null,
      receipt: { number: 'R-1' },
      tags: ['a', null, 'b'],
    })
  })
})
