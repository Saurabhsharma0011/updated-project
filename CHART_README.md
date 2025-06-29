# Token Chart Integration

This project now includes a token price chart feature using the `lightweight-charts` library.

## Features

- **Interactive Price Charts**: View candlestick charts for any token
- **Real-time Updates**: Charts update automatically every 30 seconds
- **MEVX API Integration**: Fetches candlestick data from the MEVX API
- **Responsive Design**: Charts adapt to different screen sizes
- **Modal Interface**: Charts open in a beautiful modal overlay

## Components

### 1. TokenChartManager (`lib/TokenChartManager.ts`)
Core chart functionality that handles:
- API data fetching from MEVX
- Chart creation and configuration
- Real-time updates
- Data transformation

### 2. TokenChart (`components/TokenChart.tsx`)
React component that provides:
- Modal interface for charts
- Loading and error states
- Responsive design
- Easy integration with existing components

### 3. useTokenChart (`hooks/useTokenChart.ts`)
Custom hook for:
- Chart state management
- Open/close functionality
- Selected token tracking

## Usage

### Basic Usage
The chart functionality is already integrated into the main token platform. Simply click the "View Chart" button on any token card to open the price chart.

### Programmatic Usage
```typescript
import { useTokenChart } from './hooks/useTokenChart';
import { TokenChart } from './components/TokenChart';

function MyComponent() {
  const { isChartOpen, selectedToken, openChart, closeChart } = useTokenChart();

  const handleOpenChart = () => {
    const token = {
      name: "My Token",
      description: "A great token",
      bondingCurveAddress: "your-token-address-here"
    };
    openChart(token);
  };

  return (
    <div>
      <button onClick={handleOpenChart}>Open Chart</button>
      
      {selectedToken && (
        <TokenChart
          token={selectedToken}
          isOpen={isChartOpen}
          onClose={closeChart}
        />
      )}
    </div>
  );
}
```

### Direct Chart Manager Usage
```typescript
import { TokenChartManager } from './lib/TokenChartManager';

const chartManager = new TokenChartManager();

const token = {
  name: "My Token",
  description: "A great token",
  bondingCurveAddress: "your-bonding-curve-address"
};

// Show chart in a container element
await chartManager.showTokenChart(token, 'chart-container-id');

// Update chart with new data
await chartManager.updateChart(token.bondingCurveAddress);

// Clean up
chartManager.destroy();
```

## API Integration

The chart uses the MEVX API to fetch candlestick data:
- **Endpoint**: `https://api.mevx.io/api/v1/candlesticks`
- **Parameters**: 
  - `chain=sol` (Solana)
  - `poolAddress` (token's bonding curve address)
  - `timeBucket=5m` (5-minute intervals)
  - `limit=300` (last 300 candles)

## Chart Configuration

The chart is configured with:
- **Upward candles**: Green (#26a69a)
- **Downward candles**: Red (#ef5350)
- **Time scale**: Shows time but not seconds
- **Auto-fit**: Automatically fits content to view
- **Responsive**: Adjusts to container size

## Real-time Updates

Charts automatically update every 30 seconds when open. This can be customized by modifying the interval in the `startRealTimeUpdates` method.

## Error Handling

The chart system includes comprehensive error handling:
- **API failures**: Shows error message with retry option
- **No data**: Shows "No chart data available" message
- **Loading states**: Shows spinner while fetching data
- **Network issues**: Gracefully handles connection problems

## Styling

The chart uses Tailwind CSS classes and integrates with your existing dark theme. The modal overlay is styled to match your application's design system.

## Dependencies

- `lightweight-charts`: ^5.0.8 - Core charting library
- `lucide-react`: Icons for UI
- React 19+ and Next.js 15+ (your existing setup)

## Notes

- The chart uses the token's `mint` address as the bonding curve address for API calls
- Charts are destroyed when closed to prevent memory leaks
- The system is optimized for performance with lazy loading and efficient updates
