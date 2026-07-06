import { toast, type ExternalToast } from 'sonner'
import React from 'react'

type ToastType = 'success' | 'info' | 'warning' | 'error' | 'loading'

const getToastStyle = (type: ToastType): React.CSSProperties => {
  const configs = {
    success: { light: '#16a34a', dark: '#4ade80' },
    info: { light: '#0284c7', dark: '#38bdf8' },
    warning: { light: '#d97706', dark: '#fbbf24' },
    error: { light: '#82181a', dark: '#82181a' },
    loading: { light: '#0284c7', dark: '#38bdf8' },
  }
  const { light, dark } = configs[type]
  return {
    '--normal-bg': `color-mix(in oklab, light-dark(${light}, ${dark}) 10%, transparent)`,
    '--normal-text': `light-dark(${light}, ${dark})`,
    '--normal-border': `light-dark(${light}, ${dark})`,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  } as React.CSSProperties
}

export const showToast = {
  success: (msg: string, options?: ExternalToast) =>
    toast.success(msg, { ...options, style: getToastStyle('success') }),

  info: (msg: string, options?: ExternalToast) =>
    toast.info(msg, { ...options, style: getToastStyle('info') }),

  warning: (msg: string, options?: ExternalToast) =>
    toast.warning(msg, { ...options, style: getToastStyle('warning') }),

  error: (msg: string, options?: ExternalToast) =>
    toast.error(msg, { ...options, style: getToastStyle('error') }),

  loading: (msg: string, options?: ExternalToast) =>
    toast.loading(msg, { ...options, style: getToastStyle('loading') }),
}
