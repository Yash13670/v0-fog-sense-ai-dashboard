"use client"

import { useEffect, useState } from "react"
import { FogDetection } from "@/components/fog-detection"
import { RiskPrediction } from "@/components/risk-prediction"
import { DriverAlert } from "@/components/driver-alert"
import { DemoControls } from "@/components/demo-controls"
import { CameraUpload } from "@/components/camera-upload"
import { MapView } from "@/components/map-view"
import { SafeStops } from "@/components/safe-stops"
import { HistoricalData } from "@/components/historical-data"
import { RouteSafety } from "@/components/route-safety"
import { EmergencyContacts } from "@/components/emergency-contacts"
import { NotificationSystem } from "@/components/notification-system"
import { VisibilityTrends } from "@/components/visibility-trends"
import { RiskAssessment } from "@/components/risk-assessment"
import { WeeklyIncidentReport } from "@/components/weekly-report"
import { CommunityReports } from "@/components/community-reports"
import { MultiCameraSupport } from "@/components/multi-camera"
import { Cloud, Activity, Map, BarChart3, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useGeolocation } from "@/hooks/use-geolocation"
import { useVoiceAlerts } from "@/hooks/use-voice-alerts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type FogLevel = "none" | "medium" | "dense"
type RiskLevel = "LOW" | "MEDIUM" | "HIGH"
type TimeOfDay = "day" | "night"
type RoadType = "highway" | "city"

export default function Home() {
  const [useRealApis, setUseRealApis] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [weatherLocation, setWeatherLocation] = useState({ lat: 37.7749, lon: -122.4194 }) // Default: San Francisco
  const { toast } = useToast()
  const location = useGeolocation()
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const { alertDanger, alertWarning, alertInfo } = useVoiceAlerts({ enabled: voiceEnabled })
  const [activeTab, setActiveTab] = useState("dashboard")

  // Simulated weather data - visibility in meters
  const [visibility, setVisibility] = useState(800)
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("day")
  const [roadType, setRoadType] = useState<RoadType>("highway")

  // Derived states
  const [fogLevel, setFogLevel] = useState<FogLevel>("medium")
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("LOW")
  const [alert, setAlert] = useState<string>("")

  const [riskScore, setRiskScore] = useState<number>(0)
  const [reasoning, setReasoning] = useState<string>("")
  const [recommendedSpeed, setRecommendedSpeed] = useState<number>(50)

  const predictRiskWithAI = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/predict-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fogLevel,
          visibility,
          timeOfDay,
          roadType,
          weatherCondition: "fog",
        }),
      })

      const data = await response.json()

      if (data.useRuleBased) {
        // Calculate risk using rule-based logic
        let calculatedRiskLevel: RiskLevel = "LOW"
        let calculatedRiskScore = 0
        let calculatedSpeed = 80

        if (fogLevel === "dense" && timeOfDay === "night" && roadType === "highway") {
          calculatedRiskLevel = "HIGH"
          calculatedRiskScore = 85
          calculatedSpeed = 30
        } else if (fogLevel === "dense") {
          calculatedRiskLevel = "HIGH"
          calculatedRiskScore = 75
          calculatedSpeed = 40
        } else if (fogLevel === "medium" && timeOfDay === "night") {
          calculatedRiskLevel = "MEDIUM"
          calculatedRiskScore = 65
          calculatedSpeed = 50
        } else if (fogLevel === "medium") {
          calculatedRiskLevel = "MEDIUM"
          calculatedRiskScore = 50
          calculatedSpeed = 60
        } else {
          calculatedRiskLevel = "LOW"
          calculatedRiskScore = 20
          calculatedSpeed = 80
        }

        setRiskLevel(calculatedRiskLevel)
        setRiskScore(calculatedRiskScore)
        setReasoning(`Rule-based analysis: ${fogLevel} fog at ${timeOfDay} on ${roadType}`)
        setRecommendedSpeed(calculatedSpeed)

        if (calculatedRiskLevel === "HIGH") {
          setAlert("⚠️ Dense fog ahead – Reduce speed significantly, use fog lights, and increase following distance")
        } else if (calculatedRiskLevel === "MEDIUM") {
          setAlert("⚠ Moderate fog detected – Reduce speed and use headlights")
        } else {
          setAlert("✓ Clear conditions – Drive safely and stay alert")
        }

        toast({
          title: "Using Rule-Based Analysis",
          description: "AI unavailable, using safety algorithms",
          variant: "default",
        })
        return
      }

      setRiskLevel(data.riskLevel)
      setRiskScore(data.riskScore)
      setReasoning(data.reasoning)
      setRecommendedSpeed(data.recommendedSpeed)
      setAlert(data.alert)

      toast({
        title: "AI Risk Analysis Complete",
        description: `Risk Score: ${data.riskScore}/100`,
      })
    } catch (error) {
      toast({
        title: "AI Prediction Error",
        description: "Failed to analyze risk. Using fallback logic.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWeatherData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(weatherLocation),
      })

      if (!response.ok) throw new Error("Weather API failed")

      const data = await response.json()

      setVisibility(data.visibility)
      setFogLevel(data.fogLevel)

      toast({
        title: "Weather Updated",
        description: `${data.location}: ${data.description}, ${Math.round(data.temperature)}°C`,
      })
    } catch (error) {
      toast({
        title: "Weather API Error",
        description: "Make sure OPENWEATHERMAP_API_KEY is set in environment variables",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFogDetected = (detectedFogLevel: FogLevel, detectedVisibility: number, detectedTimeOfDay?: TimeOfDay) => {
    console.log("[Main Page] handleFogDetected called with:", { detectedFogLevel, detectedVisibility, detectedTimeOfDay })
    setFogLevel(detectedFogLevel)
    setVisibility(detectedVisibility)
    if (detectedTimeOfDay) {
      console.log("[Main Page] Setting timeOfDay to:", detectedTimeOfDay)
      setTimeOfDay(detectedTimeOfDay)
    }
  }

  // 1. Real-Time Fog Detection (Automatic)
  useEffect(() => {
    if (!useRealApis) {
      if (visibility > 1000) {
        setFogLevel("none")
      } else if (visibility >= 300) {
        setFogLevel("medium")
      } else {
        setFogLevel("dense")
      }
    }
  }, [visibility, useRealApis])

  // 2. Accident Risk Prediction (Automatic, Rule-based)
  useEffect(() => {
    if (!useRealApis) {
      // Simple rule-based logic
      if (fogLevel === "dense" && timeOfDay === "night" && roadType === "highway") {
        setRiskLevel("HIGH")
      } else if (fogLevel === "dense" || (fogLevel === "medium" && timeOfDay === "night")) {
        setRiskLevel("MEDIUM")
      } else if (fogLevel === "medium") {
        setRiskLevel("MEDIUM")
      } else {
        setRiskLevel("LOW")
      }
    }
  }, [fogLevel, timeOfDay, roadType, useRealApis])

  const [lastAlertLevel, setLastAlertLevel] = useState<RiskLevel | null>(null)

  // 3. Driver Alert & Action Recommendation
  useEffect(() => {
    console.log("[Alert Effect] Triggered:", { riskLevel, lastAlertLevel, useRealApis, voiceEnabled })
    
    if (lastAlertLevel !== riskLevel) {
      console.log("[Alert Effect] Risk level changed from", lastAlertLevel, "to", riskLevel)
      
      if (riskLevel === "HIGH") {
        const alertMessage = "⚠️ Dense fog ahead – Reduce speed to 30 km/h, use fog lights, and increase following distance"
        setAlert(alertMessage)
        console.log("[Alert Effect] Setting HIGH risk alert, voiceEnabled:", voiceEnabled)
        if (voiceEnabled) {
          console.log("[Alert Effect] Calling alertDanger...")
          alertDanger("Dense fog ahead. Reduce speed to 30 kilometers per hour.")
        }
      } else if (riskLevel === "MEDIUM") {
        const alertMessage = "⚠ Moderate fog detected – Reduce speed to 50 km/h and use headlights"
        setAlert(alertMessage)
        console.log("[Alert Effect] Setting MEDIUM risk alert, voiceEnabled:", voiceEnabled)
        if (voiceEnabled) {
          console.log("[Alert Effect] Calling alertWarning...")
          alertWarning("Moderate fog detected. Reduce speed and use headlights.")
        }
      } else {
        const alertMessage = "✓ Clear conditions – Drive safely and stay alert"
        setAlert(alertMessage)
        console.log("[Alert Effect] Setting LOW risk alert")
      }
      setLastAlertLevel(riskLevel)
    }
  }, [riskLevel, voiceEnabled, lastAlertLevel, alertDanger, alertWarning])

  // Simulate real-time visibility changes (only in demo mode)
  useEffect(() => {
    if (!useRealApis) {
      const interval = setInterval(() => {
        setVisibility((prev) => {
          const change = Math.random() * 100 - 50
          return Math.max(50, Math.min(1500, prev + change))
        })
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [useRealApis])

  useEffect(() => {
    if (useRealApis && fogLevel) {
      const timer = setTimeout(() => {
        predictRiskWithAI()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [fogLevel, timeOfDay, roadType, useRealApis])

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Cloud className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-balance">Kohra Rakshak</h1>
              <p className="text-sm text-muted-foreground">Real-time fog detection & accident prevention system</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={useRealApis ? "default" : "outline"}
              onClick={() => setUseRealApis(!useRealApis)}
              disabled={isLoading}
            >
              {useRealApis ? "🤖 AI Mode" : "🎮 Demo Mode"}
            </Button>
            {useRealApis && (
              <Button onClick={fetchWeatherData} disabled={isLoading} variant="secondary">
                {isLoading ? "Loading..." : "Refresh Weather"}
              </Button>
            )}
            <Button
              variant={voiceEnabled ? "default" : "destructive"}
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              size="sm"
              className="gap-2"
            >
              {voiceEnabled ? "🔊 Voice ON" : "🔇 Voice OFF"}
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="dashboard">
            <Activity className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="map">
            <Map className="h-4 w-4 mr-2" />
            Map & Safety
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="emergency">
            <Phone className="h-4 w-4 mr-2" />
            Emergency
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Main Dashboard Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {useRealApis && <CameraUpload onFogDetected={handleFogDetected} />}

            {/* Feature 1: Fog Detection */}
            <FogDetection visibility={visibility} fogLevel={fogLevel} />

            {/* Feature 2: Risk Prediction */}
            <RiskPrediction
              riskLevel={riskLevel}
              fogLevel={fogLevel}
              timeOfDay={timeOfDay}
              roadType={roadType}
              riskScore={useRealApis ? riskScore : undefined}
              reasoning={useRealApis ? reasoning : undefined}
            />

            {/* Feature 3: Driver Alert */}
            <div className="md:col-span-2 lg:col-span-3">
              <DriverAlert
                alert={alert}
                riskLevel={riskLevel}
                recommendedSpeed={useRealApis ? recommendedSpeed : undefined}
              />
            </div>
          </div>

          {/* Demo Controls */}
          {!useRealApis && (
            <DemoControls
              visibility={visibility}
              setVisibility={setVisibility}
              timeOfDay={timeOfDay}
              setTimeOfDay={setTimeOfDay}
              roadType={roadType}
              setRoadType={setRoadType}
            />
          )}
        </TabsContent>

        {/* Map & Safety Tab */}
        <TabsContent value="map" className="space-y-6">
          <div className="grid gap-6">
            <MapView
              latitude={location.latitude}
              longitude={location.longitude}
              fogLevel={fogLevel}
              visibility={visibility}
              location="Current Location"
            />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <RiskAssessment
              fogLevel={fogLevel}
              visibility={visibility}
              incidentCount={Math.floor(Math.random() * 8)}
              weatherConditions={fogLevel === "dense" ? "Dense Fog" : fogLevel === "medium" ? "Moderate Fog" : "Clear"}
              location="Current Location"
            />
            <VisibilityTrends
              currentVisibility={visibility}
              location="Current Location"
            />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <MultiCameraSupport />
            <CommunityReports 
              locationLabel="Current Location" 
              latitude={location.latitude} 
              longitude={location.longitude} 
            />
          </div>
          <RouteSafety currentLat={location.latitude} currentLon={location.longitude} />
          <SafeStops latitude={location.latitude} longitude={location.longitude} visibility={visibility} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <HistoricalData />
          <WeeklyIncidentReport location="Current Location" />
        </TabsContent>

        {/* Emergency Tab */}
        <TabsContent value="emergency" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <NotificationSystem riskLevel={riskScore} fogLevel={fogLevel} />
            <EmergencyContacts riskLevel={riskScore} />
          </div>
        </TabsContent>
      </Tabs>

      {/* System Status */}
      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Activity className={`h-4 w-4 text-success ${isLoading ? "animate-spin" : "animate-pulse"}`} />
        <span>
          {useRealApis ? "AI Mode Active • Using Real APIs" : "System Active • Monitoring Conditions"}
          {location.latitude && location.longitude && (
            <> • Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</>
          )}
        </span>
      </div>
    </main>
  )
}
