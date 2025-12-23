"use client"

import { useEffect, useState } from "react"
import { FogDetection } from "@/components/fog-detection"
import { RiskPrediction } from "@/components/risk-prediction"
import { DriverAlert } from "@/components/driver-alert"
import { DemoControls } from "@/components/demo-controls"
import { CameraUpload } from "@/components/camera-upload"
import { Cloud, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

type FogLevel = "none" | "medium" | "dense"
type RiskLevel = "LOW" | "MEDIUM" | "HIGH"
type TimeOfDay = "day" | "night"
type RoadType = "highway" | "city"

export default function Home() {
  const [useRealApis, setUseRealApis] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [weatherLocation, setWeatherLocation] = useState({ lat: 37.7749, lon: -122.4194 }) // Default: San Francisco
  const { toast } = useToast()

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

  const handleFogDetected = (detectedFogLevel: FogLevel, detectedVisibility: number) => {
    setFogLevel(detectedFogLevel)
    setVisibility(detectedVisibility)
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

  // 3. Driver Alert & Action Recommendation
  useEffect(() => {
    if (!useRealApis) {
      if (riskLevel === "HIGH") {
        setAlert("⚠️ Dense fog ahead – Reduce speed to 30 km/h, use fog lights, and increase following distance")
      } else if (riskLevel === "MEDIUM") {
        setAlert("⚠ Moderate fog detected – Reduce speed to 50 km/h and use headlights")
      } else {
        setAlert("✓ Clear conditions – Drive safely and stay alert")
      }
    }
  }, [riskLevel, useRealApis])

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
              <h1 className="text-3xl md:text-4xl font-bold text-balance">FogSense AI</h1>
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
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
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

      {/* System Status */}
      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Activity className={`h-4 w-4 text-success ${isLoading ? "animate-spin" : "animate-pulse"}`} />
        <span>{useRealApis ? "AI Mode Active • Using Real APIs" : "System Active • Monitoring Conditions"}</span>
      </div>
    </main>
  )
}
