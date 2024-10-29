import * as React from 'react'
import { Lead, CallAnalysis } from '@/types/lead'
import DOMPurify from 'isomorphic-dompurify'

interface EmailTemplateProps {
  lead: Lead
  analysis: CallAnalysis
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  lead,
  analysis,
}) => {
  const sanitizedContent = DOMPurify.sanitize(analysis.content)

  return (
    <div>
      <h1>Call Summary for {lead.name}</h1>
      <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      <p>Sentiment Score: {analysis.sentiment}</p>
      <p>Analysis Date: {new Date(analysis.created_at).toLocaleDateString()}</p>
    </div>
  )
}
