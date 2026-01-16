"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Video, MonitorSmartphone, Camera } from "lucide-react"

interface CameraFeed {
  id: number
  name: string
  source?: string
  status: "online" | "offline"
  type: "file" | "url" | "sample"
}

export function MultiCameraSupport() {
  const [feeds, setFeeds] = useState<CameraFeed[]>([
    { id: 1, name: "Front Camera", status: "online", type: "sample", source: "" },
    { id: 2, name: "Rear Camera", status: "online", type: "sample", source: "" },
    { id: 3, name: "Cabin Camera", status: "online", type: "sample", source: "" },
  ])
  const [activeId, setActiveId] = useState<number>(1)
  const [newName, setNewName] = useState("")
  const [newUrl, setNewUrl] = useState("")

  const activeFeed = useMemo(() => feeds.find((f) => f.id === activeId) || feeds[0], [feeds, activeId])

  const addUrlFeed = () => {
    if (!newName.trim() || !newUrl.trim()) return
    const id = Date.now()
    setFeeds((prev) => [...prev, { id, name: newName.trim(), status: "online", type: "url", source: newUrl.trim() }])
    setActiveId(id)
    setNewName("")
    setNewUrl("")
  }

  const addFileFeed = (file: File) => {
    const id = Date.now()
    const objectUrl = URL.createObjectURL(file)
    setFeeds((prev) => [...prev, { id, name: file.name, status: "online", type: "file", source: objectUrl }])
    setActiveId(id)
  }

  const renderPreview = (feed: CameraFeed) => {
    if (feed.type === "file" || feed.type === "url") {
      return (
        <video
          className="w-full h-full object-cover rounded-lg"
          src={feed.source}
          autoPlay
          loop
          muted
          controls={false}
        />
      )
    }
    return (
      <div className="w-full h-full rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center text-slate-200 text-sm">
        <Camera className="h-6 w-6 mr-2" /> Live Preview
      </div>
    )
  }

  return (
    <Card className="border-2">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MonitorSmartphone className="h-5 w-5 text-primary" /> Multi-Camera Support
        </CardTitle>
        <Badge variant="outline" className="text-xs">Multi-feed</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active feed */}
        <div className="aspect-video rounded-xl border overflow-hidden bg-black relative">
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="secondary">{activeFeed?.name || "Active Feed"}</Badge>
          </div>
          {activeFeed ? renderPreview(activeFeed) : <div className="w-full h-full bg-slate-800" />}
        </div>

        {/* Feed list */}
        <div className="grid gap-3 md:grid-cols-3">
          {feeds.map((feed) => (
            <button
              key={feed.id}
              onClick={() => setActiveId(feed.id)}
              className={`border rounded-lg p-3 text-left transition hover:shadow-sm focus:outline-none ${
                activeId === feed.id ? "border-primary ring-2 ring-primary/40" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Video className="h-4 w-4" />
                  {feed.name}
                </div>
                <Badge variant={feed.status === "online" ? "success" : "secondary"} className="text-[10px]">
                  {feed.status === "online" ? "Online" : "Offline"}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {feed.type === "sample" ? "Live vehicle camera" : feed.type === "url" ? "Stream URL" : "Local file"}
              </div>
            </button>
          ))}
        </div>

        {/* Add new feed */}
        <div className="rounded-lg border bg-muted/40 p-3 space-y-3">
          <div className="text-sm font-semibold">Add camera feed</div>
          <div className="grid gap-2 md:grid-cols-2">
            <Input
              placeholder="Camera name (e.g., Left Mirror)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              placeholder="Stream URL (RTSP/HTTP)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={addUrlFeed} disabled={!newName.trim() || !newUrl.trim()}>
              Add URL Feed
            </Button>
            <label className="flex items-center gap-2 cursor-pointer text-sm px-3 py-2 border rounded-md bg-background hover:bg-accent transition">
              <Upload className="h-4 w-4" /> Upload video
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) addFileFeed(file)
                }}
              />
            </label>
          </div>
          <div className="text-xs text-muted-foreground">
            Supports multiple simultaneous sources. Select a feed to preview it above.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
