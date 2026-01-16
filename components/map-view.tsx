"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, AlertTriangle, AlertCircle } from "lucide-react"

interface MapViewProps {
  latitude: number | null
  longitude: number | null
  fogLevel?: "none" | "medium" | "dense"
  visibility?: number
  location?: string
}

declare global {
  interface Window {
    google: any
  }
}

export function MapView({ latitude, longitude, fogLevel = "none", visibility = 10000, location = "Current Location" }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!latitude || !longitude || !mapRef.current) return

    const loadGoogleMaps = () => {
      if (typeof window !== "undefined" && !window.google) {
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
        script.async = true
        script.onload = () => {
          initializeMap()
        }
        document.head.appendChild(script)
      } else if (window.google) {
        initializeMap()
      }
    }

    const initializeMap = () => {
      if (!mapRef.current) return

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: { lat: latitude, lng: longitude },
        mapTypeId: "roadmap",
        styles: [
          {
            featureType: "all",
            elementType: "all",
            stylers: [{ saturation: -100 + (fogLevel === "dense" ? -30 : 0) }],
          },
        ],
      })

      // Add current location marker
      const marker = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: mapInstance,
        title: location,
        icon: getFogIcon(fogLevel),
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; font-family: Arial, sans-serif; max-width: 250px; background: white; color: black;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #000;">${location}</h3>
            <p style="margin: 4px 0; font-size: 12px; color: #333;"><strong>Fog Level:</strong> <span style="color: ${fogLevel === "dense" ? "#dc2626" : fogLevel === "medium" ? "#f59e0b" : "#10b981"}; font-weight: bold;">${fogLevel.toUpperCase()}</span></p>
            <p style="margin: 4px 0; font-size: 12px; color: #333;"><strong>Visibility:</strong> ${visibility}m</p>
            <p style="margin: 4px 0; font-size: 12px; color: #333;"><strong>Coordinates:</strong> ${latitude.toFixed(4)}, ${longitude.toFixed(4)}</p>
          </div>
        `,
      })

      marker.addListener("click", () => {
        infoWindow.open(mapInstance, marker)
      })

      setMap(mapInstance)
      fetchRealIncidents(mapInstance, latitude, longitude)
      setLoading(false)
    }

    loadGoogleMaps()
  }, [latitude, longitude, fogLevel, visibility, location])

  const fetchRealIncidents = async (mapInstance: any, lat: number, lon: number) => {
    try {
      console.log("[MapView] Fetching real incidents for:", { lat, lon })
      const response = await fetch(`/api/community-incidents?lat=${lat}&lon=${lon}&radius=5000`)
      const data = await response.json()

      if (data.incidents && Array.isArray(data.incidents)) {
        console.log("[MapView] Received", data.incidents.length, "real incidents")
        
        data.incidents.forEach((incident: any) => {
          const marker = new window.google.maps.Marker({
            position: { lat: incident.latitude, lng: incident.longitude },
            map: mapInstance,
            title: incident.message,
            icon: getSeverityIcon(incident.severity),
          })

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; font-family: Arial, sans-serif; max-width: 200px; background: white; color: black;">
                <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #000;">${incident.message}</h4>
                <p style="margin: 4px 0; font-size: 11px; color: #333;"><strong>Severity:</strong> <span style="color: ${incident.severity === "high" ? "#dc2626" : incident.severity === "medium" ? "#f59e0b" : "#10b981"}; font-weight: bold;">${incident.severity.toUpperCase()}</span></p>
                <p style="margin: 4px 0; font-size: 11px; color: #333;"><strong>Distance:</strong> ${incident.distance.toFixed(2)}km away</p>
              </div>
            `,
          })

          marker.addListener("click", () => {
            infoWindow.open(mapInstance, marker)
          })
        })

        setIncidents(data.incidents)
      } else {
        console.warn("[MapView] No incidents in response")
        setIncidents([])
      }
    } catch (error) {
      console.error("[MapView] Error fetching real incidents:", error)
      setIncidents([])
    }
  }

  const getSeverityIcon = (severity: string) => {
    const icons: Record<string, string> = {
      high: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      medium: "http://maps.google.com/mapfiles/ms/icons/orange-dot.png",
      low: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
    }
    return icons[severity] || "http://maps.google.com/mapfiles/ms/icons/gray-dot.png"
  }

  const getFogIcon = (level: string) => {
    const colors: Record<string, string> = {
      none: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
      medium: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
      dense: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    }
    return colors[level] || colors.none
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Live Location Map
          </span>
          {fogLevel !== "none" && (
            <Badge variant={fogLevel === "dense" ? "destructive" : "secondary"}>
              {fogLevel === "dense" ? "Dense Fog" : "Moderate Fog"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Real-time location with incidents and fog overlay</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div ref={mapRef} className="w-full h-[400px] rounded-lg border border-gray-200" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-gray-700">📍 Current Location</p>
              <p className="text-sm font-bold text-gray-900">{location}</p>
              <p className="text-xs text-gray-600 mt-1">{latitude?.toFixed(4)}, {longitude?.toFixed(4)}</p>
            </div>

            <div className={`p-3 rounded-lg border ${fogLevel === "dense" ? "bg-red-50 border-red-200" : fogLevel === "medium" ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"}`}>
              <p className="text-xs font-semibold text-gray-700">☁️ Fog Status</p>
              <p className={`text-sm font-bold capitalize ${fogLevel === "dense" ? "text-red-700" : fogLevel === "medium" ? "text-yellow-700" : "text-green-700"}`}>{fogLevel}</p>
              <p className="text-xs text-gray-600 mt-1">Visibility: {visibility}m</p>
            </div>
          </div>

          {incidents.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Real Nearby Incidents ({incidents.length})
              </h4>
              <div className="space-y-2">
                {incidents.map((incident, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-800">{incident.message}</p>
                      <p className="text-xs text-gray-600 mt-1">{incident.distance?.toFixed(2) || 0}km away</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-white text-xs font-bold ${incident.severity === "high" ? "bg-red-500" : incident.severity === "medium" ? "bg-yellow-500" : "bg-green-500"}`}>
                      {incident.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
