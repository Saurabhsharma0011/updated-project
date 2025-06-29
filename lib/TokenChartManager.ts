import { 
  createChart, 
  ColorType, 
  IChartApi, 
  Time,
  CandlestickData,
  CandlestickSeriesOptions
} from 'lightweight-charts';

// Types for the API response and chart data
interface MEVXCandlestick {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

interface TradingViewCandlestick {
  open: number;
  high: number;
  low: number;
  close: number;
  time: Time;
}

interface TokenData {
  name: string;
  description: string;
  bondingCurveAddress: string;
  // Add other token properties you have
}

export class TokenChartManager {
  private chart: any = null;
  private candlestickSeries: any = null;
  private chartContainer: HTMLElement | null = null;

  constructor() {
    // Chart is initialized when showTokenChart is called
  }

  // Fetch candlestick data from MEVX API
  async fetchCandlestickData(bondingCurveAddress: string): Promise<TradingViewCandlestick[]> {
    try {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const apiUrl = `https://api.mevx.io/api/v1/candlesticks?chain=sol&poolAddress=${bondingCurveAddress}&timeBucket=5m&endTime=${currentTimestamp}&outlier=true&limit=300`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data: MEVXCandlestick[] = await response.json();
      
      // Transform MEVX data to TradingView format
      return data.map((candle: MEVXCandlestick) => ({
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        time: candle.timestamp as Time
      })).sort((a, b) => (a.time as number) - (b.time as number)); // Ensure chronological order
      
    } catch (error) {
      console.error('Error fetching candlestick data:', error);
      return [];
    }
  }

  // Create and display the chart
  async showTokenChart(token: TokenData, containerId: string): Promise<void> {
    try {
      this.chartContainer = document.getElementById(containerId);
      
      if (!this.chartContainer) {
        console.error(`Chart container with id '${containerId}' not found`);
        return;
      }

      // Clear previous chart if exists
      if (this.chart) {
        this.chart.remove();
      }

      // Chart configuration
      const chartOptions = {
        layout: {
          textColor: '#333',
          background: { type: ColorType.Solid, color: '#ffffff' }
        },
        width: this.chartContainer.clientWidth,
        height: 400,
        rightPriceScale: {
          borderVisible: false,
        },
        timeScale: {
          borderVisible: false,
          timeVisible: true,
          secondsVisible: false,
        },
        grid: {
          vertLines: { color: '#f0f0f0' },
          horzLines: { color: '#f0f0f0' }
        }
      };

      // Create chart
      this.chart = createChart(this.chartContainer, chartOptions);
      
      // Add candlestick series
      this.candlestickSeries = this.chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      // Show loading state
      this.showLoadingState();

      // Fetch and display data
      const candlestickData = await this.fetchCandlestickData(token.bondingCurveAddress);
      
      if (candlestickData.length > 0 && this.candlestickSeries) {
        this.candlestickSeries.setData(candlestickData);
        this.chart.timeScale().fitContent();
        this.removeLoadingState();
      } else {
        this.showNoDataState();
      }

      // Handle window resize
      this.handleResize();
      
    } catch (error) {
      console.error('Error creating chart:', error);
      this.showErrorState();
    }
  }

  // Show loading state
  private showLoadingState(): void {
    if (this.chartContainer) {
      const existingLoading = document.getElementById('chart-loading');
      if (existingLoading) existingLoading.remove();
      
      const loadingDiv = document.createElement('div');
      loadingDiv.id = 'chart-loading';
      loadingDiv.innerHTML = `
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
          <div>Loading chart data...</div>
        </div>
      `;
      loadingDiv.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.8); z-index: 1000;';
      this.chartContainer.appendChild(loadingDiv);
    }
  }

  // Remove loading state
  private removeLoadingState(): void {
    const loadingDiv = document.getElementById('chart-loading');
    if (loadingDiv) {
      loadingDiv.remove();
    }
  }

  // Show no data state
  private showNoDataState(): void {
    this.removeLoadingState();
    if (this.chartContainer) {
      const noDataDiv = document.createElement('div');
      noDataDiv.innerHTML = `
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #666;">
          <div>No chart data available for this token</div>
        </div>
      `;
      noDataDiv.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000;';
      this.chartContainer.appendChild(noDataDiv);
    }
  }

  // Show error state
  private showErrorState(): void {
    this.removeLoadingState();
    if (this.chartContainer) {
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = `
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #ef5350;">
          <div>Error loading chart data</div>
        </div>
      `;
      errorDiv.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000;';
      this.chartContainer.appendChild(errorDiv);
    }
  }

  // Handle window resize
  private handleResize(): void {
    if (this.chart && this.chartContainer) {
      const resizeObserver = new ResizeObserver(() => {
        if (this.chart && this.chartContainer) {
          this.chart.applyOptions({
            width: this.chartContainer.clientWidth,
            height: this.chartContainer.clientHeight
          });
        }
      });
      resizeObserver.observe(this.chartContainer);
    }
  }

  // Update chart with new data (for real-time updates)
  async updateChart(bondingCurveAddress: string): Promise<void> {
    if (!this.candlestickSeries) return;
    
    try {
      const newData = await this.fetchCandlestickData(bondingCurveAddress);
      if (newData.length > 0) {
        this.candlestickSeries.setData(newData);
      }
    } catch (error) {
      console.error('Error updating chart:', error);
    }
  }

  // Clean up chart
  destroy(): void {
    if (this.chart) {
      this.chart.remove();
      this.chart = null;
      this.candlestickSeries = null;
    }
  }
}

// Usage example - Token Interface class
export class TokenInterface {
  private chartManager: TokenChartManager;
  private isChartVisible: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.chartManager = new TokenChartManager();
  }

  // Handle token card click
  async handleTokenClick(token: TokenData): Promise<void> {
    try {
      // Show modal or container for chart
      this.showChartModal(token);
      
      // Display chart
      await this.chartManager.showTokenChart(token, 'token-chart-container');
      
      this.isChartVisible = true;
      
      // Start real-time updates every 30 seconds
      this.startRealTimeUpdates(token.bondingCurveAddress);
      
    } catch (error) {
      console.error('Error handling token click:', error);
    }
  }

  // Show chart modal/container
  private showChartModal(token: TokenData): void {
    // Remove existing modal if present
    const existingModal = document.getElementById('token-chart-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal HTML
    const modalHTML = `
      <div id="token-chart-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; border-radius: 8px; padding: 20px; max-width: 90vw; max-height: 90vh; width: 800px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #333;">${token.name} - Price Chart</h2>
            <button id="close-chart-modal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
          </div>
          <div id="token-chart-container" style="position: relative; height: 400px; width: 100%;"></div>
        </div>
      </div>
    `;

    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add close functionality
    const closeBtn = document.getElementById('close-chart-modal');
    const modal = document.getElementById('token-chart-modal');
    
    const closeModal = () => {
      this.hideChartModal();
      this.stopRealTimeUpdates();
    };

    closeBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Add escape key listener
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  // Hide chart modal
  private hideChartModal(): void {
    const modal = document.getElementById('token-chart-modal');
    if (modal) {
      modal.remove();
      this.chartManager.destroy();
      this.isChartVisible = false;
    }
  }

  // Real-time updates
  private startRealTimeUpdates(bondingCurveAddress: string): void {
    this.updateInterval = setInterval(async () => {
      if (this.isChartVisible) {
        await this.chartManager.updateChart(bondingCurveAddress);
      }
    }, 30000); // Update every 30 seconds
  }

  private stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

// Create and export singleton instance
export const tokenInterface = new TokenInterface();

// Export types for use in other components
export type { TokenData, MEVXCandlestick, TradingViewCandlestick };
