import { createHmac } from 'crypto'
import { ENV } from '@/lib/env'

export function verifyWebhookSignature(
  signature: string | null,
  payload: any
): boolean {
  // If webhook secret is not configured, skip verification in development
  if (!ENV.RESEND_WEBHOOK_SECRET) {
    return process.env.NODE_ENV !== 'production'
  }

  if (!signature) {
    return false
  }

  const hmac = createHmac('sha256', ENV.RESEND_WEBHOOK_SECRET)
  const digest = hmac
    .update(JSON.stringify(payload))
    .digest('hex')

  return signature === digest
}
