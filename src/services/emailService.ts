import { Resend } from 'resend'
import { ENV } from '@/lib/env'
import { EmailResponse, emailResponseSchema } from '@/types/email'
import { Logger } from '@/utils/logger'
import { EmailStatus } from '@/types/email'
import { createClient } from '@/lib/supabase/client'
import type { Lead } from '@/types/lead'
import type { CallAnalysis } from '@/types/analysis'

// Add this at the top of the file
export class EmailError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message)
    this.name = 'EmailError'
  }
}

type ResendWebhookEvent = {
  type: EmailStatus
  data: {
    email_id: string
    created_at: string
    [key: string]: any
  }
}

type EmailParams = {
  to: string
  subject: string
  html: string
  from?: string
}

// Add the Resend types at the top
import type { CreateEmailResponse } from 'resend'

// Add type for Resend email response
type ResendEmailResponse = {
  id: string;
  from: string;
  to: string;
  created_at: string;
}

export class EmailService {
  private static instance: EmailService
  private resend: Resend
  private supabase = createClient()
  private defaultFrom: string

  private constructor() {
    if (typeof window !== 'undefined') {
      throw new Error('EmailService cannot be instantiated on the client side')
    }
    
    if (!ENV.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is required for EmailService')
    }

    if (!ENV.EMAIL_FROM) {
      throw new Error('EMAIL_FROM is required for EmailService')
    }

    this.resend = new Resend(ENV.RESEND_API_KEY)
    this.defaultFrom = ENV.EMAIL_FROM
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendCallSummaryEmail(lead: Lead, analysis: CallAnalysis): Promise<EmailResponse> {
    try {
      const response = await fetch('/api/render-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead, analysis })
      })

      if (!response.ok) {
        throw new Error('Failed to render email template')
      }

      const { html } = await response.json()

      const emailResult = await this.resend.emails.send({
        from: `${ENV.EMAIL_FROM_NAME} <${this.defaultFrom}>`,
        to: lead.email,
        subject: `Call Summary for ${lead.name}`,
        html
      })

      const emailId = typeof emailResult === 'object' && 'data' in emailResult 
        ? emailResult.data?.id 
        : undefined

      if (!emailId) {
        throw new EmailError('Failed to send email: No ID returned')
      }

      const emailResponse: EmailResponse = {
        id: emailId,
        from: this.defaultFrom,
        to: lead.email,
        subject: `Call Summary for ${lead.name}`,
        html,
        status: 'sent',
        createdAt: new Date().toISOString()
      }

      return emailResponse
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }

  async handleWebhookEvent(event: ResendWebhookEvent): Promise<void> {
    try {
      const { type, data } = event
      const { email_id } = data

      // Update email status in database
      const { error } = await this.supabase
        .from('emails')
        .update({
          status: type,
          updated_at: new Date().toISOString(),
          last_event: type
        })
        .eq('id', email_id)

      if (error) {
        throw new Error(`Failed to update email status: ${error.message}`)
      }

      // Log the event
      Logger.log(`Email ${email_id} status updated to ${type}`, 'info', {
        metadata: {
          emailId: email_id,
          status: type,
          eventData: data
        }
      })

      // Handle specific event types
      switch (type) {
        case 'bounced':
          await this.handleBouncedEmail(email_id)
          break
        case 'complained':
          await this.handleSpamComplaint(email_id)
          break
        case 'delivered':
          await this.updateDeliveryStats(email_id)
          break
      }
    } catch (error) {
      Logger.log(
        error instanceof Error ? error.message : 'Failed to handle webhook event',
        'error',
        { showToast: true }
      )
      throw error
    }
  }

  private async handleBouncedEmail(emailId: string): Promise<void> {
    const { data: email } = await this.supabase
      .from('emails')
      .select('lead_id, to_emails')
      .eq('id', emailId)
      .single()

    if (email) {
      await this.supabase
        .from('leads')
        .update({
          email_status: 'invalid',
          updated_at: new Date().toISOString()
        })
        .eq('id', email.lead_id)
    }
  }

  private async handleSpamComplaint(emailId: string): Promise<void> {
    const { data: email } = await this.supabase
      .from('emails')
      .select('lead_id')
      .eq('id', emailId)
      .single()

    if (email) {
      await this.supabase
        .from('leads')
        .update({
          email_status: 'unsubscribed',
          updated_at: new Date().toISOString()
        })
        .eq('id', email.lead_id)
    }
  }

  private async updateDeliveryStats(emailId: string): Promise<void> {
    // Implement delivery statistics tracking if needed
    // This could include updating success rates, delivery times, etc.
  }

  async sendEmail({ to, subject, html, from }: EmailParams) {
    try {
      const response = await this.resend.emails.send({
        from: from || this.defaultFrom,
        to,
        subject,
        html
      })
      return response
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }
}
