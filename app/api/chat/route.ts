import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { supabase, getUserByEmail, getUserTransactions, getUserGeofences, getUserSavingsLocks } from "@/lib/supabase"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { message, userEmail } = await req.json()

    if (!message || !userEmail) {
      return NextResponse.json({ error: "Message and user email are required" }, { status: 400 })
    }

    // Get user data from Supabase
    const user = await getUserByEmail(userEmail)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user's financial data
    const [transactions, geofences, savingsLocks] = await Promise.all([
      getUserTransactions(user.id, 10),
      getUserGeofences(user.id),
      getUserSavingsLocks(user.id),
    ])

    // Create context for the AI
    const userContext = {
      name: user.name,
      balance: user.balance,
      savingsBalance: user.savings_balance,
      recentTransactions: transactions.slice(0, 5).map((t) => ({
        type: t.type,
        amount: t.amount,
        description: t.description,
        date: t.created_at,
        status: t.status,
      })),
      activeGeofences: geofences.filter((g) => g.is_active && !g.is_claimed).length,
      savingsLocks: savingsLocks.filter((s) => !s.is_unlocked).length,
    }

    const systemPrompt = `You are Money Buddy, a friendly AI financial assistant for a banking app. You help users manage their money with personality and emojis.

User Context:
- Name: ${userContext.name}
- Current Balance: $${userContext.balance}
- Savings Balance: $${userContext.savingsBalance}
- Recent Transactions: ${userContext.recentTransactions.length} transactions
- Active Geofences: ${userContext.activeGeofences}
- Savings Locks: ${userContext.savingsLocks}

Recent Transaction Summary:
${userContext.recentTransactions.map((t) => `- ${t.type}: $${t.amount} (${t.status}) - ${t.description}`).join("\n")}

Guidelines:
- Be friendly, helpful, and use emojis 🐵💰
- Provide specific financial advice based on their actual data
- Suggest Money Buddy features like geofencing, savings locks, etc.
- Keep responses concise but informative
- Always be encouraging about their financial journey
- If asked about specific transactions or balances, use their real data
- Help them understand Money Buddy features and how to use them

Remember: You're their personal financial buddy, not just a generic assistant!`

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Hi! I'm Money Buddy, your AI financial assistant! 🐵💰 I'm here to help you manage your money and make the most of your banking experience. I can see your account details and help you with transfers, savings, geofencing, and more! What would you like to know or do today?",
            },
          ],
        },
      ],
    })

    const result = await chat.sendMessage(message)
    const response = result.response.text()

    // Save chat message to database
    try {
      const { error } = await supabase.from("chat_messages").insert({
        user_id: user.id,
        message: message,
        response: response,
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error saving chat message:", error)
      }
    } catch (saveError) {
      console.error("Error saving chat to database:", saveError)
      // Don't fail the request if we can't save the chat
    }

    return NextResponse.json({
      response,
      userContext: {
        balance: userContext.balance,
        savingsBalance: userContext.savingsBalance,
        recentTransactionsCount: userContext.recentTransactions.length,
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}
