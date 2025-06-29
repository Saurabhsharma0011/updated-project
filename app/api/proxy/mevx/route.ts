import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")

  if (!q) {
    return NextResponse.json({ error: "Mint address (q) is required" }, { status: 400 })
  }

  try {
    const response = await fetch(`https://api.mevx.io/api/v1/pools/search?q=${q}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("MevX API Error:", errorText)
      return NextResponse.json({ error: `MevX API failed with status: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error proxying to MevX API:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}