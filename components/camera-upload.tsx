"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Upload, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CameraUploadProps {
  onFogDetected: (fogLevel: "none" | "medium" | "dense", visibility: number) => void
}

export function CameraUpload({ onFogDetected }: CameraUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { toast } = useToast()

  const handleImageUpload = async (file: File) => {
    setIsAnalyzing(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Convert to base64 for API
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      // Call OpenAI Vision API
      const response = await fetch("/api/detect-fog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: base64 }),
      })

      if (!response.ok) throw new Error("Fog detection failed")

      const data = await response.json()
      console.log("[v0] Fog detection result:", data)

      onFogDetected(data.fogLevel, data.visibility)

      toast({
        title: "Image Analyzed",
        description: `Detected: ${data.fogLevel} fog (${data.confidence}% confidence)`,
      })
    } catch (error) {
      console.error("[v0] Image analysis error:", error)
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          Camera / Image Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3">
          <label htmlFor="image-upload">
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isAnalyzing}
            />
            <Button asChild variant="outline" className="w-full cursor-pointer bg-transparent" disabled={isAnalyzing}>
              <span>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Road Image
                  </>
                )}
              </span>
            </Button>
          </label>

          {imagePreview && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-primary/20">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Uploaded road view"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground pt-2">
          Upload a road/driving image to detect fog using OpenAI Vision (GPT-4 Vision)
        </div>
      </CardContent>
    </Card>
  )
}
