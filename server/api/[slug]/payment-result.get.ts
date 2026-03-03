// server/api/[slug]/payment-result.get.ts
import type { Booking } from '~/types'

interface MoyasarPaymentResponse {
  id: string
  status: string
  message: string | null
  metadata: {
    booking_id?: string
    tenant_id?: string
  }
}

interface PaymentResultResponse {
  status: 'paid' | 'failed' | 'unknown'
  booking: Booking | null
  message: string | null
}

export default defineEventHandler(async (event): Promise<PaymentResultResponse> => {
  const { paymentId } = getQuery(event) as { paymentId?: string }

  if (!paymentId) throw createError({ statusCode: 400, statusMessage: 'paymentId is required' })

  const tenantId = event.context.tenantId as string | undefined
  if (!tenantId) throw createError({ statusCode: 404 })

  const paymentSettings = await getPaymentSettings(event, tenantId)
  if (!paymentSettings.isConnected || !paymentSettings.encryptedSecretKey) {
    throw createError({ statusCode: 422, statusMessage: 'Payment not configured for this salon' })
  }

  const secretKey = decrypt(paymentSettings.encryptedSecretKey)
  const credentials = Buffer.from(`${secretKey}:`).toString('base64')

  let moyasarPayment: MoyasarPaymentResponse
  try {
    moyasarPayment = await $fetch<MoyasarPaymentResponse>(
      `https://api.moyasar.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Basic ${credentials}` } },
    )
  }
  catch {
    throw createError({ statusCode: 422, statusMessage: 'Could not verify payment with Moyasar' })
  }

  if (moyasarPayment.metadata?.tenant_id !== tenantId) {
    throw createError({ statusCode: 403, statusMessage: 'Payment does not belong to this salon' })
  }

  const bookingId = moyasarPayment.metadata?.booking_id
  const booking = bookingId ? await getBookingById(event, tenantId, bookingId) : null

  const status: PaymentResultResponse['status'] =
    moyasarPayment.status === 'paid' ? 'paid'
    : moyasarPayment.status === 'failed' ? 'failed'
    : 'unknown'

  return { status, booking, message: moyasarPayment.message }
})
