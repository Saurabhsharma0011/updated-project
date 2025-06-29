"use client"

import { useState, useEffect } from "react"

interface DexPaidStatus {
  isPaid: boolean
  isLoading: boolean
}

export const useDexPaidStatus = (mint: string, category?: string): DexPaidStatus => {
  const [isPaid, setIsPaid] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchStatus = async () => {
      if (category !== "bonding" || !mint) {
        setIsPaid(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/proxy/dexscreener/${mint}`)
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data) && data.length > 0 && data[0].status === "approved") {
            setIsPaid(true)
          } else {
            setIsPaid(false)
          }
        } else {
          setIsPaid(false)
        }
      } catch (error) {
        console.error("Error fetching DEX paid status:", error)
        setIsPaid(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatus()
  }, [mint, category])

  return { isPaid, isLoading }
}