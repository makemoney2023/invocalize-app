import { Resend } from 'resend';
import { ENV } from './config';
import { Lead, CallAnalysis } from '@/types/lead';
import { render } from '@react-email/render';
import { EmailTemplate } from '@/components/email/email-template';

const resend = new Resend(ENV.RESEND_API_KEY);

export const sendEmail = async (lead: Lead, analysis: CallAnalysis) => {
  // Await the render result to get the HTML string
  const htmlContent = await render(EmailTemplate({ lead, analysis }));

  return await resend.emails.send({
    from: `${ENV.EMAIL_FROM_NAME} <${ENV.EMAIL_FROM}>`,
    to: [lead.email],
    subject: `Call Summary - ${new Date(lead.created_at).toLocaleDateString()}`,
    html: htmlContent
  });
};
