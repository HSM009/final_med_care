import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/web/Navbar'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="">
      <Navbar />
    </div>
  )
}
