import { planDefaultTemplateSeed } from '@/lib/certificate-seed'
import type { CertificateTemplateSeed } from '@/lib/certificate-seed'
import type { CertificateTemplateDoc } from '@/lib/types'

function makeDefault(overrides: Partial<CertificateTemplateSeed> = {}): CertificateTemplateSeed {
  return {
    name: 'Default Certificate',
    accountType: 'all',
    category: 'membership',
    title: 'Certificate',
    subtitle: '',
    titleFont: {
      fontSize: 32,
      fontWeight: 'bold',
      fontStyle: 'normal',
      textAlign: 'center',
      color: '#0f172a',
      letterSpacing: 0.02,
    },
    subtitleFont: {
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'center',
      color: '#6b7280',
      letterSpacing: 0.05,
    },
    textBlocks: [
      {
        id: 'b1',
        content: 'Body text',
        fontSize: 18,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'center',
        color: '#374151',
        marginTop: 8,
        marginBottom: 8,
      },
    ],
    footerText: '',
    borderColor: '#0d9488',
    accentColor: '#b45309',
    fontFamily: 'serif',
    isActive: true,
    isDefault: false,
    ...overrides,
  }
}

function makeExisting(overrides: Partial<CertificateTemplateDoc> = {}): CertificateTemplateDoc {
  return { ...makeDefault(), id: 'tpl-1', ...overrides } as CertificateTemplateDoc
}

describe('planDefaultTemplateSeed', () => {
  it('creates every missing default on a fresh database', () => {
    const defaults = [
      makeDefault({ name: 'Life Member Certificate', seedKey: 'life-member', isDefault: true }),
      makeDefault({ name: 'Annual Member Certificate', seedKey: 'annual-member', isDefault: true }),
    ]
    const plan = planDefaultTemplateSeed([], defaults)
    expect(plan.toCreate).toHaveLength(2)
    expect(plan.toCreate[0].isDefault).toBe(true)
    expect(plan.toCreate[1].isDefault).toBe(true)
    expect(plan.toRepairCategory).toHaveLength(0)
    expect(plan.toBackfillSeedKey).toHaveLength(0)
  })

  it('does nothing when every default already exists with its seedKey', () => {
    const defaults = [makeDefault({ seedKey: 'life-member' })]
    const existing = [makeExisting({ seedKey: 'life-member' })]
    const plan = planDefaultTemplateSeed(existing, defaults)
    expect(plan.toCreate).toHaveLength(0)
    expect(plan.toRepairCategory).toHaveLength(0)
    expect(plan.toBackfillSeedKey).toHaveLength(0)
  })

  it('claims a legacy template by factory name and backfills its seedKey', () => {
    const defaults = [makeDefault({ name: 'Life Member Certificate', seedKey: 'life-member' })]
    const existing = [makeExisting({ name: 'Life Member Certificate', id: 'legacy-1' })]
    const plan = planDefaultTemplateSeed(existing, defaults)
    expect(plan.toCreate).toHaveLength(0)
    expect(plan.toBackfillSeedKey).toEqual([{ id: 'legacy-1', seedKey: 'life-member' }])
  })

  it('does NOT recreate a default that an admin renamed (regression test)', () => {
    const defaults = [makeDefault({ seedKey: 'life-member' })]
    const existing = [makeExisting({ name: 'My Customised Certificate', seedKey: 'life-member' })]
    const plan = planDefaultTemplateSeed(existing, defaults)
    expect(plan.toCreate).toHaveLength(0)
    expect(plan.toBackfillSeedKey).toHaveLength(0)
  })

  it('plans a category repair when an existing seed has the wrong category', () => {
    const defaults = [makeDefault({ seedKey: 'webinar-participation', category: 'webinar' })]
    const existing = [makeExisting({ seedKey: 'webinar-participation', category: 'membership' })]
    const plan = planDefaultTemplateSeed(existing, defaults)
    expect(plan.toCreate).toHaveLength(0)
    expect(plan.toRepairCategory).toEqual([{ id: 'tpl-1', category: 'webinar' }])
  })

  it('does not let a recreated default steal the isDefault flag', () => {
    const defaults = [
      makeDefault({ name: 'Life', seedKey: 'life-member', isDefault: true }),
      makeDefault({ name: 'Annual', seedKey: 'annual-member', isDefault: true }),
    ]
    const existing = [makeExisting({ seedKey: 'life-member', isDefault: true })]
    const plan = planDefaultTemplateSeed(existing, defaults)
    expect(plan.toCreate).toHaveLength(1)
    expect(plan.toCreate[0].seedKey).toBe('annual-member')
    expect(plan.toCreate[0].isDefault).toBe(false)
  })

  it('claims only the first legacy duplicate when names collide', () => {
    const defaults = [makeDefault({ name: 'Life Member Certificate', seedKey: 'life-member' })]
    const existing = [
      makeExisting({ name: 'Life Member Certificate', id: 'dup-a' }),
      makeExisting({ name: 'Life Member Certificate', id: 'dup-b' }),
    ]
    const plan = planDefaultTemplateSeed(existing, defaults)
    expect(plan.toCreate).toHaveLength(0)
    expect(plan.toBackfillSeedKey).toEqual([{ id: 'dup-a', seedKey: 'life-member' }])
  })
})
