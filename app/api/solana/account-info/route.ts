import { NextRequest, NextResponse } from 'next/server';
import { grpcClient } from '@/lib/grpcClient';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const address = url.searchParams.get('address');
  
  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter is required' },
      { status: 400 }
    );
  }

  try {
    const accountInfo = await new Promise((resolve, reject) => {
      grpcClient.getAccountInfo(
        {
          account: {
            address,
            commitment: 'confirmed',
          },
        },
        (err: any, response: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        }
      );
    });
    
    return NextResponse.json(accountInfo);
  } catch (error) {
    console.error('gRPC error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account info' },
      { status: 500 }
    );
  }
}
