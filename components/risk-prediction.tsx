import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type RiskLevel = "LOW" | "MEDIUM" | "HIGH"
type FogLevel = "none" | "medium" | "dense"
type TimeOfDay = "day" | "night"
type RoadType = "highway" | "city"

interface RiskPredictionProps {
  riskLevel: RiskLevel
  fogLevel: FogLevel
  timeOfDay: TimeOfDay
  roadType: RoadType
  riskScore?: number
  reasoning?: string
}

export function RiskPrediction({
  riskLevel,
  fogLevel,
  timeOfDay,
  roadType,
  riskScore,
  reasoning,
}: RiskPredictionProps) {
  const getRiskColor = () => {
    switch (riskLevel) {
      case "LOW":
        return "text-success"
      case "MEDIUM":
        return "text-warning"
      case "HIGH":
        return "text-destructive"
    }
  }

  const getRiskBg = () => {
    switch (riskLevel) {
      case "LOW":
        return "bg-success/10 border-success/20"
      case "MEDIUM":
        return "bg-warning/10 border-warning/20"
      case "HIGH":
        return "bg-destructive/10 border-destructive/20"
    }
  }

  const getRiskIcon = () => {
    switch (riskLevel) {
      case "LOW":
        return <Shield className="h-12 w-12" />
      case "MEDIUM":
        return <AlertCircle className="h-12 w-12" />
      case "HIGH":
        return <AlertTriangle className="h-12 w-12" />
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Accident Risk Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`flex items-center justify-center p-6 rounded-xl border-2 ${getRiskBg()}`}>
          <div className={`text-center ${getRiskColor()}`}>
            {getRiskIcon()}
            <div className="text-4xl font-bold mt-2">{riskLevel}</div>
            <div className="text-sm mt-1">Risk Level</div>
            {riskScore !== undefined && <div className="text-lg font-mono mt-1">{riskScore}/100</div>}
          </div>
        </div>

        <div className="pt-2 border-t space-y-2">
          <div className="text-sm font-medium mb-2">Factors Analyzed:</div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize">
              {fogLevel === "none" ? "No Fog" : `${fogLevel} Fog`}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {timeOfDay === "day" ? "☀️ Day" : "🌙 Night"}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {roadType === "highway" ? "🛣️ Highway" : "🏙️ City"}
            </Badge>
          </div>
        </div>

        {reasoning && (
          <div className="pt-2 border-t">
            <div className="text-sm font-medium mb-1">AI Analysis:</div>
            <div className="text-xs text-muted-foreground">{reasoning}</div>
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-2">
          {reasoning
            ? "AI-powered risk analysis using Anthropic Claude"
            : "Rule-based AI analyzing fog level, time of day, and road conditions in real-time."}
        </div>
      </CardContent>
    </Card>
  )
}
