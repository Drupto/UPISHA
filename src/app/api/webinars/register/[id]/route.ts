import { NextRequest, NextResponse } from 'next/server'
import { deleteWebinarRegistration, updateWebinarRegistration, getWebinarRegistrations, getWebinarById, createReceipt, getReceiptsByMemberId } from '@/lib/firestore'
import { withSecurityHeaders, sanitizeHtml } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import type { WebinarRegistrationDoc } from '@/lib/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const body = await request.json()
    const { status } = body

    if (!status || !['pending', 'confirmed', 'rejected'].includes(status)) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Invalid status. Must be pending, confirmed, or rejected.' },
        { status: 400 }
      ))
    }

    await updateWebinarRegistration(id, { status })

    // Auto-generate receipt when a paid webinar registration is confirmed
    if (status === 'confirmed') {
      try {
        const registrations = await getWebinarRegistrations()
        const registration = registrations.find((r) => r.id === id) as (WebinarRegistrationDoc & { id: string }) | undefined
        if (registration && registration.webinarType === 'paid') {
          const webinar = registration.webinarId ? await getWebinarById(registration.webinarId) : null
          const amount = webinar?.price ?? 0
          if (amount > 0) {
            const existingReceipts = await getReceiptsByMemberId(registration.email)
            const hasWebinarReceipt = existingReceipts.some(
              (r) => r.transactionType === 'webinar' && r.description.includes(registration.webinarTitle)
            )
            if (!hasWebinarReceipt) {
              await createReceipt({
                receiptNumber: `UPISHA-RCPT-WEB-${id}`,
                memberId: registration.email,
                memberUid: registration.email,
                memberName: sanitizeHtml(registration.fullName),
                memberEmail: registration.email,
                transactionType: 'webinar',
                description: `Webinar Registration - ${registration.webinarTitle}`,
                amount,
                currency: 'INR',
                transactionNumber: registration.transactionNumber || null,
                paymentMethod: 'UPI',
                status: 'paid',
                issuedAt: new Date(),
              })
            }
          }
        }
      } catch (receiptError) {
        // Log but don't fail the registration update if receipt creation fails
        console.error('Error auto-generating webinar receipt:', receiptError)
      }
    }

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: `Registration marked as ${status}`,
    }))
  } catch (error) {
    console.error('Error updating webinar registration:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update registration' }, { status: 500 }))
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    await deleteWebinarRegistration(id)
    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Registration deleted successfully',
    }))
  } catch (error) {
    console.error('Error deleting webinar registration:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 }))
  }
}