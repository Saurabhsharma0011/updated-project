import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { VersionedTransaction } from '@solana/web3.js';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [tab, setTab] = useState("buy");
  const [creating, setCreating] = useState(false);
  const [createdWallet, setCreatedWallet] = useState<any>(null);
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<any[]>([]);
  const [tokenCA, setTokenCA] = useState("");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(10);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txLoading, setTxLoading] = useState(false);

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

  // Handle trade (buy/sell)
  const handleTrade = async () => {
    setTxStatus(null);
    if (!connected || !publicKey || !signTransaction) {
      setTxStatus("Connect your wallet to trade.");
      return;
    }
    if (!tokenCA || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setTxStatus("Enter a valid token CA and amount.");
      return;
    }
    setTxLoading(true);
    try {
      const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: publicKey.toBase58(),
          action: tab,
          mint: tokenCA,
          denominatedInSol: tab === "buy" ? "true" : "false",
          amount: Number(amount),
          slippage: slippage,
          priorityFee: 0.00001,
          pool: "auto"
        })
      });
      if (response.status === 200) {
        const data = await response.arrayBuffer();
        const tx = VersionedTransaction.deserialize(new Uint8Array(data));
        const signed = await signTransaction(tx);
        const sig = await connection.sendTransaction(signed);
        setTxStatus(`Success! Tx: https://solscan.io/tx/${sig}`);
        setAmount("");
        fetchBalance();
      } else {
        setTxStatus("Failed to generate transaction: " + response.statusText);
      }
    } catch (e: any) {
      setTxStatus("Error: " + (e.message || e.toString()));
    }
    setTxLoading(false);
  };

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
        <div className="flex mb-4">
          <button
            className={`flex-1 py-2 rounded-tl-lg rounded-bl-lg text-lg font-semibold ${tab === "buy" ? "bg-[#1ED760] text-black" : "bg-[#181A20] text-white"}`}
            onClick={() => setTab("buy")}
          >
            Buy
          </button>
          <button
            className={`flex-1 py-2 rounded-tr-lg rounded-br-lg text-lg font-semibold ${tab === "sell" ? "bg-[#FF4B4B] text-white" : "bg-[#181A20] text-white"}`}
            onClick={() => setTab("sell")}
          >
            Sell
          </button>
        </div>
        {connected && publicKey && (
          <div className="mb-4 text-xs text-white bg-[#181A20] rounded p-2 flex flex-col gap-1">
            <span>Wallet: {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}</span>
            <span>Balance: {balance !== null ? balance.toFixed(4) : '...'} SOL</span>
          </div>
        )}
        <div className="mb-2">
          <input
            className="w-full bg-[#181A20] border border-[#35363c] rounded px-3 py-2 text-white mb-2 text-xs"
            placeholder="Paste pump.fun token CA here"
            value={tokenCA}
            onChange={e => setTokenCA(e.target.value)}
          />
        </div>
        {tab === "buy" ? (
          <>
            <div className="flex justify-between mb-2">
              <button className="bg-[#23242b] text-[#1ED760] border border-[#1ED760] rounded px-2 py-1 text-xs font-semibold">Switch to YuGiOh6900</button>
              <button className="bg-[#23242b] text-white border border-[#35363c] rounded px-2 py-1 text-xs">Set max slippage</button>
            </div>
            <div className="flex items-center bg-[#181A20] rounded px-3 py-2 mb-3 border border-[#35363c]">
              <input
                className="bg-transparent outline-none text-white flex-1 text-lg"
                type="number"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                disabled={txLoading}
              />
              <span className="mx-2 text-white font-semibold">SOL</span>
              <Image src="/solana.svg" alt="Solana" width={28} height={28} />
            </div>
            <div className="flex gap-2 mb-4">
              <button className="bg-[#23242b] text-white px-3 py-1 rounded text-xs" onClick={() => setAmount("")}>Reset</button>
              <button className="bg-[#23242b] text-white px-3 py-1 rounded text-xs" onClick={() => setAmount("0.1")}>0.1 SOL</button>
              <button className="bg-[#23242b] text-white px-3 py-1 rounded text-xs" onClick={() => setAmount("0.5")}>0.5 SOL</button>
              <button className="bg-[#23242b] text-white px-3 py-1 rounded text-xs" onClick={() => setAmount("1")}>1 SOL</button>
              <button className="bg-[#23242b] text-white px-3 py-1 rounded text-xs" onClick={() => setAmount(balance ? balance.toString() : "")}>Max</button>
            </div>
            <button
              className="w-full bg-[#1ED760] text-black font-semibold py-2 rounded mt-2 disabled:opacity-60"
              onClick={handleTrade}
              disabled={!connected || txLoading}
            >
              {txLoading ? 'Processing...' : connected ? 'Trade' : 'Log in to trade'}
            </button>
          </>
        ) : (
          <>
            <div className="flex justify-end mb-2">
              <button className="bg-[#23242b] text-white border border-[#35363c] rounded px-2 py-1 text-xs">Set max slippage</button>
            </div>
            <div className="flex items-center bg-[#181A20] rounded px-3 py-2 mb-3 border border-[#35363c]">
              <input
                className="bg-transparent outline-none text-white flex-1 text-lg"
                type="number"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                disabled={txLoading}
              />
              <span className="mx-2 text-white font-semibold">YuGiOh6900</span>
              <Image src="/file.svg" alt="Token" width={28} height={28} />
            </div>
            <div className="flex gap-2 mb-4">
              <button className="bg-[#23242b] text-white px-3 py-1 rounded text-xs" onClick={() => setAmount("")}>Reset</button>
              <button className="bg-[#23242b] text-white px-3 py-1 rounded text-xs" onClick={() => setAmount("25")}>25%</button>
              <button className="bg-[#23242b] text-white px-3 py-1 rounded text-xs" onClick={() => setAmount("50")}>50%</button>
              <button className="bg-[#23242b] text-white px-3 py-1 rounded text-xs" onClick={() => setAmount("75")}>75%</button>
              <button className="bg-[#23242b] text-white px-3 py-1 rounded text-xs" onClick={() => setAmount("100")}>100%</button>
            </div>
            <button
              className="w-full bg-[#FF4B4B] text-white font-semibold py-2 rounded mt-2 disabled:opacity-60"
              onClick={handleTrade}
              disabled={!connected || txLoading}
            >
              {txLoading ? 'Processing...' : connected ? 'Trade' : 'Log in to trade'}
            </button>
          </>
        )}
        {txStatus && (
          <div className={`mt-4 text-xs rounded p-2 ${txStatus.startsWith('Success') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>{txStatus}</div>
        )}
      </div>
      <div className="flex gap-4 mt-8">
        <button
          className="bg-[#1ED760] text-black font-semibold px-6 py-2 rounded hover:bg-[#1bc653] transition-colors"
          onClick={handleCreateWallet}
          disabled={creating}
        >
          {creating ? 'Creating...' : 'create coin'}
        </button>
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
