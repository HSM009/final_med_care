import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CheckIcon } from 'lucide-react'
import { dosageTime } from '@/data/dosageTime'

interface DosageSwitcherProps {
  value: string
  onChange: (newTime: string) => void
}

export default function DropdownMenuDosageSwitcher({
  value,
  onChange,
}: DosageSwitcherProps) {
  const current = dosageTime.find((d) => d.time === value) || dosageTime[0]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-secondary flex items-center gap-2 rounded-lg px-6 py-2.5">
        <div className="flex flex-col gap-1 text-start leading-none">
          <span className="max-w-[17ch] truncate text-sm leading-none font-semibold">
            {current.time}
          </span>
          <span className="text-muted-foreground max-w-[26ch] truncate text-xs rtl:text-right">
            {current.uTime}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-66">
        {dosageTime.map((dt) => (
          <DropdownMenuItem key={dt.id} onClick={() => onChange(dt.time)}>
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1 text-start leading-none">
                <span className="max-w-[17ch] truncate text-sm leading-none font-semibold">
                  {dt.time}
                </span>
                <span className="text-muted-foreground max-w-[26ch] truncate text-xs rtl:text-right">
                  {dt.uTime}
                </span>
              </div>
            </div>
            {value === String(dt.id) && <CheckIcon className="ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
