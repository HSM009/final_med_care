import { Link } from '@tanstack/react-router'
import { Button, buttonVariants } from '../ui/button'
import { ThemeToggle } from './theme-toggle'
import { authClient } from '@/lib/auth-client'
import { useHandleSignOut } from '@/lib/types'

export function Navbar() {
  const { data: session, isPending } = authClient.useSession()
  const handleSignOut = useHandleSignOut()
  return (
    <nav className="sticky top-0 z-50 border-b-3 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTydpJyThu1vbNz_lAj5hNkqbJMdgb_lqK_2g&s"
            alt="HSM Logo"
            className="size-10"
          />
          <h1 className="text-lg font-semibold ">Hosein Sirat Mohammad</h1>
        </div>
        <div className=" flex items-center gap-3">
          <ThemeToggle />
          {isPending ? null : session ? (
            <>
              <Button
                onClick={handleSignOut}
                variant={'destructive'}
                className=" cursor-pointer"
              >
                Logout
              </Button>
              <Link
                to="/dashboard"
                className={buttonVariants({ variant: 'default' })}
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={buttonVariants({ variant: 'secondary' })}
              >
                Login
              </Link>
              <Link
                to="/signUp"
                className={buttonVariants({ variant: 'default' })}
              >
                Getting Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
