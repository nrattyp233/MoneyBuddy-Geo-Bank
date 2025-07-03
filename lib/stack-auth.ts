import { StackServerApp, StackClientApp } from "@stackframe/stack"

/**
 * Lazy singleton for the Stack **server-side** SDK.
 * You MUST call this from a server context (`app/route.ts`, Server Action, etc.).
 */
let serverApp: StackServerApp | null = null

export function getStackServerApp() {
  if (typeof window !== "undefined") {
    throw new Error("getStackServerApp() must be called on the server.")
  }

  if (serverApp) return serverApp

  const secretServerKey = process.env.STACK_SECRET_SERVER_KEY
  const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID
  const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY

  if (!secretServerKey) {
    throw new Error("STACK_SECRET_SERVER_KEY env variable is missing – copy it from the Stack dashboard.")
  }
  if (!projectId || !publishableClientKey) {
    throw new Error("NEXT_PUBLIC_STACK_PROJECT_ID or NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY is missing.")
  }

  serverApp = new StackServerApp({
    tokenStore: "nextjs-cookie",
    projectId,
    publishableClientKey,
    secretServerKey,
  })

  return serverApp
}

/**
 * Browser-only Stack client instance.
 * Will be `null` during SSR to avoid accidental use.
 */
export const stackClientApp =
  typeof window === "undefined"
    ? null
    : new StackClientApp({
        projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
        publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
      })
