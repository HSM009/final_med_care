import { createContext, useContext, useState, useCallback } from 'react'

interface ConfirmOptions {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

interface ConfirmContextType {
  confirm: (options?: ConfirmOptions) => Promise<boolean>
  state: ConfirmOptions & { isOpen: boolean }
  onClose: (value: boolean) => void
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmOptions & { isOpen: boolean }>({
    isOpen: false,
    title: 'Are you sure?',
    description: 'Please confirm you want to proceed.',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default',
  })

  // High-performance pointer to hold the active promise resolution handler
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null,
  )

  const confirm = useCallback((options?: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve) // Cache the resolver function
      setState({
        isOpen: true,
        title: options?.title ?? 'Are you sure?',
        description:
          options?.description ?? 'Please confirm you want to proceed.',
        confirmText: options?.confirmText ?? 'Confirm',
        cancelText: options?.cancelText ?? 'Cancel',
        variant: options?.variant ?? 'default',
      })
    })
  }, [])

  const onClose = useCallback(
    (value: boolean) => {
      setState((prev) => ({ ...prev, isOpen: false }))
      if (resolver) {
        resolver(value) // Resolve the awaited promise back to the component
        setResolver(null)
      }
    },
    [resolver],
  )

  return (
    <ConfirmContext.Provider value={{ confirm, state, onClose }}>
      {children}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context)
    throw new Error(
      'useConfirm must be utilized inside a ConfirmProvider block.',
    )
  return context.confirm
}

export function useConfirmState() {
  const context = useContext(ConfirmContext)
  if (!context)
    throw new Error(
      'useConfirmState must be utilized inside a ConfirmProvider block.',
    )
  return { state: context.state, onClose: context.onClose }
}
