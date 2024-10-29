import { Badge } from '@/components/ui/badge'

type CallStatus = 'completed' | 'in-progress' | 'failed' | 'pending'

interface CallStatusBadgeProps {
  status?: string
}

const statusVariants: Record<CallStatus, "default" | "destructive" | "secondary" | "outline"> = {
  'completed': 'default',
  'in-progress': 'secondary',
  'failed': 'destructive',
  'pending': 'outline'
}

export function CallStatusBadge({ status = 'pending' }: CallStatusBadgeProps) {
  const variant = statusVariants[status as CallStatus] || statusVariants.pending
  
  return (
    <Badge variant={variant}>
      {status.replace('-', ' ')}
    </Badge>
  )
}
