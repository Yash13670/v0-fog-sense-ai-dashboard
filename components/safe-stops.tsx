"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Fuel, ParkingCircle, Hotel, Navigation2 } from "lucide-react"
import { useEffect, useState } from "react"

interface SafeStop {
  id: number
  name: string
  type: string
  distance: number
  address: string
  open24h?: boolean
  amenities?: string[]
  lat: number
  lon: number
}

interface SafeStopsProps {
  latitude: number | null
  longitude: number | null
  visibility?: number
}

export function SafeStops({ latitude, longitude, visibility = 10000 }: SafeStopsProps) {
  const [safeStops, setSafeStops] = useState<SafeStop[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (latitude && longitude) {
      fetchSafeStops()
    }
  }, [latitude, longitude])

  const fetchSafeStops = async () => {
    if (!latitude || !longitude) return

    setLoading(true)
    try {
      const response = await fetch(`/api/safe-stops?lat=${latitude}&lon=${longitude}&radius=5000`)
      const data = await response.json()
      
      // Filter safe stops based on visibility
      let filteredStops = data.safeStops || []
      
      // If visibility is poor, prioritize closer stops
      if (visibility < 1000) {
        filteredStops = filteredStops.filter((stop: SafeStop) => stop.distance <= 2)
      } else if (visibility < 5000) {
        filteredStops = filteredStops.filter((stop: SafeStop) => stop.distance <= 3)
      }
      
      // Sort by distance
      filteredStops.sort((a: SafeStop, b: SafeStop) => a.distance - b.distance)
      
      setSafeStops(filteredStops)
    } catch (error) {
      console.error("Failed to fetch safe stops:", error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "fuel":
        return <Fuel className="h-4 w-4" />
      case "parking":
        return <ParkingCircle className="h-4 w-4" />
      case "hotel":
        return <Hotel className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const openDirections = (lat: number, lon: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, "_blank")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Nearby Safe Stops
          </span>
          {visibility && (
            <Badge variant={visibility < 1000 ? "destructive" : visibility < 5000 ? "secondary" : "default"}>
              Visibility: {visibility}m
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading safe stops...</p>
        ) : safeStops.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {visibility < 1000 ? "Poor visibility - ensure closer stops are available" : "No safe stops found nearby"}
          </p>
        ) : (
          <div className="space-y-3">
            {safeStops.slice(0, 4).map((stop) => (
              <div
                key={stop.id}
                className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex gap-3">
                  <div className="mt-1">{getIcon(stop.type)}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{stop.name}</div>
                    <div className="text-xs text-muted-foreground">{stop.address}</div>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {stop.distance.toFixed(1)} km
                      </Badge>
                      {stop.open24h && (
                        <Badge variant="secondary" className="text-xs">
                          24/7
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openDirections(stop.lat, stop.lon)}
                  className="shrink-0"
                >
                  <Navigation2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
