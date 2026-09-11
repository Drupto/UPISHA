import {
  joinSchema,
  contactSchema,
  registerSchema,
} from '@/lib/validations'

describe('joinSchema', () => {
  const validBase = {
    fullName: 'Test Member',
    email: 'member@example.com',
    password: 'Passw0rd123',
    phone: '+91 98765 43210',
    qualification: 'BASLP',
    membershipType: 'life',
    city: 'Lucknow',
    transactionNumber: 'TXN12345',
    address: '12/3 Gomti Nagar, Lucknow',
    photoUrl: 'data:image/png;base64,iVBORw0KGgo=',
    declaration: true,
  }

  it('accepts a valid membership application', () => {
    const result = joinSchema.safeParse(validBase)
    expect(result.success).toBe(true)
  })

  it('rejects an empty photo (photo is compulsory)', () => {
    const result = joinSchema.safeParse({ ...validBase, photoUrl: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const photoIssue = result.error.issues.find((i) => i.path.includes('photoUrl'))
      expect(photoIssue?.message).toBe('Please upload your photo')
    }
  })

  it('rejects a malformed RCI certificate URL but accepts empty string', () => {
    const bad = joinSchema.safeParse({ ...validBase, rciCertificateUrl: 'not-a-url' })
    expect(bad.success).toBe(false)
    const ok = joinSchema.safeParse({ ...validBase, rciCertificateUrl: '' })
    expect(ok.success).toBe(true)
    const url = joinSchema.safeParse({
      ...validBase,
      rciCertificateUrl: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/file',
    })
    expect(url.success).toBe(true)
  })

  it('rejects the declaration when not accepted', () => {
    const result = joinSchema.safeParse({ ...validBase, declaration: false })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('declaration'))
      expect(issue?.message).toContain('declaration')
    }
  })

  it('requires course and current year for student members', () => {
    const student = joinSchema.safeParse({ ...validBase, membershipType: 'student' })
    expect(student.success).toBe(false)

    const studentOk = joinSchema.safeParse({
      ...validBase,
      membershipType: 'student',
      course: 'BASLP',
      currentYear: '2',
    })
    expect(studentOk.success).toBe(true)
  })

  it('enforces password complexity (upper, lower, digit, min 8)', () => {
    expect(joinSchema.safeParse({ ...validBase, password: 'alllowercase1' }).success).toBe(false)
    expect(joinSchema.safeParse({ ...validBase, password: 'ALLUPPERCASE1' }).success).toBe(false)
    expect(joinSchema.safeParse({ ...validBase, password: 'NoDigitsHere' }).success).toBe(false)
    expect(joinSchema.safeParse({ ...validBase, password: 'Sh0rt' }).success).toBe(false)
  })
})

describe('registerSchema / contactSchema', () => {
  it('mirrors password complexity rules', () => {
    const result = registerSchema.safeParse({
      email: 'a@b.com',
      password: 'weakpass',
      displayName: 'Tester',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short contact messages', () => {
    const result = contactSchema.safeParse({
      name: 'Tester',
      email: 'a@b.com',
      subject: 'Hello',
      message: 'too short',
    })
    expect(result.success).toBe(false)
  })
})
