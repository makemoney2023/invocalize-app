'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function SettingsTabContent() {
  const [settings, setSettings] = useState({
    emailTemplate: '',
    apiEndpoint: '',
    maxRetries: '3'
  })

  const handleSave = async () => {
    // Implementation for saving settings
    console.log('Saving settings:', settings)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>API Endpoint</Label>
            <Input
              value={settings.apiEndpoint}
              onChange={(e) => 
                setSettings(prev => ({ ...prev, apiEndpoint: e.target.value }))
              }
              placeholder="https://api.example.com/analyze"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Email Template</Label>
            <Input
              value={settings.emailTemplate}
              onChange={(e) => 
                setSettings(prev => ({ ...prev, emailTemplate: e.target.value }))
              }
              placeholder="Template name"
            />
          </div>

          <div className="space-y-2">
            <Label>Max Retries</Label>
            <Input
              type="number"
              value={settings.maxRetries}
              onChange={(e) => 
                setSettings(prev => ({ ...prev, maxRetries: e.target.value }))
              }
              min="1"
              max="5"
            />
          </div>

          <Separator className="my-4" />

          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
