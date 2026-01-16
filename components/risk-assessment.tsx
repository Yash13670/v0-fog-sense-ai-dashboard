"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, AlertCircle, CheckCircle } from "lucide-react"

interface RiskAssessmentProps {
  fogLevel?: string
  visibility?: number
  incidentCount?: number
  weatherConditions?: string
  location?: string
}

export function RiskAssessment({
  fogLevel = "none",
  visibility = 10000,
  incidentCount = 0,
  weatherConditions = "Clear",
  location = "Current Location",
}: RiskAssessmentProps) {
  const [riskScore, setRiskScore] = useState(0)
  const [riskLevel, setRiskLevel] = useState("Low")
  const [factors, setFactors] = useState<any[]>([])

  useEffect(() => {
    calculateRisk()
  }, [fogLevel, visibility, incidentCount, weatherConditions])

  const calculateRisk = () => {
    let score = 0
    const riskFactors: any[] = []

    // Fog Level Risk (0-30 points)
    if (fogLevel === "dense") {
      score += 30
      riskFactors.push({ name: "Dense Fog", severity: "Critical", points: 30, icon: "☁️" })
    } else if (fogLevel === "medium") {
      score += 20
      riskFactors.push({ name: "Moderate Fog", severity: "High", points: 20, icon: "☁️" })
    } else {
      riskFactors.push({ name: "No Fog", severity: "Safe", points: 0, icon: "☀️" })
    }

    // Visibility Risk (0-25 points)
    if (visibility < 300) {
      score += 25
      riskFactors.push({ name: "Critical Visibility", severity: "Critical", points: 25, icon: "📉" })
    } else if (visibility < 1000) {
      score += 20
      riskFactors.push({ name: "Poor Visibility", severity: "High", points: 20, icon: "📉" })
    } else if (visibility < 5000) {
      score += 10
      riskFactors.push({ name: "Moderate Visibility", severity: "Medium", points: 10, icon: "📉" })
    } else {
      riskFactors.push({ name: "Good Visibility", severity: "Safe", points: 0, icon: "📈" })
    }

    // Incident Risk (0-20 points)
    if (incidentCount > 5) {
      score += 20
      riskFactors.push({ name: `Multiple Incidents (${incidentCount})`, severity: "High", points: 20, icon: "🚨" })
    } else if (incidentCount > 2) {
      score += 15
      riskFactors.push({ name: `Some Incidents (${incidentCount})`, severity: "Medium", points: 15, icon: "⚠️" })
    } else if (incidentCount > 0) {
      score += 5
      riskFactors.push({ name: `Minor Incidents (${incidentCount})`, severity: "Low", points: 5, icon: "ℹ️" })
    } else {
      riskFactors.push({ name: "No Recent Incidents", severity: "Safe", points: 0, icon: "✓" })
    }

    // Weather Conditions Risk (0-15 points)
    const weatherLower = weatherConditions.toLowerCase()
    if (weatherLower.includes("rain") || weatherLower.includes("snow") || weatherLower.includes("sleet")) {
      score += 15
      riskFactors.push({ name: "Adverse Weather", severity: "High", points: 15, icon: "🌧️" })
    } else if (weatherLower.includes("mist") || weatherLower.includes("drizzle")) {
      score += 10
      riskFactors.push({ name: "Wet Conditions", severity: "Medium", points: 10, icon: "💧" })
    } else {
      riskFactors.push({ name: "Favorable Weather", severity: "Safe", points: 0, icon: "🌤️" })
    }

    // Time-based risk (0-10 points)
    const hour = new Date().getHours()
    if (hour >= 20 || hour < 6) {
      score += 10
      riskFactors.push({ name: "Night Driving", severity: "High", points: 10, icon: "🌙" })
    } else if (hour >= 6 && hour < 9) {
      score += 8
      riskFactors.push({ name: "Peak Fog Hours (Morning)", severity: "High", points: 8, icon: "🌅" })
    } else if (hour >= 17 && hour < 20) {
      score += 8
      riskFactors.push({ name: "Peak Fog Hours (Evening)", severity: "High", points: 8, icon: "🌆" })
    }

    // Determine risk level
    let level = "Low"
    if (score >= 70) {
      level = "Critical"
    } else if (score >= 50) {
      level = "High"
    } else if (score >= 30) {
      level = "Medium"
    } else {
      level = "Low"
    }

    setRiskScore(score)
    setRiskLevel(level)
    setFactors(riskFactors)
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Critical":
        return "text-red-700 bg-red-50 border-red-200"
      case "High":
        return "text-orange-700 bg-orange-50 border-orange-200"
      case "Medium":
        return "text-yellow-700 bg-yellow-50 border-yellow-200"
      default:
        return "text-green-700 bg-green-50 border-green-200"
    }
  }

  const getProgressColor = (score: number) => {
    if (score >= 70) return "bg-red-500"
    if (score >= 50) return "bg-orange-500"
    if (score >= 30) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "Critical":
        return <AlertTriangle className="h-6 w-6 text-red-600" />
      case "High":
        return <AlertTriangle className="h-6 w-6 text-orange-600" />
      case "Medium":
        return <AlertCircle className="h-6 w-6 text-yellow-600" />
      default:
        return <CheckCircle className="h-6 w-6 text-green-600" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Risk Assessment
        </CardTitle>
        <CardDescription>{location} - Real-time safety analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Risk Score */}
          <div className={`p-6 rounded-lg border ${getRiskColor(riskLevel)}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold opacity-75">Overall Risk Level</p>
                <p className="text-3xl font-bold mt-2">{riskLevel}</p>
              </div>
              <div className="flex flex-col items-center">{getRiskIcon(riskLevel)}</div>
            </div>

            {/* Risk Score Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Risk Score</span>
                <span className="text-sm font-bold">{riskScore}/100</span>
              </div>
              <Progress value={riskScore} className="h-3" />
            </div>
          </div>

          {/* Risk Recommendation */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">⚠️ Driving Recommendation</p>
            {riskLevel === "Critical" && (
              <p className="text-sm text-blue-800">
                <strong>DO NOT DRIVE</strong> - Conditions are extremely hazardous. Consider postponing travel.
              </p>
            )}
            {riskLevel === "High" && (
              <p className="text-sm text-blue-800">
                <strong>DRIVE WITH EXTREME CAUTION</strong> - Use low beams, reduce speed, and maintain safe distance.
              </p>
            )}
            {riskLevel === "Medium" && (
              <p className="text-sm text-blue-800">
                <strong>DRIVE CAREFULLY</strong> - Stay alert and adjust speed according to road conditions.
              </p>
            )}
            {riskLevel === "Low" && (
              <p className="text-sm text-blue-800">
                <strong>SAFE TO DRIVE</strong> - Road conditions are favorable. Practice normal safety precautions.
              </p>
            )}
          </div>

          {/* Risk Factors */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Risk Factors Analysis</h4>
            <div className="space-y-2">
              {factors.map((factor, idx) => (
                <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-lg">{factor.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{factor.name}</p>
                        <p className="text-xs text-gray-600">Severity: {factor.severity}</p>
                      </div>
                    </div>
                    {factor.points > 0 && (
                      <span className="text-xs font-bold text-gray-600 bg-gray-200 px-2 py-1 rounded">
                        +{factor.points} pts
                      </span>
                    )}
                    {factor.points === 0 && <span className="text-xs font-bold text-green-600">✓ Safe</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Tips */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm font-semibold text-purple-900 mb-3">💡 Safety Tips</p>
            <ul className="text-xs text-purple-800 space-y-2">
              <li>• Use low-beam headlights in fog to improve visibility</li>
              <li>• Reduce speed and increase following distance</li>
              <li>• Avoid using high beams as they reflect off fog</li>
              <li>• Enable hazard lights if visibility is extremely poor</li>
              <li>• Keep windshield clean for better visibility</li>
              <li>• Stay focused and avoid distractions</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
