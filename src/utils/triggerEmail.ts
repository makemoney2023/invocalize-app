import { toast } from '@/components/ui/toast'
import { Logger } from '@/utils/logger'

export async function triggerEmailForLead(leadId: string): Promise<void> {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ leadId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send email')
    }

    toast.success('Email sent successfully')
  } catch (error) {
    Logger.log(
      error instanceof Error ? error.message : 'Failed to send email',
      'error'
    )
    throw error
  }
}
