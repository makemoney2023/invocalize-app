import { Lead } from '@/types/lead';

export async function sendCallSummaryEmail(lead: Lead) {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`;
    console.log('Sending POST request to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lead),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to send email: ${response.statusText} - ${errorData.error}`
      );
    }

    const result = await response.json();
    console.log('Email sent successfully', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
