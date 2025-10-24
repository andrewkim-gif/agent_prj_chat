/**
 * Token Price Chart Test
 * Tests the basic functionality of the token price chart component
 */

import {
  fetchTokenPriceHistory,
  calculatePriceChange,
  formatPrice,
  formatVolume,
  calculateMovingAverage,
  CHART_TIMEFRAMES
} from '../services/priceChartApi'

// Test API functions
describe('Token Price Chart API', () => {
  test('fetchTokenPriceHistory returns valid data', async () => {
    const data = await fetchTokenPriceHistory('0x123', 'CROSS', '7D', 'USD')

    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBe(100) // 100 data points for 7 days

    // Check data structure
    if (data.length > 0) {
      const point = data[0]
      expect(typeof point.timestamp).toBe('number')
      expect(typeof point.price).toBe('number')
      expect(typeof point.volume).toBe('number')
      expect(point.price).toBeGreaterThan(0)
    }
  })

  test('calculatePriceChange works correctly', () => {
    const mockData = [
      { timestamp: 1, price: 100, volume: 1000 },
      { timestamp: 2, price: 110, volume: 1100 },
      { timestamp: 3, price: 105, volume: 1050 }
    ]

    const result = calculatePriceChange(mockData)
    expect(result.change).toBe(5) // 105 - 100
    expect(result.changePercent).toBe(5) // (5/100) * 100
    expect(result.isPositive).toBe(true)
  })

  test('formatPrice formats correctly', () => {
    expect(formatPrice(1.23456789, 'USD')).toContain('$1.23')
    expect(formatPrice(0.001234, 'USD')).toContain('$0.001234')
  })

  test('formatVolume formats correctly', () => {
    expect(formatVolume(1000)).toBe('1.0K')
    expect(formatVolume(1000000)).toBe('1.0M')
    expect(formatVolume(1000000000)).toBe('1.0B')
    expect(formatVolume(500)).toBe('500')
  })

  test('calculateMovingAverage works correctly', () => {
    const mockData = [
      { timestamp: 1, price: 10, volume: 1000 },
      { timestamp: 2, price: 20, volume: 1000 },
      { timestamp: 3, price: 30, volume: 1000 }
    ]

    const ma = calculateMovingAverage(mockData, 2)
    expect(ma.length).toBe(3)
    expect(ma[0]).toBe(10) // First value unchanged
    expect(ma[1]).toBe(15) // (10 + 20) / 2
    expect(ma[2]).toBe(25) // (20 + 30) / 2
  })

  test('CHART_TIMEFRAMES are properly defined', () => {
    expect(Array.isArray(CHART_TIMEFRAMES)).toBe(true)
    expect(CHART_TIMEFRAMES.length).toBeGreaterThan(0)

    CHART_TIMEFRAMES.forEach(tf => {
      expect(typeof tf.label).toBe('string')
      expect(typeof tf.value).toBe('string')
      expect(typeof tf.days).toBe('number')
      expect(tf.days).toBeGreaterThan(0)
    })
  })
})

// Manual test log (to be called in browser console)
export function testTokenPriceChart() {
  console.log('🧪 Testing Token Price Chart functionality...')

  // Test 1: Basic API call
  fetchTokenPriceHistory('0x123', 'CROSS', '7D', 'USD')
    .then(data => {
      console.log('✅ fetchTokenPriceHistory success:', {
        dataPoints: data.length,
        firstPoint: data[0],
        lastPoint: data[data.length - 1]
      })
    })
    .catch(error => {
      console.error('❌ fetchTokenPriceHistory failed:', error)
    })

  // Test 2: Price change calculation
  const testData = [
    { timestamp: 1, price: 100, volume: 1000 },
    { timestamp: 2, price: 110, volume: 1100 }
  ]
  const priceChange = calculatePriceChange(testData)
  console.log('✅ calculatePriceChange:', priceChange)

  // Test 3: Format functions
  console.log('✅ formatPrice tests:', {
    'high price': formatPrice(1234.56, 'USD'),
    'low price': formatPrice(0.001234, 'USD')
  })

  console.log('✅ formatVolume tests:', {
    'thousands': formatVolume(1500),
    'millions': formatVolume(1500000),
    'billions': formatVolume(1500000000)
  })

  console.log('🎉 All manual tests completed! Check the component in the UI.')
}

// Browser test instructions
console.log(`
🧪 Token Price Chart Testing Instructions:

1. Open browser console
2. Run: testTokenPriceChart()
3. Navigate to wallet page
4. Click on any token to open detail modal
5. Click on "Price Chart" tab
6. Verify:
   - Chart loads without errors
   - Timeframe buttons work (24H, 7D, 30D, etc.)
   - Moving Averages toggle works
   - Tooltip shows on hover
   - Price change indicators display correctly
   - Chart updates when switching timeframes

Expected behavior:
- Chart should show realistic price movement
- Different tokens should have different price levels
- Responsive design should work on different screen sizes
`)