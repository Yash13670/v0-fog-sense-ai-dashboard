export async function POST(req: Request) {
  try {
    const { fogLevel, visibility, timeOfDay, roadType, weatherCondition } = await req.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ error: "Anthropic API key not configured", useRuleBased: true }, { status: 200 })
    }

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          temperature: 0.3,
          messages: [
            {
              role: "user",
              content: `You are a road safety AI system. Analyze the following driving conditions and predict accident risk.

Conditions:
- Fog Level: ${fogLevel}
- Visibility: ${visibility} meters
- Time of Day: ${timeOfDay}
- Road Type: ${roadType}
- Weather: ${weatherCondition || "unknown"}

Respond with ONLY a JSON object in this exact format:
{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "riskScore": number (0-100),
  "reasoning": "brief explanation",
  "recommendedSpeed": number (km/h),
  "alert": "specific driver alert message"
}

Risk Assessment Guidelines:
- Dense fog + night + highway = HIGH risk (score 80-100)
- Dense fog = HIGH risk (score 70-90)
- Medium fog + night = MEDIUM-HIGH risk (score 60-75)
- Medium fog = MEDIUM risk (score 40-60)
- Light fog or clear = LOW risk (score 0-40)

Be concise and safety-focused.`,
            },
          ],
        }),
      })

      if (!response.ok) {
        return Response.json({ useRuleBased: true }, { status: 200 })
      }

      const data = await response.json()
      const text = data.content[0].type === "text" ? data.content[0].text : "{}"
      const result = JSON.parse(text)

      return Response.json({
        riskLevel: result.riskLevel,
        riskScore: result.riskScore,
        reasoning: result.reasoning,
        recommendedSpeed: result.recommendedSpeed,
        alert: result.alert,
      })
    } catch (fetchError) {
      return Response.json({ useRuleBased: true }, { status: 200 })
    }
  } catch (error) {
    return Response.json({ useRuleBased: true }, { status: 200 })
  }
}
