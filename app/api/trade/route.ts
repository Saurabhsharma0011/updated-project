import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Forward the request to pumpportal.fun API
    const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    // If successful, just forward the response
    if (response.ok) {
      const data = await response.arrayBuffer();
      return new NextResponse(data, {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      });
    } else {
      // Handle API error
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || response.statusText },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Trade API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
