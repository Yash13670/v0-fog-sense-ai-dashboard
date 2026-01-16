"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Radio, MapPin, Clock, Loader2 } from "lucide-react"

interface Report {
  id: string
  user: string
  message: string
  location: string
  latitude: number
  longitude: number
  severity: "low" | "medium" | "high"
  timestamp: number
  distance?: number
}

interface CommunityReportsProps {
  locationLabel?: string
  latitude?: number | null
  longitude?: number | null
}

const severityStyles: Record<Report["severity"], string> = {
  low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-red-100 text-red-700 border-red-200",
}

const sampleUsers = ["Priya", "Rohan", "Alex", "Mia", "David", "Sara"]
const sampleMessages = [
  "Heavy fog reported, visibility very low",
  "Accident on main highway, proceed cautiously",
  "Roadside hazard spotted near divider",
  "Slow traffic due to dense fog ahead",
  "Emergency vehicles present, keep distance",
  "Patches of low visibility, drive slow",
]

// Sample locations with coordinates (around San Francisco Bay Area)
const sampleLocations = [
  { name: "Golden Gate Bridge", lat: 37.8199, lon: -122.4783 },
  { name: "Bay Bridge", lat: 37.7973, lon: -122.3898 },
  { name: "Highway 101 North", lat: 37.7849, lon: -122.408 },
  { name: "Highway 280 South", lat: 37.759, lon: -122.428 },
  { name: "Eastshore Freeway", lat: 37.825, lon: -122.285 },
  { name: "I-880 Downtown", lat: 37.8046, lon: -122.2708 },
]

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function CommunityReports({ locationLabel = "Current Area", latitude = 37.7749, longitude = -122.4194 }: CommunityReportsProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [newLocation, setNewLocation] = useState("")
  const [newSeverity, setNewSeverity] = useState<Report["severity"]>("medium")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch real incidents from Google Places API
  useEffect(() => {
    const fetchIncidents = async () => {
      if (!latitude || !longitude) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const response = await fetch(
          `/api/community-incidents?lat=${latitude}&lon=${longitude}&radius=5000`
        )
        const data = await response.json()

        if (data.incidents) {
          const formattedReports = data.incidents.map((incident: any) => ({
            id: incident.id,
            user: incident.user,
            message: incident.message,
            location: incident.location,
            latitude: incident.latitude,
            longitude: incident.longitude,
            severity: incident.severity,
            timestamp: incident.timestamp,
            distance: incident.distance,
          }))
          setReports(formattedReports)
        }
      } catch (error) {
        console.error("Failed to fetch community incidents:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchIncidents()
    // Refresh every 30 seconds
    const interval = setInterval(fetchIncidents, 30000)
    return () => clearInterval(interval)
  }, [latitude, longitude])

  const handleSubmit = () => {
    if (!newMessage.trim()) return
    setIsSubmitting(true)
    
    // Add user report to the list
    const userReport: Report = {
      id: `user-${Date.now()}`,
      user: "You",
      message: newMessage.trim(),
      location: newLocation.trim() || locationLabel,
      latitude: latitude || 37.7749,
      longitude: longitude || -122.4194,
      severity: newSeverity,
      timestamp: Date.now(),
      distance: 0,
    }
    
    setReports((prev) => [userReport, ...prev])
    setNewMessage("")
    setIsSubmitting(false)
  }

  const sortedReports = useMemo(() => {
    return reports.sort((a, b) => (a.distance || 0) - (b.distance || 0))
  }, [reports])

  const counts = useMemo(() => {
    return reports.reduce(
      (acc, r) => {
        acc[r.severity] += 1
        return acc
      },
      { low: 0, medium: 0, high: 0 },
    )
  }, [reports])

  const renderSeverity = (severity: Report["severity"]) => {
    const label = severity === "low" ? "Low" : severity === "medium" ? "Medium" : "High"
    return <Badge className={`${severityStyles[severity]} text-xs px-2 py-1 border`}>{label}</Badge>
  }

  return (
    <Card className="border-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Community Reports</CardTitle>
          <Badge variant="outline" className="text-xs">Live</Badge>
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-red-500" />{counts.high}</span>
          <span className="flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-amber-500" />{counts.medium}</span>
          <span className="flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-emerald-500" />{counts.low}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Input
              placeholder="Location name"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />
            <Textarea
              placeholder="Share what you see (fog, accidents, hazards)"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={3}
            />
            <div className="flex items-center gap-2">
              <select
                className="flex-1 rounded-md border px-3 py-2 text-sm"
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as Report["severity"])}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <Button onClick={handleSubmit} disabled={isSubmitting || !newMessage.trim()}>
                Submit Report
              </Button>
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
            <div className="font-semibold text-foreground">📡 Live API Data</div>
            <ul className="list-disc list-inside space-y-1">
              <li>Real incidents from Google Maps API</li>
              <li>Police, hospitals, safe stops nearby</li>
              <li>Sorted by distance from you</li>
              <li>Updates every 30 seconds</li>
              <li>Add your own reports anytime</li>
            </ul>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading nearby incidents...
          </div>
        ) : (
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {sortedReports.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No reports in this area yet
              </div>
            ) : (
              sortedReports.map((report) => (
                <div
                  key={report.id}
                  className="border rounded-lg p-3 bg-background/60 hover:shadow-sm transition flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <MapPin className="h-4 w-4 text-primary" /> {report.location}
                      {report.distance !== undefined && (
                        <Badge variant="secondary" className="text-xs ml-1">{report.distance.toFixed(1)} km away</Badge>
                      )}
                    </div>
                    {renderSeverity(report.severity)}
                  </div>
                  <div className="text-sm text-foreground leading-tight">{report.message}</div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{report.user}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(report.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
