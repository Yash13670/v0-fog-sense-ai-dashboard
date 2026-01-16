export async function POST(req: Request) {
  try {
    const { lat, lon } = await req.json()

    const apiKey = process.env.OPENWEATHERMAP_API_KEY

    if (!apiKey) {
      console.error("[v0] OpenWeatherMap API key not found")
      return Response.json({ error: "OpenWeatherMap API key not configured" }, { status: 500 })
    }

    // Fetch weather data from OpenWeatherMap
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
    )

    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.statusText}`)
    }

    const data = await response.json()

    // Extract visibility and weather conditions
    const visibility = data.visibility || 10000 // Default to 10km if not provided
    const weatherCondition = data.weather?.[0]?.main?.toLowerCase() || "clear"
    const description = data.weather?.[0]?.description || ""

    // Determine fog level based on visibility
    let fogLevel: "none" | "medium" | "dense" = "none"
    if (visibility < 300) {
      fogLevel = "dense"
    } else if (visibility < 1000) {
      fogLevel = "medium"
    }

    return Response.json({
      visibility,
      fogLevel,
      weatherCondition,
      description,
      temperature: data.main?.temp,
      humidity: data.main?.humidity,
      location: data.name,
    })
  } catch (error) {
    console.error("[v0] Weather API error:", error)
    return Response.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}
