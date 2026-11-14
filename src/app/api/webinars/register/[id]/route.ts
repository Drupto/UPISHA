import { NextRequest, NextResponse } from 'next/server'
import {
  deleteWebinarRegistration,
  updateWebinarRegistration,
  getWebinarRegistrationById,
  getWebinarById,
  getReceiptByReceiptNumber,
  updateReceipt,
} from '@/lib/firestore'
import { withSecurityHeaders, withCsrfProtection } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { logAdminAction } from '@/lib/audit-log'
import { ensureWebinarReceipt, webinarReceiptNumber } from '@/lib/webinar-receipts'
import { enqueueEmail } from '@/lib/email-outbox'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return withSecurityHeaders(auth)
  const admin = auth as { uid: string; email: string | null }

  const csrfError = withCsrfProtection(request)
  if (csrfError) return withSecurityHeaders(csrfError)

  try {
    const body = await request.json()
    const status = body?.status
    const notify = body?.notify !== false
    const paymentVerified = body?.paymentVerified === true
    const refundDecision = body?.refundDecision
    const rejectionReason = String(body?.rejectionReason ?? '').trim().slice(0, 500)

    if (!status || !['pending', 'confirmed', 'rejected'].includes(status)) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Invalid status. Must be pending, confirmed, or rejected.' },
        { status: 400 }
      ))
    }

    const registration = await getWebinarRegistrationById(id)
    if (!registration) {
      return withSecurityHeaders(NextResponse.json({ error: 'Registration not found' }, { status: 404 }))
    }

    const webinar = registration.webinarId ? await getWebinarById(registration.webinarId) : null
    const isPaid = registration.webinarType === 'paid'
    const amount =
      typeof registration.amount === 'number'
        ? registration.amount
        : typeof webinar?.price === 'number'
          ? webinar.price
          : 0

    let receiptNumber = registration.receiptNumber ?? null

    if (status === 'confirmed') {
      if (isPaid) {
        if (!paymentVerified && registration.paymentStatus !== 'verified') {
          return withSecurityHeaders(NextResponse.json(
            {
              error:
                'Payment must be verified before confirming a paid registration. Tick “Payment verified” and retry.',
            },
            { status: 400 }
          ))
        }

        // Create the receipt before the status change / notification. It is
        // deterministic and idempotent, and carries suppressEmail so it never
        // generates a second email.
        const receiptResult = await ensureWebinarReceipt(id)
        if (receiptResult.skipped === 'not-found' || !receiptResult.receipt) {
          return withSecurityHeaders(NextResponse.json(
            { error: 'Could not create the payment receipt. Registration was not confirmed.' },
            { status: 500 }
          ))
        }
        receiptNumber = receiptResult.receipt.receiptNumber
        if (receiptResult.receipt.id && receiptResult.receipt.status !== 'paid') {
          await updateReceipt(receiptResult.receipt.id, { status: 'paid' })
        }
      }

      await updateWebinarRegistration(id, {
        status: 'confirmed',
        ...(isPaid
          ? {
              paymentStatus: 'verified' as const,
              paymentVerifiedBy: { uid: admin.uid, email: admin.email },
              paymentVerifiedAt: new Date(),
              receiptNumber,
            }
          : {}),
      })
    } else if (status === 'rejected') {
      const existingReceipt = await getReceiptByReceiptNumber(webinarReceiptNumber(id))
      if (isPaid && existingReceipt && existingReceipt.status === 'paid') {
        if (refundDecision !== 'refunded' && refundDecision !== 'no_refund') {
          return withSecurityHeaders(NextResponse.json(
            {
              error:
                'This paid registration has a paid receipt. Choose refundDecision "refunded" or "no_refund" before rejecting.',
            },
            { status: 400 }
          ))
        }
        if (refundDecision === 'refunded' && existingReceipt.id) {
          await updateReceipt(existingReceipt.id, { status: 'refunded' })
        }
      }

      await updateWebinarRegistration(id, {
        status: 'rejected',
        rejectionReason: rejectionReason || null,
        ...(isPaid
          ? {
              paymentStatus:
                refundDecision === 'refunded' ? ('refunded' as const) : ('rejected' as const),
            }
          : {}),
      })
    } else {
      await updateWebinarRegistration(id, { status: 'pending' })
    }

    await logAdminAction({
      action: 'webinar_registration.update',
      resourceType: 'webinarRegistration',
      resourceId: id,
      actor: admin,
      request,
      details: {
        status,
        notify,
        paymentVerified: isPaid ? paymentVerified : null,
        refundDecision: refundDecision ?? null,
        receiptNumber,
      },
    })

    // Notifications go through the approval outbox. An admin action is the
    // approval, but only when `notify` is true.
    if (notify && (status === 'confirmed' || status === 'rejected')) {
      const templateData = {
        fullName: registration.fullName,
        webinarTitle: registration.webinarTitle,
        webinarDate: registration.webinarDate ?? webinar?.date ?? '',
        webinarTime: registration.webinarTime ?? webinar?.time ?? '',
        webinarSpeaker: webinar?.speaker,
        webinarDuration: webinar?.duration,
        webinarType: registration.webinarType,
        meetingLink: status === 'confirmed' ? webinar?.meetingLink ?? undefined : undefined,
        registrationStatus: status,
        registrationNumber: registration.registrationNumber,
        transactionNumber: registration.transactionNumber,
        receiptNumber: receiptNumber ?? undefined,
        amount,
      }

      try {
        await enqueueEmail({
          dedupeKey: `webinar-confirmation:${id}:${status}`,
          template: 'webinar-confirmation',
          to: { email: registration.email, name: registration.fullName },
          templateData,
          source: { collection: 'webinarRegistrations', id },
          requestedBy: {
            type: 'admin',
            uid: admin.uid,
            email: admin.email,
          },
          approvedBy: { uid: admin.uid, email: admin.email },
        })
      } catch (queueError) {
        console.error('Failed to queue webinar notification:', queueError)
      }
    }

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: `Registration marked as ${status}`,
      receiptNumber,
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
  const admin = auth as { uid: string; email: string | null }

  // CSRF protection for mutating requests (parity with the certificates [id]
  // endpoints).
  const csrfError = withCsrfProtection(request)
  if (csrfError) {
    return withSecurityHeaders(csrfError)
  }

  try {
    await deleteWebinarRegistration(id)

    await logAdminAction({
      action: 'webinar_registration.delete',
      resourceType: 'webinarRegistration',
      resourceId: id,
      actor: admin,
      request,
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Registration deleted successfully',
    }))
  } catch (error) {
    console.error('Error deleting webinar registration:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 }))
  }
}