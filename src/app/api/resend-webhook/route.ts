import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/services/emailService';
import { Logger } from '@/utils/logger';
import { verifyWebhookSignature } from '@/utils/webhookVerification';

const emailService = new EmailService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('resend-signature');

    // Verify webhook signature
    if (!verifyWebhookSignature(signature, body)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Handle the webhook event
    await emailService.handleWebhookEvent(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    Logger.log(
      error instanceof Error ? error.message : 'Webhook processing failed',
      'error',
      { showToast: true }
    );

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
