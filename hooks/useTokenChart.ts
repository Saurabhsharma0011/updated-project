"use client";

import { useState, useCallback } from 'react';
import { type TokenData } from '@/lib/TokenChartManager';

export const useTokenChart = () => {
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);

  const openChart = useCallback((token: TokenData) => {
    setSelectedToken(token);
    setIsChartOpen(true);
  }, []);

  const closeChart = useCallback(() => {
    setIsChartOpen(false);
    setSelectedToken(null);
  }, []);

  return {
    isChartOpen,
    selectedToken,
    openChart,
    closeChart,
  };
};
