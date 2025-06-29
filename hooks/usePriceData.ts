"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface PriceData {
  price: number
  marketCap: number
  volume24h: number
  priceChange24h: number
  liquidity: number
  curvePercent: number
}

interface TokenPriceMap {
  [mintAddress: string]: PriceData
}

export const usePriceData = (tokenMints: string[], onPriceUpdate?: (mint: string, priceData: PriceData) => void) => {
  const [priceData, setPriceData] = useState<TokenPriceMap>({})
  const [isLoading, setIsLoading] = useState(false)
  const prevTokenMintsRef = useRef<string[]>([])

  const fetchTokenPrice = useCallback(
    async (mintAddress: string): Promise<PriceData | null> => {
      try {
        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))

        const response = await fetch(`/api/proxy/mevx?q=${mintAddress}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.pools && data.pools.length > 0) {
            const pool = data.pools[0]
            const report24h = pool.poolReports?.find((r: any) => r.interval === "24h")

            const priceInfo = {
              price: Number.parseFloat(pool.priceUsd) || 0,
              marketCap: Number.parseFloat(pool.marketCap) || 0,
              volume24h: report24h ? (Number.parseFloat(report24h.buyVolume) || 0) + (Number.parseFloat(report24h.sellVolume) || 0) : 0,
              priceChange24h: report24h ? Number.parseFloat(report24h.priceChangePercent) || 0 : 0,
              liquidity: Number.parseFloat(pool.liquidUsd) || 0,
              curvePercent: Number.parseFloat(pool.metadata?.curvePercent) || 0,
            }

            // Call the callback to update token categories
            if (onPriceUpdate) {
              onPriceUpdate(mintAddress, priceInfo)
            }

            return priceInfo
          }
        }

        // If the API fails or returns no data, return null
        console.log(`No price data available for token: ${mintAddress}`)
        return null
      } catch (error) {
        console.log(`Error fetching price for ${mintAddress}:`, error)
        return null
      }
    },
    [onPriceUpdate],
  )

  const fetchPrices = useCallback(
    async (mintsToFetch: string[]) => {
      if (mintsToFetch.length === 0) return

      setIsLoading(true)
      const newPriceData: TokenPriceMap = {}

      // Fetch prices in smaller batches to avoid overwhelming APIs
      const batchSize = 3
      for (let i = 0; i < mintsToFetch.length; i += batchSize) {
        const batch = mintsToFetch.slice(i, i + batchSize)

        // Process each token in the batch
        for (const mint of batch) {
          try {
            const price = await fetchTokenPrice(mint)
            if (price) {
              newPriceData[mint] = price
            }
          } catch (error) {
            console.log(`Skipping price fetch for ${mint} due to error:`, error)
          }
        }

        // Longer delay between batches to respect rate limits
        if (i + batchSize < mintsToFetch.length) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }

      setPriceData((prev) => ({ ...prev, ...newPriceData }))
      setIsLoading(false)
    },
    [fetchTokenPrice],
  )

  useEffect(() => {
    const newMints = tokenMints.filter((mint) => !prevTokenMintsRef.current.includes(mint))

    if (newMints.length > 0) {
      fetchPrices(newMints)
    }

    prevTokenMintsRef.current = tokenMints
  }, [tokenMints, fetchPrices])

  const refetchAll = useCallback(() => {
    fetchPrices(tokenMints)
  }, [tokenMints, fetchPrices])

  return { priceData, isLoading, refetch: refetchAll }
}
