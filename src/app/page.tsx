import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import DashboardView from "@/components/dashboard-view";

export default async function Home() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <main className="container mx-auto py-6">
      <DashboardView />
    </main>
  )
}
