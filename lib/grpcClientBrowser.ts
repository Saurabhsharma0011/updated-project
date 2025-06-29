"use client"

// This is a browser-compatible wrapper for gRPC calls
// Since gRPC-web is more complicated to set up, we'll use a simple API wrapper approach

export interface AccountInfoResponse {
  data?: Uint8Array;
  account?: {
    pubkey: string;
    isSigner: boolean;
    isWritable: boolean;
  };
}

/**
 * Fetch account information from a server-side API endpoint that handles the actual gRPC call
 * This function can be safely called from browser environments
 */
export const getAccountInfo = async (tokenAddress: string): Promise<AccountInfoResponse> => {
  try {
    // Call a server-side API route that will make the gRPC call
    // You would need to set up this API route in your Next.js app
    const response = await fetch(`/api/solana/account-info?address=${encodeURIComponent(tokenAddress)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching account info via API:', error);
    throw error;
  }
};
