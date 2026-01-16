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

    // Use Google Places API (New) to find nearby safe stops
    const types = ['gas_station', 'parking', 'lodging', 'rest_stop']
    const allPlaces: any[] = []

    // Fetch places for each type
    for (const type of types) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=${type}&key=${apiKey}`
        )
        const data = await response.json()

        if (data.status === 'OK' && data.results) {
          allPlaces.push(...data.results.map((place: any) => ({
            ...place,
            placeType: type,
          })))
        }
      } catch (error) {
        console.error(`Failed to fetch ${type}:`, error)
      }
    }

    // Calculate distance and format results
    const safeStops = allPlaces.map((place, index) => {
      const placeLat = place.geometry.location.lat
      const placeLon = place.geometry.location.lng
      
      // Calculate distance using Haversine formula
      const R = 6371 // Earth's radius in km
      const dLat = ((placeLat - Number(lat)) * Math.PI) / 180
      const dLon = ((placeLon - Number(lon)) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((Number(lat) * Math.PI) / 180) *
          Math.cos((placeLat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c

      // Map Google place types to our types
      let type = 'rest_area'
      if (place.placeType === 'gas_station') type = 'fuel'
      else if (place.placeType === 'parking') type = 'parking'
      else if (place.placeType === 'lodging') type = 'hotel'

      return {
        id: place.place_id || index,
        name: place.name,
        type,
        distance: Math.round(distance * 10) / 10,
        address: place.vicinity || 'Address not available',
        open24h: place.opening_hours?.open_now,
        lat: placeLat,
        lon: placeLon,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
      }
    })

    // Sort by distance and limit results
    const sortedStops = safeStops.sort((a, b) => a.distance - b.distance).slice(0, 15)

    return Response.json({
      safeStops: sortedStops,
      total: sortedStops.length,
      searchRadius: Number(radius) / 1000, // km
    })
  } catch (error) {
    console.error("[v0] Safe stops API error:", error)
    return Response.json({ error: "Failed to fetch safe stops" }, { status: 500 })
  }
}
