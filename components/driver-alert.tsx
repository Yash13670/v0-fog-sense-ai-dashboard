import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, AlertCircle, Gauge } from "lucide-react"

type RiskLevel = "LOW" | "MEDIUM" | "HIGH"

interface DriverAlertProps {
  alert: string
  riskLevel: RiskLevel
  recommendedSpeed?: number
}

export function DriverAlert({ alert, riskLevel, recommendedSpeed }: DriverAlertProps) {
  const getAlertStyle = () => {
    switch (riskLevel) {
      case "LOW":
        return {
          bg: "bg-success/10 border-success",
          text: "text-success",
          icon: <CheckCircle className="h-10 w-10 md:h-12 md:w-12" />,
        }
      case "MEDIUM":
        return {
          bg: "bg-warning/10 border-warning",
          text: "text-warning",
          icon: <AlertCircle className="h-10 w-10 md:h-12 md:w-12" />,
        }
      case "HIGH":
        return {
          bg: "bg-destructive/10 border-destructive",
          text: "text-destructive",
          icon: <AlertTriangle className="h-10 w-10 md:h-12 md:w-12 animate-pulse" />,
        }
    }
  }

  const style = getAlertStyle()

  return (
    <Card className={`border-4 ${style.bg}`}>
      <CardContent className="p-6 md:p-8">
        <div className="flex items-start gap-4 md:gap-6">
          <div className={style.text}>{style.icon}</div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-muted-foreground mb-2">DRIVER ALERT • {riskLevel} PRIORITY</div>
            <div className={`text-xl md:text-2xl lg:text-3xl font-bold leading-relaxed text-pretty ${style.text}`}>
              {alert}
            </div>
            {recommendedSpeed !== undefined && (
              <div className="mt-4 flex items-center gap-3 p-4 bg-background/50 rounded-lg border">
                <Gauge className="h-6 w-6 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">AI Recommended Speed</div>
                  <div className="text-2xl font-bold font-mono">{recommendedSpeed} km/h</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
