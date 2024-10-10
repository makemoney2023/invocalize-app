import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { Lead } from "@/hooks/useLeadsData";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

export async function sendCallSummaryEmail(lead: Lead) {
  console.log('sendCallSummaryEmail: Starting to send email for lead', lead.id)
  const sentFrom = new Sender("noreply@yourdomain.com", "Your App Name");
  const recipients = [new Recipient(lead.email)];

  const callDate = new Date(lead.created_at).toLocaleString();
  const emailContent = `
    <h1>Call Summary</h1>
    <p><strong>Date and Time:</strong> ${callDate}</p>
    <p><strong>Duration:</strong> ${lead.call_length ? `${lead.call_length.toFixed(2)} min` : 'N/A'}</p>
    <h2>Summary</h2>
    <p>${lead.summary}</p>
    <h2>Transcript</h2>
    <div>
      ${lead.concatenated_transcript
        ? `<p>${lead.concatenated_transcript}</p>`
        : '<p>No transcript available</p>'
      }
    </div>
  `;

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(`Call Summary - ${callDate}`)
    .setHtml(emailContent);

  try {
    console.log('sendCallSummaryEmail: Attempting to send email')
    await mailerSend.email.send(emailParams);
    console.log('sendCallSummaryEmail: Email sent successfully for lead', lead.id)
    return true;
  } catch (error) {
    console.error('sendCallSummaryEmail: Error sending email for lead', lead.id, error);
    return false;
  }
}
