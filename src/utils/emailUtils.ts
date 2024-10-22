import type { Lead } from '@/types/lead';
import { EmailTemplate } from '@/components/email-template';
import { renderToString } from 'react-dom/server';

export const generateEmailContent = (lead: Lead): string => {
  return renderToString(EmailTemplate({ lead }));
};

export const sendEmail = async (lead: Lead): Promise<boolean> => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lead),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send email:', errorData.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

