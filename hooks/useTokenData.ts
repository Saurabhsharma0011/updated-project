"use client"

import { useMemo } from "react"
import { useWebSocket } from "./useWebSocket"
import { usePriceData } from "./usePriceData"

export const useTokenData = () => {
  const {
    allTokens,
    newTokens,
    bondingTokens,
    graduatedTokens,
    isConnected,
    error,
    rawMessages,
    updateTokenWithPriceData,
  } = useWebSocket()

  const tokenMints = useMemo(() => allTokens.map((token) => token.mint), [allTokens])

  const {
    priceData,
    isLoading: isPriceLoading,
    refetch: refetchPrices,
  } = usePriceData(tokenMints, updateTokenWithPriceData)

  return {
    allTokens,
    newTokens,
    bondingTokens,
    graduatedTokens,
    isConnected,
    error,
    rawMessages,
    priceData,
    isPriceLoading,
    refetchPrices,
  }
}