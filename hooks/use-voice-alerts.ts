"use client"

import { useCallback } from "react"

interface VoiceAlertOptions {
  enabled: boolean
  voice?: string
  rate?: number
  pitch?: number
  volume?: number
}

export function useVoiceAlerts(options: VoiceAlertOptions = { enabled: true }) {
  const speak = useCallback(
    (text: string, priority: "low" | "medium" | "high" = "medium") => {
      console.log("[Voice] speak called with:", { text, priority, enabled: options.enabled })
      
      if (!options.enabled) {
        console.log("[Voice] Voice disabled, skipping speak")
        return
      }
      
      if (typeof window === "undefined" || !window.speechSynthesis) {
        console.log("[Voice] speechSynthesis not available")
        return
      }

      // Cancel any ongoing speech for high priority alerts
      if (priority === "high") {
        console.log("[Voice] Cancelling previous speech for high priority")
        window.speechSynthesis.cancel()
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = options.rate || 1.0
      utterance.pitch = options.pitch || 1.0
      utterance.volume = options.volume || 1.0

      // Set voice if specified
      if (options.voice) {
        const voices = window.speechSynthesis.getVoices()
        const selectedVoice = voices.find((v) => v.name === options.voice)
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }
      }

      console.log("[Voice] Speaking:", text)
      window.speechSynthesis.speak(utterance)
    },
    [options.enabled, options.rate, options.pitch, options.volume, options.voice],
  )

  const alertDanger = useCallback(
    (message: string) => {
      console.log("[Voice] alertDanger called:", message)
      speak(`Danger! ${message}`, "high")
    },
    [speak],
  )

  const alertWarning = useCallback(
    (message: string) => {
      console.log("[Voice] alertWarning called:", message)
      speak(`Warning: ${message}`, "medium")
    },
    [speak],
  )

  const alertInfo = useCallback(
    (message: string) => {
      console.log("[Voice] alertInfo called:", message)
      speak(message, "low")
    },
    [speak],
  )

  return {
    speak,
    alertDanger,
    alertWarning,
    alertInfo,
  }
}
