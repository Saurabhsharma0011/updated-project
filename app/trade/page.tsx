"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { VersionedTransaction } from '@solana/web3.js';
import { TokenTrade } from "@/components/TokenTrade";
import { Button } from "@/components/ui/button";

export default function TradePage() {
  const [tab, setTab] = useState("buy");
  const [creating, setCreating] = useState(false);
  const [createdWallet, setCreatedWallet] = useState<any>(null);
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<any[]>([]);

  // Fetch balance when wallet connects
  const fetchBalance = useCallback(async () => {
    if (publicKey) {
      const bal = await connection.getBalance(publicKey);
      setBalance(bal / 1e9);
    }
  }, [publicKey, connection]);

  // React to wallet connection
  useEffect(() => {
    if (connected) fetchBalance();
  }, [connected, fetchBalance]);

  // Create wallet handler
  const handleCreateWallet = async () => {
    setCreating(true);
    setCreatedWallet(null);
    const response = await fetch("https://pumpportal.fun/api/create-wallet", { method: "GET" });
    const data = await response.json();
    setCreatedWallet(data);
    setCreating(false);
  };

  // WebSocket for real-time tokens
  useEffect(() => {
    const ws = new window.WebSocket('wss://pumpportal.fun/api/data');
    ws.onopen = () => {
      ws.send(JSON.stringify({ method: "subscribeNewToken" }));
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.method === "subscribeNewToken" && data.data) {
          setTokens((prev) => [data.data, ...prev.slice(0, 19)]); // keep only latest 20
        }
      } catch {}
    };
    return () => ws.close();
  }, []);

  return (
    <div className="min-h-screen bg-[#181A20] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm mb-6">
        <div className="bg-[#23242b] rounded-xl p-4 mb-2">
          <div className="text-white font-bold mb-2 text-sm">Latest pump.fun Tokens</div>
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
            {tokens.length === 0 && <div className="text-xs text-gray-400">Loading...</div>}
            {tokens.map((t, i) => (
              <div key={t.ca + i} className="flex items-center gap-2 text-xs bg-[#181A20] rounded p-2">
                <span className="font-bold text-[#1ED760]">{t.name}</span>
                <span className="text-gray-400">CA: {t.ca.slice(0, 4)}...{t.ca.slice(-4)}</span>
                <span className="text-yellow-400 ml-auto">MC: {t.marketCap}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-[#23242b] rounded-xl p-6 w-full max-w-sm shadow-lg">
        <TokenTrade />
      </div>
      
      <div className="flex gap-4 mt-8">
        <Button
          className="bg-[#1ED760] text-black font-semibold px-6 py-2 rounded hover:bg-[#1bc653] transition-colors"
          onClick={handleCreateWallet}
          disabled={creating}
        >
          {creating ? 'Creating...' : 'Create Coin'}
        </Button>
        <div className="wallet-adapter-button-wrapper">
          <WalletMultiButton 
            className="!bg-[#1ED760] !text-black !font-semibold !px-6 !py-2 !rounded !hover:bg-[#1bc653] !transition-colors !border-none" 
          />
        </div>
      </div>
      
      {createdWallet && (
        <div className="mt-6 bg-[#23242b] text-white p-4 rounded max-w-sm w-full break-words text-xs">
          <div className="mb-2 font-bold">New Wallet Created</div>
          <div><b>Public Key:</b> {createdWallet.publicKey}</div>
          <div><b>Private Key:</b> {createdWallet.privateKey}</div>
          <div><b>API Key:</b> {createdWallet.apiKey}</div>
          <div className="mt-2 text-yellow-400">Save your private key securely!</div>
        </div>
      )}
    </div>
  );
}
