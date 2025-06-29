"use client";

import React, { useEffect, useRef, useState } from 'react';
import { TokenChartManager, type TokenData } from '@/lib/TokenChartManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';

interface TokenChartProps {
  token: TokenData;
  isOpen: boolean;
  onClose: () => void;
}

export const TokenChart: React.FC<TokenChartProps> = ({ token, isOpen, onClose }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartManagerRef = useRef<TokenChartManager | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && chartContainerRef.current) {
      // Initialize chart manager
      chartManagerRef.current = new TokenChartManager();
      
      // Create a unique container ID
      const containerId = `chart-container-${Date.now()}`;
      chartContainerRef.current.id = containerId;
      
      // Load chart data
      const loadChart = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          if (chartManagerRef.current) {
            await chartManagerRef.current.showTokenChart(token, containerId);
          }
        } catch (err) {
          console.error('Error loading chart:', err);
          setError('Failed to load chart data');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadChart();
    }

    // Cleanup when closing
    return () => {
      if (chartManagerRef.current) {
        chartManagerRef.current.destroy();
        chartManagerRef.current = null;
      }
    };
  }, [isOpen, token]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{token.name} - Price Chart</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chart Container */}
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                  <p>Loading chart data...</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <div className="text-center text-red-600">
                  <p>{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setError(null);
                      // Retry loading chart
                      if (chartManagerRef.current && chartContainerRef.current) {
                        chartManagerRef.current.showTokenChart(token, chartContainerRef.current.id);
                      }
                    }}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}
            
            <div
              ref={chartContainerRef}
              className="w-full h-96 bg-white rounded border"
            />
          </div>

          {/* Token Info */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-semibold">Token:</span> {token.name}
              </div>
              <div>
                <span className="font-semibold">Contract:</span>{' '}
                <span className="font-mono text-xs">
                  {token.bondingCurveAddress.slice(0, 8)}...{token.bondingCurveAddress.slice(-8)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenChart;
