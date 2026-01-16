"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, Eye, AlertTriangle, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface HistoricalDataProps {
  data?: any[]
}

export function HistoricalData({ data }: HistoricalDataProps) {
  // Mock historical data for demonstration
  const visibilityData = [
    { time: "00:00", visibility: 8500, risk: 15 },
    { time: "02:00", visibility: 6200, risk: 35 },
    { time: "04:00", visibility: 3500, risk: 65 },
    { time: "06:00", visibility: 2100, risk: 85 },
    { time: "08:00", visibility: 4200, risk: 55 },
    { time: "10:00", visibility: 7800, risk: 25 },
    { time: "12:00", visibility: 9500, risk: 10 },
    { time: "14:00", visibility: 9800, risk: 8 },
    { time: "16:00", visibility: 8900, risk: 12 },
    { time: "18:00", visibility: 6500, risk: 40 },
    { time: "20:00", visibility: 5200, risk: 50 },
    { time: "22:00", visibility: 7100, risk: 30 },
  ]

  const weeklyData = [
    { day: "Mon", incidents: 2, avgVisibility: 7200 },
    { day: "Tue", incidents: 5, avgVisibility: 5400 },
    { day: "Wed", incidents: 3, avgVisibility: 6800 },
    { day: "Thu", incidents: 7, avgVisibility: 4200 },
    { day: "Fri", incidents: 4, avgVisibility: 6100 },
    { day: "Sat", incidents: 6, avgVisibility: 5500 },
    { day: "Sun", incidents: 3, avgVisibility: 7800 },
  ]

  const stats = {
    avgVisibility: 6850,
    totalTrips: 47,
    highRiskEvents: 12,
    safetyScore: 78,
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Visibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgVisibility}m</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">↑ 12%</span> from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrips}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High-Risk Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highRiskEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-red-600">↑ 3</span> from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Safety Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {stats.safetyScore}
              <Badge variant="secondary">Good</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Personal rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Visibility Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            24-Hour Visibility Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={visibilityData}>
              <defs>
                <linearGradient id="colorVisibility" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="time" className="text-xs" />
              <YAxis className="text-xs" label={{ value: "Visibility (m)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="visibility"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorVisibility)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Level Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Daily Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={visibilityData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="time" className="text-xs" />
              <YAxis className="text-xs" label={{ value: "Risk Level (%)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>


    </div>
  )
}
