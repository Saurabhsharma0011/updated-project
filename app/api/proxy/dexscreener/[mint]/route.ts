import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { mint: string } }) {
  const { mint } = params

  if (!mint) {
    return NextResponse.json({ error: "Mint address is required" }, { status: 400 })
  }

  try {
    const response = await fetch(`https://api.dexscreener.com/orders/v1/solana/${mint}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      // DexScreener returns 404 if the order is not found, which is a valid case.
      if (response.status === 404) {
        return NextResponse.json({ status: "not_found" })
      }
      const errorText = await response.text()
      console.error("DexScreener API Error:", errorText)
      return NextResponse.json({ error: `DexScreener API failed with status: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error proxying to DexScreener API:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}