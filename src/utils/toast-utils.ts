import { toast } from 'sonner'

export const showErrorToast = (error: unknown) => {
  if (error instanceof Error) {
    toast.error(error.message)
  } else {
    toast.error("An unexpected error occurred")
  }
}

export const showSuccessToast = (message: string) => {
  toast.success(message)
}

export const showInfoToast = (message: string) => {
  toast.info(message)
}
