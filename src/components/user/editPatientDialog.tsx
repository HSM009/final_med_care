import { type EditUserProps } from '#/lib/types'
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
import { useState, type ReactNode } from 'react'
import { UserTemplateCard } from './userTemplateCard'
import {
  cellNoUpdateSchema,
  dobUpdateSchema,
  emailUpdateSchema,
  genderUpdateSchema,
  nameUpdateSchema,
} from '#/schemas/auth'

interface ExtendedEditProps {
  data: EditUserProps
  children: ReactNode
}

export function EditPatientDialog({ data, children }: ExtendedEditProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="inline-block">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="mt-2 ml-4">Edit User</DialogTitle>
            <DialogDescription className="ml-4">
              Modify the User details below.
            </DialogDescription>
          </DialogHeader>

          <UserTemplateCard
            userId={data.userId}
            Title={'name'}
            currentData={data.userName}
            validatorHandler={nameUpdateSchema}
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
            Title={'date-Of-Birth'}
            currentData={data.userDateOfBirth}
            validatorHandler={dobUpdateSchema}
          />
          <UserTemplateCard
            userId={data.userId}
            Title={'cell-No'}
            currentData={data.userCellNo}
            validatorHandler={cellNoUpdateSchema}
          />
          <UserTemplateCard
            userId={data.userId}
            Title={'gender'}
            currentData={data.gender}
            validatorHandler={genderUpdateSchema}
          />

          <DialogFooter className="flex items-center pt-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="default"
                className="cursor-pointer w-full sm:w-auto"
              >
                Done
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
