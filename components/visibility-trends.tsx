"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"

interface VisibilityTrendsProps {
  currentVisibility?: number
  location?: string
}

export function VisibilityTrends({ currentVisibility = 5000, location = "Current Location" }: VisibilityTrendsProps) {
  const [trendData, setTrendData] = useState<any[]>([])
  const [stats, setStats] = useState({
    min: 0,
    max: 0,
    avg: 0,
    trend: "stable",
  })

  useEffect(() => {
    // Generate visibility trend data for the day
    const now = new Date()
    const data = []

    for (let i = 23; i >= 0; i--) {
      const time = new Date(now)
      time.setHours(time.getHours() - i)

      let visibility = 8000
      // Simulate visibility changes - lower visibility at certain times
      if (time.getHours() >= 6 && time.getHours() <= 9) {
        visibility = 2000 + Math.random() * 3000 // Morning fog
      } else if (time.getHours() >= 17 && time.getHours() <= 20) {
        visibility = 3000 + Math.random() * 4000 // Evening fog
      } else {
        visibility = 7000 + Math.random() * 3000 // Good visibility
      }

      data.push({
        time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
        visibility: Math.round(visibility),
        hour: time.getHours(),
      })
    }

    setTrendData(data)

    // Calculate statistics
    const visibilities = data.map((d) => d.visibility)
    const min = Math.min(...visibilities)
    const max = Math.max(...visibilities)
    const avg = Math.round(visibilities.reduce((a, b) => a + b) / visibilities.length)

    // Determine trend
    const recent = visibilities.slice(-6)
    const older = visibilities.slice(0, 6)
    const recentAvg = Math.round(recent.reduce((a, b) => a + b) / recent.length)
    const olderAvg = Math.round(older.reduce((a, b) => a + b) / older.length)

    let trend = "stable"
    if (recentAvg < olderAvg - 500) {
      trend = "declining"
    } else if (recentAvg > olderAvg + 500) {
      trend = "improving"
    }

    setStats({ min, max, avg, trend })
  }, [])

  const trendColor =
    stats.trend === "declining" ? "text-red-600" : stats.trend === "improving" ? "text-green-600" : "text-gray-600"
  const trendEmoji = stats.trend === "declining" ? "📉" : stats.trend === "improving" ? "📈" : "➡️"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Visibility Trends (24 Hours)
        </CardTitle>
        <CardDescription>{location} - Real-time visibility tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Trend Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                interval={Math.floor(trendData.length / 6)}
              />
              <YAxis
                label={{ value: "Visibility (m)", angle: -90, position: "insideLeft" }}
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#f3f4f6",
                }}
                formatter={(value) => `${value}m`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="visibility"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={2}
                isAnimationActive={true}
                name="Visibility"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-gray-700">Current</p>
              <p className="text-lg font-bold text-blue-600">{currentVisibility}m</p>
              <p className="text-xs text-gray-600 mt-1">Right now</p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs font-semibold text-gray-700">Maximum</p>
              <p className="text-lg font-bold text-green-600">{stats.max}m</p>
              <p className="text-xs text-gray-600 mt-1">Today's best</p>
            </div>

            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs font-semibold text-gray-700">Minimum</p>
              <p className="text-lg font-bold text-red-600">{stats.min}m</p>
              <p className="text-xs text-gray-600 mt-1">Today's worst</p>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs font-semibold text-gray-700">Average</p>
              <p className="text-lg font-bold text-purple-600">{stats.avg}m</p>
              <p className="text-xs text-gray-600 mt-1">Daily average</p>
            </div>
          </div>

          {/* Trend Indicator */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">24-Hour Trend</p>
                <p className={`text-lg font-bold mt-1 ${trendColor}`}>
                  {stats.trend.charAt(0).toUpperCase() + stats.trend.slice(1)}
                </p>
              </div>
              <span className="text-4xl">{trendEmoji}</span>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              {stats.trend === "declining"
                ? "Visibility is worsening. Exercise caution while driving."
                : stats.trend === "improving"
                  ? "Visibility is improving. Conditions are getting better."
                  : "Visibility is stable. Conditions remain consistent."}
            </p>
          </div>

          {/* Hourly Alert */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs font-semibold text-yellow-800 flex items-center gap-2">
              ⚠️ Peak Fog Hours
            </p>
            <p className="text-xs text-yellow-700 mt-2">Lowest visibility expected between 6 AM - 9 AM and 5 PM - 8 PM</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
