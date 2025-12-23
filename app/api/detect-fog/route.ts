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
                text: 'Analyze this road/driving image for fog conditions. Respond with ONLY a JSON object in this exact format: {"fogLevel": "none" | "medium" | "dense", "visibility": number (in meters, estimate between 50-1500), "confidence": number (0-100)}. Dense fog = visibility < 300m, Medium fog = 300-1000m, None = > 1000m.',
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
    const result = JSON.parse(text)

    return Response.json({
      fogLevel: result.fogLevel,
      visibility: result.visibility,
      confidence: result.confidence,
    })
  } catch (error) {
    console.error("[v0] Fog detection error:", error)
    return Response.json({ error: "Failed to detect fog" }, { status: 500 })
  }
}
