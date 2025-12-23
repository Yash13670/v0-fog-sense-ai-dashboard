import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, CloudFog, CloudOff } from "lucide-react"

type FogLevel = "none" | "medium" | "dense"

interface FogDetectionProps {
  visibility: number
  fogLevel: FogLevel
}

export function FogDetection({ visibility, fogLevel }: FogDetectionProps) {
  const getFogColor = () => {
    switch (fogLevel) {
      case "none":
        return "text-success"
      case "medium":
        return "text-warning"
      case "dense":
        return "text-destructive"
    }
  }

  const getFogIcon = () => {
    switch (fogLevel) {
      case "none":
        return <CloudOff className="h-8 w-8" />
      case "medium":
        return <Cloud className="h-8 w-8" />
      case "dense":
        return <CloudFog className="h-8 w-8" />
    }
  }

  const getFogLabel = () => {
    switch (fogLevel) {
      case "none":
        return "No Fog"
      case "medium":
        return "Medium Fog"
      case "dense":
        return "Dense Fog"
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" />
          Real-Time Fog Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Visibility</div>
            <div className="text-3xl font-bold font-mono">{Math.round(visibility)} m</div>
          </div>
          <div className={`${getFogColor()}`}>{getFogIcon()}</div>
        </div>

        <div className="pt-4 border-t">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-lg font-semibold ${
              fogLevel === "none"
                ? "bg-success/10 text-success"
                : fogLevel === "medium"
                  ? "bg-warning/10 text-warning"
                  : "bg-destructive/10 text-destructive"
            }`}
          >
            {getFogLabel()}
          </div>
        </div>

        <div className="pt-2 text-xs text-muted-foreground space-y-1">
          <div>• Clear: &gt; 1000 m</div>
          <div>• Medium: 300-1000 m</div>
          <div>• Dense: &lt; 300 m</div>
        </div>
      </CardContent>
    </Card>
  )
}
