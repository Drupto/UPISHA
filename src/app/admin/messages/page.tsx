'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Mail } from 'lucide-react'

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Messages</h1>
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Contact messages management - implementation pending</p>
        </CardContent>
      </Card>
    </div>
  )
}
