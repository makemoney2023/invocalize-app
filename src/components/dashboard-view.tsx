'use client'

import { useUser } from '@clerk/nextjs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { RecentCallsList } from '@/components/recent-calls-list'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useState } from 'react'
import { useLeadsData } from '@/hooks/useLeadsData'
import type { Lead } from '@/types/lead'

export default function DashboardView() {
  const { user, isLoaded } = useUser()
  const { leads, loading } = useLeadsData()
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {user.firstName}</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentCallsList 
              leads={leads} 
              onSelectLead={(id) => setSelectedLeadId(id)} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
