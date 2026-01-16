export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get("lat")
    const lon = searchParams.get("lon")
    const radius = searchParams.get("radius") || "5000" // 5km default

    if (!lat || !lon) {
      return Response.json({ error: "Latitude and longitude required" }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return Response.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    // Fetch multiple incident types using Google Places API
    const searchTypes = [
      { type: "police", keyword: "accident" },
      { type: "hospital", keyword: "emergency" },
      { type: "parking", keyword: "parking" },
    ]

    const allIncidents: any[] = []

    for (const searchType of searchTypes) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=${searchType.type}&key=${apiKey}`
        )
        const data = await response.json()

        if (data.status === "OK" && data.results) {
          allIncidents.push(
            ...data.results.map((place: any, idx: number) => {
              // Generate mock incident severity based on place type and rating
              let severity: "low" | "medium" | "high" = "low"
              if (searchType.type === "police") severity = "high"
              else if (searchType.type === "hospital") severity = "high"
              else if ((place.rating || 0) < 3.5) severity = "medium"

              // Generate message based on place type
              let message = `${place.name}`
              if (searchType.type === "police") message = `Traffic incident at ${place.name}`
              else if (searchType.type === "hospital") message = `Emergency services nearby: ${place.name}`
              else message = `Safe stop available: ${place.name}`

              const placeLat = place.geometry.location.lat
              const placeLon = place.geometry.location.lng

              return {
                id: place.place_id || `${Date.now()}-${idx}`,
                user: place.name.split(" ")[0] || "Anonymous",
                message,
                location: place.vicinity || place.name,
                latitude: placeLat,
                longitude: placeLon,
                severity,
                timestamp: Date.now() - Math.random() * 1000 * 60 * 30, // Random time in last 30 mins
                rating: place.rating || 0,
                placeType: searchType.type,
              }
            })
          )
        }
      } catch (error) {
        console.error(`Failed to fetch ${searchType.type} incidents:`, error)
      }
    }

    // Calculate distance for each incident
    const R = 6371 // Earth's radius in km
    const incidentsWithDistance = allIncidents.map((incident) => {
      const dLat = ((incident.latitude - Number(lat)) * Math.PI) / 180
      const dLon = ((incident.longitude - Number(lon)) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((Number(lat) * Math.PI) / 180) *
          Math.cos((incident.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c

      return {
        ...incident,
        distance: Math.round(distance * 10) / 10,
      }
    })

    // Sort by distance and limit to 12 results
    const sortedIncidents = incidentsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 12)

    return Response.json({
      incidents: sortedIncidents,
      total: sortedIncidents.length,
      searchRadius: Number(radius) / 1000, // km
    })
  } catch (error) {
    console.error("[v0] Community incidents API error:", error)
    return Response.json({ error: "Failed to fetch community incidents" }, { status: 500 })
  }
}
