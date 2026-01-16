"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, BellOff, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface NotificationSystemProps {
  riskLevel: number
  fogLevel: "none" | "medium" | "dense"
}

export function NotificationSystem({ riskLevel, fogLevel }: NotificationSystemProps) {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission)
      setEnabled(Notification.permission === "granted")
    }
  }, [])

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission()
      setPermission(result)
      setEnabled(result === "granted")

      if (result === "granted") {
        new Notification("FogSense Notifications Enabled", {
          body: "You'll receive alerts about hazardous driving conditions",
          icon: "/icon.png",
        })
      }
    }
  }

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return

    // Send notification for high-risk conditions
    if (riskLevel > 70 && fogLevel !== "none") {
      sendNotification(
        "⚠️ High Risk Alert",
        `Dense fog detected. Risk level: ${riskLevel}%. Reduce speed and increase following distance.`,
        "high",
      )
    } else if (riskLevel > 50) {
      sendNotification(
        "⚡ Caution Alert",
        `Moderate fog conditions. Risk level: ${riskLevel}%. Drive carefully.`,
        "medium",
      )
    }
  }, [riskLevel, fogLevel, enabled])

  const sendNotification = (title: string, body: string, priority: "low" | "medium" | "high") => {
    if (enabled && "Notification" in window && Notification.permission === "granted") {
      const options: NotificationOptions = {
        body,
        icon: "/icon.png",
        badge: "/badge.png",
        tag: `fogsense-${priority}`,
        requireInteraction: priority === "high",
      }
      
      // Add vibration if supported (some browsers don't support this in TypeScript types)
      if (navigator.vibrate) {
        ;(options as any).vibrate = priority === "high" ? [200, 100, 200] : [100]
      }
      
      new Notification(title, options)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {enabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="font-medium text-sm">Alert Status</div>
            <div className="text-xs text-muted-foreground mt-1">
              {enabled ? "Receiving real-time safety alerts" : "Enable to get instant notifications"}
            </div>
          </div>
          {enabled ? (
            <Badge className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>

        {!enabled && (
          <Button onClick={requestPermission} className="w-full">
            <Bell className="h-4 w-4 mr-2" />
            Enable Notifications
          </Button>
        )}

        {enabled && (
          <div className="space-y-2 pt-2 border-t text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>High-risk fog zone alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Visibility warnings</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Route hazard updates</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
