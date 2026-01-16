"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Route, AlertTriangle, CheckCircle, Navigation, MapPin } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface RouteSafetyProps {
  currentLat: number | null
  currentLon: number | null
}

interface RouteAnalysis {
  safetyScore: number
  riskLevel: "low" | "medium" | "high"
  avgVisibility: number
  warnings: string[]
  recommendation: string
  estimatedDuration: number
  distance: number
  routePoints: any[]
}

export function RouteSafety({ currentLat, currentLon }: RouteSafetyProps) {
  const [analysis, setAnalysis] = useState<RouteAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [destination, setDestination] = useState("")
  const [destLat, setDestLat] = useState<number | null>(null)
  const [destLon, setDestLon] = useState<number | null>(null)

  const analyzeRoute = async () => {
    if (!currentLat || !currentLon) {
      alert("Current location not available")
      return
    }

    if (!destination || destLat === null || destLon === null) {
      alert("Please enter a destination location")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/route-safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: { lat: currentLat, lon: currentLon },
          destination: { lat: destLat, lon: destLon },
        }),
      })

      const data = await response.json()
      setAnalysis(data)
    } catch (error) {
      console.error("Route analysis failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetDestination = async () => {
    if (!destination) {
      alert("Please enter a destination address")
      return
    }

    try {
      // Use Google Geocoding API to convert address to coordinates
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBTRi9dAIZrsKL7115ROxIrRPKstQXyuco"
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${apiKey}`
      )
      const data = await response.json()

      if (data.status === "OK" && data.results.length > 0) {
        const location = data.results[0].geometry.location
        setDestLat(location.lat)
        setDestLon(location.lng)
      } else {
        alert("Unable to find location. Please try a different address.")
      }
    } catch (error) {
      console.error("Geocoding failed:", error)
      alert("Failed to geocode destination")
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "high":
        return "text-red-600"
      default:
        return ""
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "low":
        return <Badge className="bg-green-600">Low Risk</Badge>
      case "medium":
        return <Badge className="bg-yellow-600">Medium Risk</Badge>
      case "high":
        return <Badge variant="destructive">High Risk</Badge>
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          Route Safety Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold mb-2 block">Destination Location</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination (e.g., City, Address)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleSetDestination} variant="outline" size="sm">
                Set
              </Button>
            </div>
            {destLat && destLon && (
              <p className="text-xs text-green-600 mt-1">✓ Destination set to {destLat.toFixed(4)}, {destLon.toFixed(4)}</p>
            )}
          </div>
        </div>

        <Button onClick={analyzeRoute} disabled={loading || !currentLat || !currentLon || !destination} className="w-full">
          {loading ? "Analyzing..." : "Analyze Route"}
        </Button>

        {analysis && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Safety Score</div>
                <div className={`text-3xl font-bold ${getRiskColor(analysis.riskLevel)}`}>
                  {analysis.safetyScore}/100
                </div>
              </div>
              {getRiskBadge(analysis.riskLevel)}
            </div>

            <Progress value={analysis.safetyScore} className="h-2" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Distance</div>
                <div className="font-semibold">{analysis.distance} km</div>
              </div>
              <div>
                <div className="text-muted-foreground">Est. Duration</div>
                <div className="font-semibold">{analysis.estimatedDuration} min</div>
              </div>
              <div>
                <div className="text-muted-foreground">Avg Visibility</div>
                <div className="font-semibold">{analysis.avgVisibility}m</div>
              </div>
              <div>
                <div className="text-muted-foreground">Checkpoints</div>
                <div className="font-semibold">{analysis.routePoints.length}</div>
              </div>
            </div>

            {analysis.warnings.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  Warnings
                </div>
                <ul className="text-sm space-y-1">
                  {analysis.warnings.map((warning, idx) => (
                    <li key={idx} className="text-muted-foreground flex items-start gap-2">
                      <span className="text-yellow-600 mt-0.5">•</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3 bg-accent rounded-lg">
              <div className="text-sm font-medium mb-1 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Recommendation
              </div>
              <p className="text-sm text-muted-foreground">{analysis.recommendation}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
