import { NextResponse } from 'next/server'
import { EmailService } from '@/services/emailService'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const emailService = new EmailService()
    
    const result = await emailService.sendEmail({
      to: body.to,
      subject: body.subject,
      html: body.html
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
