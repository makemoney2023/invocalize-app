import { Resend } from 'resend';
import { ENV } from '../env';

let resend: Resend | undefined;

if (ENV.RESEND_API_KEY) {
  resend = new Resend(ENV.RESEND_API_KEY);
}

export { resend };

// Function to check if Resend is configured
export function requireResend(): Resend {
  if (!resend) {
    throw new Error('Resend is not configured. Please set RESEND_API_KEY environment variable.');
  }
  return resend;
}

export const EMAIL_CONFIG = {
  FROM_EMAIL: ENV.EMAIL_FROM || 'no-reply@yourdomain.com',
  FROM_NAME: ENV.EMAIL_FROM_NAME || 'Your App Name',
} as const;
