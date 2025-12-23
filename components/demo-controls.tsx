"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

type TimeOfDay = "day" | "night"
type RoadType = "highway" | "city"

interface DemoControlsProps {
  visibility: number
  setVisibility: (value: number) => void
  timeOfDay: TimeOfDay
  setTimeOfDay: (value: TimeOfDay) => void
  roadType: RoadType
  setRoadType: (value: RoadType) => void
}

export function DemoControls({
  visibility,
  setVisibility,
  timeOfDay,
  setTimeOfDay,
  roadType,
  setRoadType,
}: DemoControlsProps) {
  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          Demo Controls (For Testing)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="visibility-slider" className="text-base">
            Visibility: <span className="font-mono font-bold">{Math.round(visibility)} m</span>
          </Label>
          <Slider
            id="visibility-slider"
            min={50}
            max={1500}
            step={10}
            value={[visibility]}
            onValueChange={(value) => setVisibility(value[0])}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-base">Time of Day</Label>
            <div className="flex gap-2">
              <Button
                variant={timeOfDay === "day" ? "default" : "outline"}
                onClick={() => setTimeOfDay("day")}
                className="flex-1"
              >
                ☀️ Day
              </Button>
              <Button
                variant={timeOfDay === "night" ? "default" : "outline"}
                onClick={() => setTimeOfDay("night")}
                className="flex-1"
              >
                🌙 Night
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base">Road Type</Label>
            <div className="flex gap-2">
              <Button
                variant={roadType === "highway" ? "default" : "outline"}
                onClick={() => setRoadType("highway")}
                className="flex-1"
              >
                🛣️ Highway
              </Button>
              <Button
                variant={roadType === "city" ? "default" : "outline"}
                onClick={() => setRoadType("city")}
                className="flex-1"
              >
                🏙️ City
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
