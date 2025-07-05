import { streamText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await streamText({
    model: google("gemini-1.5-flash"),
    system: `You are a helpful banking assistant for SecureBank. You can help users with:
    - Account balance and transaction inquiries
    - Geofenced transfers and location-based restrictions
    - Time-restricted transfers
    - Locked savings accounts with different durations
    - Transaction fees (2% on all transfers)
    - Early withdrawal penalties from locked savings
    - General banking features and security
    
    Always be helpful, professional, and provide accurate information about SecureBank's features.`,
    messages,
  })

  return result.toDataStreamResponse()
}
