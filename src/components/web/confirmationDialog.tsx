import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useConfirmState } from '#/hooks/confirm-context'

export function GlobalConfirmDialog() {
  const { state, onClose } = useConfirmState()

  return (
    <Dialog
      open={state.isOpen}
      onOpenChange={(open) => {
        if (!open) onClose(false)
      }}
    >
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {state.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {state.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onClose(false)}
            className="text-xs font-medium cursor-pointer"
          >
            {state.cancelText}
          </Button>
          <Button
            type="button"
            variant={state.variant}
            size="sm"
            onClick={() => onClose(true)}
            className="text-xs font-semibold min-w-19 cursor-pointer"
          >
            {state.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
