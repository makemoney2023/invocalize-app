import { toast as sonnerToast } from 'sonner'

type ToastType = 'success' | 'error' | 'info' | 'warning'

export const showToast = (
  message: string,
  type: ToastType = 'info',
  description?: string
) => {
  switch (type) {
    case 'success':
      sonnerToast.success(message, { description })
      break
    case 'error':
      sonnerToast.error(message, { description })
      break
    case 'warning':
      sonnerToast.warning(message, { description })
      break
    default:
      sonnerToast(message, { description })
  }
}

export const showErrorToast = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'An error occurred'
  showToast(message, 'error')
}

export const showSuccessToast = (message: string) => {
  showToast(message, 'success')
}

export const showInfoToast = (message: string) => {
  showToast(message, 'info')
}
