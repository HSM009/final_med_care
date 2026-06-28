import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { type NavUserProps } from '#/lib/types'
import { useState, type ReactNode } from 'react'
import { UserTemplateCard } from './userTemplateCard'
import {
  bannedUpdateSchema,
  cellNoUpdateSchema,
  emailUpdateSchema,
  emailVerifiedUpdateSchema,
  failedAttemptsUpdateSchema,
  qualificationUpdateSchema,
  roleUpdateSchema,
} from '#/schemas/auth'
interface ExtendedEditProps {
  data: NavUserProps
  children: ReactNode
}

export function EditUserDialog({ data, children }: ExtendedEditProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="inline-block ">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-4 max-h-[calc(85vh-130px)]">
            <DialogHeader>
              <DialogTitle className="mt-4 ml-4">Edit User</DialogTitle>
              <DialogDescription className=" ml-4">
                Modify the User details below.
              </DialogDescription>
            </DialogHeader>
            {data.editDialog === 1 ? (
              <>
                <UserTemplateCard
                  userId={data.userId}
                  Title={'qualification'}
                  currentData={data.userQualification}
                  validatorHandler={qualificationUpdateSchema}
                />
                <UserTemplateCard
                  userId={data.userId}
                  Title={'cell-No'}
                  currentData={data.userCellNo}
                  validatorHandler={cellNoUpdateSchema}
                />
                <UserTemplateCard
                  userId={data.userId}
                  Title={'email'}
                  currentData={data.userEmail}
                  sessionName={data.sessionName}
                  validatorHandler={emailUpdateSchema}
                />
                <UserTemplateCard
                  userId={data.userId}
                  Title={'role'}
                  currentData={data.userRole}
                  validatorHandler={roleUpdateSchema}
                />
              </>
            ) : data.editDialog === 2 ? (
              <>
                <UserTemplateCard
                  userId={data.userId}
                  Title={'email-Verified'}
                  currentData={data.userEmailVerified}
                  validatorHandler={emailVerifiedUpdateSchema}
                />
                <UserTemplateCard
                  userId={data.userId}
                  Title={'banned'}
                  currentData={data.userBanned}
                  validatorHandler={bannedUpdateSchema}
                />
                <UserTemplateCard
                  userId={data.userId}
                  Title={'failed-Attempts'}
                  currentData={data.userFailedAttempts}
                  validatorHandler={failedAttemptsUpdateSchema}
                />
              </>
            ) : (
              <>Do Nothing</>
            )}

            <DialogFooter className=" flex items-center">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="default"
                  className=" cursor-pointer"
                >
                  Done
                </Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
