import { Lead, CallAnalysis } from '@/types/lead'
import DOMPurify from 'isomorphic-dompurify'

export async function generateEmailHtml(lead: Lead, analysis: CallAnalysis): Promise<string> {
  const sanitizedContent = DOMPurify.sanitize(analysis.content)

  return `
    <div>
      <h1>Call Summary for ${lead.name}</h1>
      <div>${sanitizedContent}</div>
      <p>Sentiment Score: ${analysis.sentiment}</p>
      <p>Analysis Date: ${new Date(analysis.created_at).toLocaleDateString()}</p>
    </div>
  `
}
