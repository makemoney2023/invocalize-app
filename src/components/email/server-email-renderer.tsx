import { EmailTemplate } from './email-template'
import { renderToString } from 'react-dom/server'
import { Lead, CallAnalysis } from '@/types/lead'

export function renderEmailTemplate(lead: Lead, analysis: CallAnalysis): string {
  return renderToString(
    EmailTemplate({ lead, analysis })
  )
}
