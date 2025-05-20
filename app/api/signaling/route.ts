import { type NextRequest, NextResponse } from "next/server"

// In-memory store for active connections (in a production app, use Redis or similar)
const connections: Record<string, any> = {}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { meetingId, type, payload, sender } = data

    // Store connection info or relay to other participants
    if (!connections[meetingId]) {
      connections[meetingId] = {}
    }

    // In a real app, you would broadcast this to other participants
    // For now, we'll just store it
    if (type === "join") {
      connections[meetingId][sender] = { joined: true, timestamp: Date.now() }
      return NextResponse.json({ success: true, participants: Object.keys(connections[meetingId]) })
    }

    // For other message types (offer, answer, ice-candidate)
    // You would relay these to the appropriate recipient

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Signaling error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const meetingId = request.nextUrl.searchParams.get("meetingId")

  if (!meetingId || !connections[meetingId]) {
    return NextResponse.json({ participants: [] })
  }

  return NextResponse.json({
    participants: Object.keys(connections[meetingId]),
    count: Object.keys(connections[meetingId]).length,
  })
}
