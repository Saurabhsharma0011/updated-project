"use client"

import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface PriceDisplayProps {
  price: number
  marketCap: number
  liquidity: number
  priceChange24h: number
  volume24h: number
  isLoading?: boolean
}

export const PriceDisplay = ({
  price,
  marketCap,
  liquidity,
  priceChange24h,
  volume24h,
  isLoading,
}: PriceDisplayProps) => {
  const formatPrice = (value: number) => {
    if (value === 0) return "$0.00"
    if (value < 0.000001) return `$${value.toExponential(2)}`
    if (value < 0.01) return `$${value.toFixed(6)}`
    if (value < 1) return `$${value.toFixed(4)}`
    return `$${value.toFixed(2)}`
  }

  const formatMarketCap = (value: number) => {
    if (value === 0) return "$0"
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${value.toFixed(0)}`
  }

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return "text-green-400"
    if (change < 0) return "text-red-400"
    return "text-slate-400"
  }

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3" />
    if (change < 0) return <TrendingDown className="w-3 h-3" />
    return <Minus className="w-3 h-3" />
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div>
          <p className="text-slate-500 uppercase tracking-wide mb-1">Price</p>
          <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
        </div>
        <div>
          <p className="text-slate-500 uppercase tracking-wide mb-1">Market Cap</p>
          <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
        </div>
        <div>
          <p className="text-slate-500 uppercase tracking-wide mb-1">Liquidity</p>
          <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  // Show "No data" state when price is 0 and not loading
  const hasData = price > 0 || marketCap > 0 || liquidity > 0

  if (!hasData) {
    return (
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div>
          <p className="text-slate-500 uppercase tracking-wide mb-1">Price</p>
          <p className="text-slate-600 font-semibold">No data</p>
        </div>
        <div>
          <p className="text-slate-500 uppercase tracking-wide mb-1">Market Cap</p>
          <p className="text-slate-600 font-semibold">No data</p>
        </div>
        <div>
          <p className="text-slate-500 uppercase tracking-wide mb-1">Liquidity</p>
          <p className="text-slate-600 font-semibold">No data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div>
          <p className="text-slate-500 uppercase tracking-wide mb-1">Price</p>
          <div className="flex items-center gap-1">
            <p className="text-white font-semibold">{formatPrice(price)}</p>
            {priceChange24h !== 0 && (
              <Badge
                variant="secondary"
                className={`${getPriceChangeColor(priceChange24h)} bg-transparent border-0 p-0 h-auto text-xs`}
              >
                {getPriceChangeIcon(priceChange24h)}
              </Badge>
            )}
          </div>
          {priceChange24h !== 0 && (
            <p className={`${getPriceChangeColor(priceChange24h)} text-xs`}>
              {priceChange24h > 0 ? "+" : ""}
              {priceChange24h.toFixed(2)}%
            </p>
          )}
        </div>
        <div>
          <p className="text-slate-500 uppercase tracking-wide mb-1">Market Cap</p>
          <p className="text-white font-semibold">{formatMarketCap(marketCap)}</p>
        </div>
        <div>
          <p className="text-slate-500 uppercase tracking-wide mb-1">Liquidity</p>
          <p className="text-white font-semibold">{formatMarketCap(liquidity)}</p>
        </div>
      </div>

      {volume24h > 0 && (
        <div className="pt-2 border-t border-slate-800">
          <p className="text-slate-500 text-xs">
            24h Volume: <span className="text-white font-semibold">{formatMarketCap(volume24h)}</span>
          </p>
        </div>
      )}
    </div>
  )
}
