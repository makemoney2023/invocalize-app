import React from 'react';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { EmailTemplate } from '@/components/email-template';
import { Lead } from '@/types/lead';
import { render } from '@react-email/render';

// Check if RESEND_API_KEY is defined
const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.error('RESEND_API_KEY is not defined in environment variables');
  throw new Error('RESEND_API_KEY is missing');
}

const resend = new Resend(resendApiKey);

export async function POST(req: Request) {
  try {
    const lead: Lead = await req.json();
    console.log('Attempting to send email for lead:', lead.id);

    // Validate lead email
    if (!lead.email) {
      console.error(`Lead ${lead.id} does not have an email address`);
      return NextResponse.json(
        { error: 'Lead does not have an email address' },
        { status: 400 }
      );
    }

    // Render email content using @react-email/render
    const emailContent = render(<EmailTemplate lead={lead} />, { pretty: true });
    console.log('Email content rendered for lead:', lead.id);

    // Send email using Resend
    const response = await resend.emails.send({
      from: 'Invocalize <no-reply@invocalize.app>',
      to: [lead.email],
      subject: `Your Recent Call Summary - ${new Date(lead.created_at).toLocaleDateString()}`,
      html: await emailContent,
    });
    console.log('Resend response received:', response);

    return NextResponse.json(
      { message: 'Email sent successfully', response },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in send-email API route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
