export async function POST(req: Request) {
  try {
    const { origin, destination, waypoints } = await req.json()

    if (!origin || !destination) {
      return Response.json({ error: "Origin and destination required" }, { status: 400 })
    }

    const weatherApiKey = process.env.OPENWEATHERMAP_API_KEY
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!weatherApiKey || !googleApiKey) {
      return Response.json({ error: "API keys not configured" }, { status: 500 })
    }

    // Use Google Directions API to get real route data
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lon}&destination=${destination.lat},${destination.lon}&key=${googleApiKey}`
    
    let routePoints: any[] = []
    let distance = 0
    let duration = 0

    try {
      const directionsResponse = await fetch(directionsUrl)
      const directionsData = await directionsResponse.json()

      if (directionsData.status === 'OK' && directionsData.routes.length > 0) {
        const route = directionsData.routes[0]
        const leg = route.legs[0]
        
        distance = leg.distance.value / 1000 // Convert to km
        duration = leg.duration.value / 60 // Convert to minutes

        // Create checkpoints along the route
        const steps = leg.steps
        const totalSteps = steps.length
        const checkpointIndices = [0, Math.floor(totalSteps / 3), Math.floor((totalSteps * 2) / 3), totalSteps - 1]

        routePoints = checkpointIndices.map((idx, i) => {
          const step = steps[idx]
          return {
            lat: step.start_location.lat,
            lon: step.start_location.lng,
            name: i === 0 ? "Start" : i === checkpointIndices.length - 1 ? "Destination" : `Checkpoint ${i}`,
          }
        })
      } else {
        // Fallback to simple points if directions API fails
        routePoints = [
          { lat: origin.lat, lon: origin.lon, name: "Start" },
          { lat: (origin.lat + destination.lat) / 2, lon: (origin.lon + destination.lon) / 2, name: "Midpoint" },
          { lat: destination.lat, lon: destination.lon, name: "Destination" },
        ]
      }
    } catch (error) {
      console.error('Directions API error:', error)
      // Fallback to simple points
      routePoints = [
        { lat: origin.lat, lon: origin.lon, name: "Start" },
        { lat: (origin.lat + destination.lat) / 2, lon: (origin.lon + destination.lon) / 2, name: "Midpoint" },
        { lat: destination.lat, lon: destination.lon, name: "Destination" },
      ]
    }

    // Fetch weather for each point
    const weatherPromises = routePoints.map(async (point) => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${point.lat}&lon=${point.lon}&appid=${weatherApiKey}&units=metric`,
        )
        const data = await response.json()
        return {
          location: point.name,
          lat: point.lat,
          lon: point.lon,
          visibility: data.visibility || 10000,
          weather: data.weather?.[0]?.main || "Clear",
          temp: data.main?.temp,
          humidity: data.main?.humidity,
        }
      } catch (error) {
        return null
      }
    })

    const weatherData = (await Promise.all(weatherPromises)).filter(Boolean)

    // Calculate safety score
    const avgVisibility = weatherData.reduce((acc, curr) => acc + (curr?.visibility || 0), 0) / weatherData.length
    const lowVisibilityPoints = weatherData.filter((d) => d && d.visibility < 1000).length
    const moderateVisibilityPoints = weatherData.filter((d) => d && d.visibility >= 1000 && d.visibility < 5000).length

    let safetyScore = 100
    safetyScore -= lowVisibilityPoints * 30
    safetyScore -= moderateVisibilityPoints * 15

    let riskLevel: "low" | "medium" | "high" = "low"
    if (safetyScore < 50) riskLevel = "high"
    else if (safetyScore < 75) riskLevel = "medium"

    const warnings = []
    if (lowVisibilityPoints > 0) {
      warnings.push(`${lowVisibilityPoints} area(s) with dense fog detected`)
    }
    if (moderateVisibilityPoints > 0) {
      warnings.push(`${moderateVisibilityPoints} area(s) with reduced visibility`)
    }

    return Response.json({
      safetyScore: Math.max(0, safetyScore),
      riskLevel,
      avgVisibility: Math.round(avgVisibility),
      routePoints: weatherData,
      warnings,
      estimatedDuration: Math.round(duration) || 0,
      distance: Math.round(distance * 10) / 10 || 0,
      recommendation:
        riskLevel === "high"
          ? "Consider delaying your trip or taking an alternative route"
          : riskLevel === "medium"
            ? "Exercise caution and reduce speed in low visibility areas"
            : "Route is safe for travel",
    })
  } catch (error) {
    console.error("[v0] Route safety API error:", error)
    return Response.json({ error: "Failed to analyze route" }, { status: 500 })
  }
}
