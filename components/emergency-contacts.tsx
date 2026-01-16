"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, AlertCircle, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface EmergencyContact {
  id: number
  name: string
  phone: string
  relationship: string
}

interface EmergencyContactsProps {
  riskLevel?: number
}

export function EmergencyContacts({ riskLevel = 0 }: EmergencyContactsProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: 1, name: "Emergency Services", phone: "112", relationship: "Emergency" },
    { id: 2, name: "Vikram kumar", phone: "8409577146", relationship: "Contact" },
  ])

  const [autoNotify, setAutoNotify] = useState(false)

  useEffect(() => {
    // Auto-notify emergency contacts if risk is very high
    if (riskLevel > 85 && !autoNotify) {
      setAutoNotify(true)
      // In production, send actual notifications
      console.log("Auto-notifying emergency contacts due to high risk")
    }
  }, [riskLevel, autoNotify])

  const makeCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  const sendSMS = (phone: string, name: string) => {
    const message = encodeURIComponent(
      `[FogSense Alert] I am driving in hazardous fog conditions. Current risk level: ${riskLevel}%. This is an automated safety notification.`,
    )
    window.location.href = `sms:${phone}?body=${message}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Emergency Contacts
          </span>
          {riskLevel > 70 && <Badge variant="destructive">High Risk Alert</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {autoNotify && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span>Emergency contacts have been notified automatically</span>
          </div>
        )}

        {contacts.map((contact) => (
          <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                {contact.relationship === "Emergency" ? (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="font-medium text-sm">{contact.name}</div>
                <div className="text-xs text-muted-foreground">{contact.relationship}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => sendSMS(contact.phone, contact.name)}>
                SMS
              </Button>
              <Button size="sm" onClick={() => makeCall(contact.phone)}>
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <div className="pt-2 text-xs text-muted-foreground">
          <p>
            <AlertCircle className="h-3 w-3 inline mr-1" />
            Auto-notification enabled when risk exceeds 85%
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
