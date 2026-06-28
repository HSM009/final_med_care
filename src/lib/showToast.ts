import { toast, type ExternalToast } from 'sonner'
import React from 'react'

type ToastType = 'success' | 'info' | 'warning' | 'error'

const getToastStyle = (type: ToastType): React.CSSProperties => {
  const configs = {
    success: { light: '#16a34a', dark: '#4ade80' },
    info: { light: '#0284c7', dark: '#38bdf8' },
    warning: { light: '#d97706', dark: '#fbbf24' },
    error: { light: 'var(--destructive)', dark: 'var(--destructive)' },
  }
  const { light, dark } = configs[type]
  return {
    '--normal-bg': `color-mix(in oklab, light-dark(${light}, ${dark}) 10%, var(--background))`,
    '--normal-text': `light-dark(${light}, ${dark})`,
    '--normal-border': `light-dark(${light}, ${dark})`,
  } as React.CSSProperties
}

// ✅ Merge our custom styles with any incoming Sonner options (like id)
export const showToast = {
  success: (msg: string, options?: ExternalToast) =>
    toast.success(msg, { ...options, style: getToastStyle('success') }),

  info: (msg: string, options?: ExternalToast) =>
    toast.info(msg, { ...options, style: getToastStyle('info') }),

  warning: (msg: string, options?: ExternalToast) =>
    toast.warning(msg, { ...options, style: getToastStyle('warning') }),

  error: (msg: string, options?: ExternalToast) =>
    toast.error(msg, { ...options, style: getToastStyle('error') }),
}
