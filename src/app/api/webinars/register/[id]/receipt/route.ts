import { NextRequest, NextResponse } from 'next/server'
import { withSecurityHeaders } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { ensureWebinarReceipt, webinarReceiptNumber } from '@/lib/webinar-receipts'
import { getReceiptByReceiptNumber } from '@/lib/firestore'

/**
 * Admin-only endpoint to inspect and (re)generate the payment receipt linked
 * to a webinar registration.
 *
 * GET  -> { exists, receiptNumber?, amount?, issuedAt? }
 * POST -> ensures a receipt exists (idempotent) and returns its details.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return withSecurityHeaders(auth)

  const { id } = await params
  try {
    const receipt = await getReceiptByReceiptNumber(webinarReceiptNumber(id))
    if (!receipt) {
      return withSecurityHeaders(NextResponse.json({ exists: false }))
    }
    return withSecurityHeaders(NextResponse.json({
      exists: true,
      receiptNumber: receipt.receiptNumber,
      amount: receipt.amount,
      currency: receipt.currency,
      issuedAt: receipt.issuedAt,
      status: receipt.status,
    }))
  } catch (error) {
    console.error('Error fetching webinar receipt:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch receipt' }, { status: 500 }))
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return withSecurityHeaders(auth)

  const { id } = await params
  try {
    const result = await ensureWebinarReceipt(id)
    if (result.skipped === 'not-found') {
      return withSecurityHeaders(NextResponse.json({ error: 'Registration not found' }, { status: 404 }))
    }
    if (result.skipped === 'not-paid') {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Receipts are only generated for paid webinar registrations' },
        { status: 400 }
      ))
    }
    if (!result.receipt) {
      return withSecurityHeaders(NextResponse.json({ error: 'Failed to generate receipt' }, { status: 500 }))
    }
    return withSecurityHeaders(NextResponse.json({
      success: true,
      created: result.created,
      receiptNumber: result.receipt.receiptNumber,
      amount: result.receipt.amount,
      currency: result.receipt.currency,
      issuedAt: result.receipt.issuedAt,
      status: result.receipt.status,
    }))
  } catch (error) {
    console.error('Error generating webinar receipt:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to generate receipt' }, { status: 500 }))
  }
}
