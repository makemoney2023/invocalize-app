import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/login')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Welcome to Invocalize</h1>
      {/* Your page content */}
    </main>
  )
}
