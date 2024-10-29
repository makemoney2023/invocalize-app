import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/services/emailService';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const requestSchema = z.object({
  leadId: z.string()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId } = requestSchema.parse(body);
    
    const supabase = createClient();
    
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*, call_analyses(*)')
      .eq('id', leadId)
      .single();

    if (error || !lead) {
      return NextResponse.json(
        { error: 'Failed to fetch lead data' },
        { status: 404 }
      );
    }

    if (!lead.email) {
      return NextResponse.json(
        { error: 'Lead has no email address' },
        { status: 400 }
      );
    }

    if (!lead.call_analyses?.length) {
      return NextResponse.json(
        { error: 'No analysis available' },
        { status: 400 }
      );
    }

    const emailService = EmailService.getInstance();
    const latestAnalysis = lead.call_analyses[lead.call_analyses.length - 1];
    
    await emailService.sendCallSummaryEmail(lead, latestAnalysis);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
