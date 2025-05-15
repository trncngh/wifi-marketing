import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Forward the request to the controller URL
    const controllerUrl = process.env.CONTROLLER_URL

    if (!controllerUrl) {
      return NextResponse.json({ error: "Controller URL not configured" }, { status: 500 })
    }

    console.log("Forwarding request to controller:", data)

    const response = await fetch(controllerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Controller responded with status: ${response.status}`)
    }

    const result = await response.json()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in wifi-auth API route:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
