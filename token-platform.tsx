"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Plus, Info, Clock, RefreshCw, TrendingUp } from "lucide-react"
import { useTokenData } from "./hooks/useTokenData"
import { type TokenData } from "./hooks/useWebSocket"
import { ConnectionStatus } from "./components/ConnectionStatus"
import { SocialLinks } from "./components/SocialLinks"
import { PriceDisplay } from "./components/PriceDisplay"
import { TokenTrade } from "./components/TokenTrade"
import { TokenChart } from "./components/TokenChart"
import { useTokenChart } from "./hooks/useTokenChart"
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Progress } from "@/components/ui/progress"
import { useDexPaidStatus } from "./hooks/useDexPaidStatus"
import { type TokenData as ChartTokenData } from "./lib/TokenChartManager"

const TokenCard = ({
  token,
  priceData,
  isLoadingPrice,
  onOpenChart,
}: {
  token: TokenData
  priceData?: any
  isLoadingPrice: boolean
  onOpenChart: (token: ChartTokenData) => void
}) => {
  const { isPaid: isDexPaid } = useDexPaidStatus(token.mint, token.category)

  const handleChartClick = () => {
    // Convert TokenData to ChartTokenData format
    const chartToken: ChartTokenData = {
      name: token.name,
      description: token.description || '',
      bondingCurveAddress: token.mint, // Using mint as bonding curve address
    }
    onOpenChart(chartToken)
  }

  const timeAgo = () => {
    const now = Date.now()
    const diff = now - token.created_timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const truncateAddress = (address: string) => {
    if (address.length <= 8) return address
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case "bonding":
        return (
          <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
            BONDING
          </Badge>
        )
      case "graduated":
        return (
          <Badge variant="secondary" className="bg-green-600 text-white text-xs">
            GRADUATED
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-slate-600 text-white text-xs">
            NEW
          </Badge>
        )
    }
  }

  const getBorderColor = (category?: string) => {
    switch (category) {
      case "bonding":
        return "border-l-blue-400"
      case "graduated":
        return "border-l-green-400"
      default:
        return "border-l-slate-400"
    }
  }

  return (
    <Card
      className={`bg-slate-900/50 border-slate-800 border-l-4 ${getBorderColor(token.category)} hover:bg-slate-900/70 transition-colors`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold overflow-hidden">
              {token.image && token.image !== "/placeholder.svg?height=48&width=48" ? (
                <img
                  src={token.image || "/placeholder.svg"}
                  alt={token.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = `<span class="text-white font-semibold">${getInitials(token.name)}</span>`
                    }
                  }}
                />
              ) : (
                <span className="text-white font-semibold">{getInitials(token.name)}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-semibold text-sm truncate" title={token.name}>
                {token.name}
              </h3>
              <p className="text-slate-400 text-xs">{token.symbol}</p>
              {token.description && (
                <p className="text-slate-500 text-xs mt-1 line-clamp-2" title={token.description}>
                  {token.description}
                </p>
              )}
              <p className="text-slate-600 text-xs mt-1" title={token.mint}>
                {truncateAddress(token.mint)}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <Clock className="w-3 h-3" />
              {timeAgo()}
            </div>
            {getCategoryBadge(token.category)}
          </div>
        </div>

        {/* Real-time Price Data */}
        <div className="mb-3">
          <PriceDisplay
            price={priceData?.price || 0}
            marketCap={priceData?.marketCap || token.market_cap_value || 0}
            liquidity={priceData?.liquidity || 0}
            priceChange24h={priceData?.priceChange24h || 0}
            volume24h={priceData?.volume24h || 0}
            isLoading={isLoadingPrice}
          />
        </div>

        {/* Bonding Curve Progress */}
        {priceData?.curvePercent > 0 && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400">Bonding Curve</span>
              <span className="text-xs font-semibold text-blue-400">{priceData.curvePercent.toFixed(2)}%</span>
            </div>
            <Progress value={priceData.curvePercent} className="h-2 [&>div]:bg-blue-600" />
          </div>
        )}

        {/* Creator Info */}
        <div className="mb-3 pb-2 border-b border-slate-800">
          <div className="flex justify-between">
            <div>
              <p className="text-slate-500 text-xs">Creator</p>
              <p className="text-slate-300 text-xs font-mono" title={token.creator}>
                {truncateAddress(token.creator)}
              </p>
            </div>
            {isDexPaid && (
              <div className="text-right">
                <p className="text-slate-500 text-xs">DEX PAID</p>
                <p className="text-green-400 text-xs font-mono">✅</p>
              </div>
            )}
          </div>
        </div>

        {/* Social Links with Emojis */}
        <SocialLinks twitter={token.twitter} telegram={token.telegram} website={token.website} />
        
        {/* Buy/Sell and Chart Functionality */}
        <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Trade {token.symbol}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
              <DialogHeader>
                <DialogTitle>Trade {token.name} ({token.symbol})</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                {/* Import TokenTrade component */}
                <div className="TokenTradeWrapper">
                  {/* @ts-ignore */}
                  <TokenTrade 
                    tokenMint={token.mint} 
                    tokenName={token.name} 
                    tokenSymbol={token.symbol} 
                    defaultTab="buy" 
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={handleChartClick}
            variant="outline" 
            className="w-full bg-transparent border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            View Chart
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const WalletConnectButton = () => {
  return (
    <WalletMultiButton className="!bg-blue-600 !hover:bg-blue-700 !text-white !font-semibold !px-4 !py-2 !rounded !border-none !h-[38px]" />
  )
}

export default function TokenPlatform() {
  const [activeTab, setActiveTab] = useState<"new" | "bonding" | "graduated">("new")
  const {
    newTokens,
    bondingTokens,
    graduatedTokens,
    isConnected,
    error,
    rawMessages,
    priceData,
    isPriceLoading,
    refetchPrices,
  } = useTokenData()

  // Chart functionality
  const { isChartOpen, selectedToken, openChart, closeChart } = useTokenChart()

  // Get tokens for current tab
  const getDisplayTokens = () => {
    switch (activeTab) {
      case "bonding":
        return bondingTokens
      case "graduated":
        return graduatedTokens
      default:
        return newTokens
    }
  }

  const displayTokens = getDisplayTokens()

  const getTabDescription = (tab: string) => {
    switch (tab) {
      case "bonding":
        return "Tokens with market cap between $10K - $50K"
      case "graduated":
        return "Tokens that crossed bonding curve (>$50K market cap)"
      default:
        return "Recently created tokens (<$10K market cap)"
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold">TokenPlatform</h1>
            <div className="flex gap-4">
              <a href="/" className="text-white hover:text-blue-400 transition-colors">Home</a>
              <a href="/trade" className="text-white hover:text-blue-400 transition-colors">Trade</a>
            </div>
            <ConnectionStatus isConnected={isConnected} error={error} rawMessages={rawMessages} />
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={refetchPrices}
              variant="outline"
              size="sm"
              className="bg-transparent border-slate-600 text-slate-400 hover:bg-slate-800"
              disabled={isPriceLoading}
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isPriceLoading ? "animate-spin" : ""}`} />
              {isPriceLoading ? "Loading..." : "Refresh Prices"}
            </Button>
            {Object.keys(priceData).length > 0 && (
              <Badge variant="secondary" className="bg-green-600 text-white text-xs">
                {Object.keys(priceData).length} prices loaded
              </Badge>
            )}
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Token
            </Button>
            <WalletConnectButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Headers */}
        <div className="flex gap-8 mb-8">
          <button
            onClick={() => setActiveTab("new")}
            className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
              activeTab === "new" ? "border-slate-400 text-white" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <div className="w-3 h-6 bg-slate-400 rounded-sm"></div>
            <span className="text-lg font-semibold">New Tokens</span>
            <Badge variant="secondary" className="bg-slate-600 text-white text-xs">
              {newTokens.length}
            </Badge>
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab("bonding")}
            className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
              activeTab === "bonding"
                ? "border-blue-400 text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <div className="w-3 h-6 bg-blue-400 rounded-sm"></div>
            <span className="text-lg font-semibold">Bonding Tokens</span>
            <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
              {bondingTokens.length}
            </Badge>
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab("graduated")}
            className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
              activeTab === "graduated"
                ? "border-green-400 text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <div className="w-3 h-6 bg-green-400 rounded-sm"></div>
            <span className="text-lg font-semibold">Graduated Tokens</span>
            <Badge variant="secondary" className="bg-green-600 text-white text-xs">
              {graduatedTokens.length}
            </Badge>
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Description */}
        <div className="mb-6">
          <p className="text-slate-400 text-sm">{getTabDescription(activeTab)}</p>
        </div>

        {/* Token Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTokens.length > 0 ? (
            displayTokens.map((token) => (
              <TokenCard
                key={token.mint}
                token={token}
                priceData={priceData[token.mint]}
                isLoadingPrice={isPriceLoading}
                onOpenChart={openChart}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-400 text-lg">
                {isConnected ? `No ${activeTab} tokens available yet...` : "Connecting to live feed..."}
              </p>
              <p className="text-slate-500 text-sm mt-2">{getTabDescription(activeTab)}</p>
            </div>
          )}
        </div>

        {/* Chart Modal */}
        {selectedToken && (
          <TokenChart
            token={selectedToken}
            isOpen={isChartOpen}
            onClose={closeChart}
          />
        )}
      </div>
    </div>
  )
}
