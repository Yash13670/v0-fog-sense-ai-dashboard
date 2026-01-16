"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Calendar, TrendingUp } from "lucide-react"

interface WeeklyReportProps {
  location?: string
}

const COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e", "#06b6d4", "#0ea5e9"]

export function WeeklyIncidentReport({ location = "Current Location" }: WeeklyReportProps) {
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [incidentTypes, setIncidentTypes] = useState<any[]>([])
  const [summary, setSummary] = useState({
    totalIncidents: 0,
    totalFogHours: 0,
    avgVisibility: 0,
    worstDay: "",
    bestDay: "",
  })

  useEffect(() => {
    generateWeeklyReport()
  }, [])

  const generateWeeklyReport = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const today = new Date()
    const weekData = []

    let totalIncidents = 0
    let totalFogHours = 0
    let totalVisibility = 0

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayName = days[date.getDay()]

      const incidents = Math.floor(Math.random() * 10)
      const fogHours = Math.floor(Math.random() * 12)
      const visibility = 3000 + Math.random() * 7000

      weekData.push({
        day: dayName,
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        incidents,
        fogHours,
        visibility: Math.round(visibility),
      })

      totalIncidents += incidents
      totalFogHours += fogHours
      totalVisibility += visibility
    }

    setWeeklyData(weekData)

    // Calculate summary
    const avgVis = Math.round(totalVisibility / 7)
    const worstDay = weekData.reduce((max, d) => (d.incidents > max.incidents ? d : max))
    const bestDay = weekData.reduce((min, d) => (d.incidents < min.incidents ? d : min))

    setSummary({
      totalIncidents,
      totalFogHours,
      avgVisibility: avgVis,
      worstDay: `${worstDay.day} (${worstDay.incidents} incidents)`,
      bestDay: `${bestDay.day} (${bestDay.incidents} incidents)`,
    })

    // Generate incident type breakdown
    const typeData = [
      { name: "Accidents", value: Math.round(totalIncidents * 0.3), color: "#ef4444" },
      { name: "Slow Traffic", value: Math.round(totalIncidents * 0.25), color: "#f97316" },
      { name: "Fog Warnings", value: Math.round(totalIncidents * 0.25), color: "#eab308" },
      { name: "Road Hazards", value: Math.round(totalIncidents * 0.2), color: "#84cc16" },
    ]
    setIncidentTypes(typeData)
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.01] border-2">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="h-6 w-6 text-blue-600 animate-pulse" />
          Weekly Incident Report
        </CardTitle>
        <CardDescription className="text-base">{location} - Last 7 days analysis</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="group p-5 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl cursor-pointer transform transition-all duration-300 hover:scale-110 hover:shadow-lg hover:border-red-400 hover:-translate-y-1">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Total Incidents</p>
              <p className="text-3xl font-extrabold text-red-600 mt-2 group-hover:scale-110 transition-transform">{summary.totalIncidents}</p>
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                This week
              </p>
            </div>

            <div className="group p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl cursor-pointer transform transition-all duration-300 hover:scale-110 hover:shadow-lg hover:border-blue-400 hover:-translate-y-1">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Fog Hours</p>
              <p className="text-3xl font-extrabold text-blue-600 mt-2 group-hover:scale-110 transition-transform">{summary.totalFogHours}h</p>
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Cumulative
              </p>
            </div>

            <div className="group p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl cursor-pointer transform transition-all duration-300 hover:scale-110 hover:shadow-lg hover:border-purple-400 hover:-translate-y-1">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Avg Visibility</p>
              <p className="text-3xl font-extrabold text-purple-600 mt-2 group-hover:scale-110 transition-transform">{summary.avgVisibility}m</p>
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Daily average
              </p>
            </div>

            <div className="group p-5 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl cursor-pointer transform transition-all duration-300 hover:scale-110 hover:shadow-lg hover:border-green-400 hover:-translate-y-1">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Best Day</p>
              <p className="text-xl font-extrabold text-green-600 mt-2 group-hover:scale-110 transition-transform">{summary.bestDay.split(" ")[0]}</p>
              <p className="text-xs text-gray-600 mt-1">{summary.bestDay.split(" ").slice(1).join(" ")}</p>
            </div>
          </div>

          {/* Daily Incidents Chart */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200 transition-all duration-300 hover:shadow-lg">
            <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="h-1 w-8 bg-gradient-to-r from-red-500 to-blue-500 rounded-full"></div>
              Daily Incident Count
            </h4>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={weeklyData}>
                <defs>
                  <linearGradient id="incidentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="fogGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: "14px", fontWeight: "600" }} />
                <YAxis stroke="#6b7280" style={{ fontSize: "14px", fontWeight: "600" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.95)",
                    border: "2px solid #374151",
                    borderRadius: "12px",
                    color: "#f3f4f6",
                    padding: "12px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                  }}
                  cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px", fontWeight: "600" }} />
                <Bar dataKey="incidents" fill="url(#incidentGradient)" name="Incidents" radius={[12, 12, 0, 0]} animationDuration={1500} />
                <Bar dataKey="fogHours" fill="url(#fogGradient)" name="Fog Hours" radius={[12, 12, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Incident Type Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-indigo-50 to-pink-50 p-6 rounded-xl border-2 border-indigo-200 transition-all duration-300 hover:shadow-xl">
              <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="h-1 w-8 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full"></div>
                Incident Type Distribution
              </h4>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={incidentTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={90}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={1500}
                    animationBegin={0}
                  >
                    {incidentTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `${value} incidents`}
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.95)",
                      border: "2px solid #374151",
                      borderRadius: "12px",
                      padding: "10px",
                      fontWeight: "600",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 transition-all duration-300 hover:shadow-xl">
              <h4 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                <div className="h-1 w-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                Detailed Breakdown
              </h4>
              <div className="space-y-4">
                {incidentTypes.map((type, idx) => (
                  <div key={idx} className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 cursor-pointer">
                    <div className="w-5 h-5 rounded-lg shadow-md group-hover:scale-125 transition-transform duration-300" style={{ backgroundColor: type.color }}></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">{type.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${(type.value / summary.totalIncidents) * 100}%`,
                              backgroundColor: type.color,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-extrabold text-gray-700 min-w-[30px] text-right group-hover:scale-110 transition-transform">{type.value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Details */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl border-2 border-slate-200">
            <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="h-1 w-8 bg-gradient-to-r from-slate-500 to-blue-500 rounded-full"></div>
              Daily Details
            </h4>
            <div className="space-y-3">
              {weeklyData.map((day, idx) => (
                <div key={idx} className="group p-4 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:border-blue-400 hover:scale-[1.02] cursor-pointer">
                  <div>
                    <p className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{day.day}</p>
                    <p className="text-xs text-gray-600 font-medium">{day.date}</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center group/stat hover:scale-110 transition-transform">
                      <p className="text-xs text-gray-600 uppercase font-semibold">Incidents</p>
                      <p className="font-extrabold text-red-600 text-xl mt-1">{day.incidents}</p>
                    </div>
                    <div className="text-center group/stat hover:scale-110 transition-transform">
                      <p className="text-xs text-gray-600 uppercase font-semibold">Fog Hrs</p>
                      <p className="font-extrabold text-blue-600 text-xl mt-1">{day.fogHours}h</p>
                    </div>
                    <div className="text-center group/stat hover:scale-110 transition-transform">
                      <p className="text-xs text-gray-600 uppercase font-semibold">Visibility</p>
                      <p className="font-extrabold text-purple-600 text-xl mt-1">{day.visibility}m</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Insights */}
          <div className="relative overflow-hidden p-6 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-300 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="relative">
              <p className="text-lg font-bold text-yellow-900 mb-4 flex items-center gap-2">
                <span className="text-2xl animate-bounce">📊</span>
                Key Insights
              </p>
              <ul className="text-sm text-yellow-900 space-y-3">
                <li className="flex items-start gap-2 hover:translate-x-2 transition-transform duration-200">
                  <span className="text-red-500 font-bold">▸</span>
                  <span><strong className="font-extrabold">Worst Day:</strong> {summary.worstDay}</span>
                </li>
                <li className="flex items-start gap-2 hover:translate-x-2 transition-transform duration-200">
                  <span className="text-green-500 font-bold">▸</span>
                  <span><strong className="font-extrabold">Best Day:</strong> {summary.bestDay}</span>
                </li>
                <li className="flex items-start gap-2 hover:translate-x-2 transition-transform duration-200">
                  <span className="text-blue-500 font-bold">▸</span>
                  <span><strong className="font-extrabold">Peak Hours:</strong> 6 AM - 9 AM and 5 PM - 8 PM (highest incident rates)</span>
                </li>
                <li className="flex items-start gap-2 hover:translate-x-2 transition-transform duration-200">
                  <span className="text-purple-500 font-bold">▸</span>
                  <span><strong className="font-extrabold">Recommendation:</strong> Avoid driving during peak fog hours when possible</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
