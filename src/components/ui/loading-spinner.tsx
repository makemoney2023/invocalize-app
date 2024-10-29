import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type LoadingSpinnerProps = {
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8"
}

export function LoadingSpinner({ 
  className = '' 
}: LoadingSpinnerProps) {
  return (
    <div 
      className={`animate-spin rounded-full border-2 border-primary border-t-transparent h-4 w-4 ${className}`} 
      role="progressbar"
      aria-label="Loading"
    />
  )
}
