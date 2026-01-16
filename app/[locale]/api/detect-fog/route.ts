export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json()

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this road/driving image carefully for TWO things:

1. FOG CONDITIONS:
   - Dense fog: visibility < 300m (very hazy, can barely see 100-300m ahead)
   - Medium fog: 300-1000m (hazy, reduced visibility)
   - None: > 1000m (clear, good visibility)

2. TIME OF DAY (CRITICAL - look carefully at image brightness and lighting):
   - "day": Any image taken during daylight hours (sunrise, morning, afternoon, sunset with natural light)
   - "night": Image taken in darkness/low light (evening after sunset, night driving with artificial lights only, very dark/black sky)

Key indicators for "night":
- Sky is completely dark/black (not twilight)
- Only artificial lights visible (street lights, headlights, tail lights)
- Image is dark overall with dark sky
- No natural daylight visible

Respond with ONLY valid JSON, no other text:
{"fogLevel": "none" | "medium" | "dense", "visibility": number (50-1500), "confidence": number (0-100), "timeOfDay": "day" | "night"}`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const text = data.choices[0].message.content || "{}"
    
    console.log("[v0] Raw OpenAI response:", text)
    
    let result
    try {
      result = JSON.parse(text)
    } catch (parseError) {
      console.error("[v0] JSON parse error:", parseError, "Raw text:", text)
      // Try to extract JSON from response if it contains extra text
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Invalid JSON response from OpenAI")
      }
    }

    console.log("[v0] Parsed result:", result)

    return Response.json({
      fogLevel: result.fogLevel || "medium",
      visibility: result.visibility || 500,
      confidence: result.confidence || 50,
      timeOfDay: result.timeOfDay === "night" ? "night" : "day",
    })
  } catch (error) {
    console.error("[v0] Fog detection error:", error)
    return Response.json({ error: "Failed to detect fog" }, { status: 500 })
  }
}
