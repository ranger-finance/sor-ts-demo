/**
 * Symbols example for the Ranger SOR API SDK
 * 
 * This example demonstrates how to fetch available symbols using the SDK.
 */
import { SorApi } from '../src';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// API key from environment variables
const API_KEY = process.env.RANGER_API_KEY || 'sk_test_limited456';

// Create SOR API client
const sorApi = new SorApi({
  apiKey: API_KEY,
  solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com'
});

/**
 * Fetches available symbols
 */
async function getSymbols() {
  try {
    console.log('Fetching available symbols...');
    
    // In a real implementation, this would call the actual API
    // For demonstration purposes, we'll simulate the API response
    console.log('In a real implementation, this would call the actual API endpoint');
    
    // Simulate a symbols response
    const mockSymbols = [
      {
        name: 'SOL-PERP',
        base_currency: 'SOL',
        quote_currency: 'USD',
        price_precision: 2,
        size_precision: 4,
        min_size: 0.0001,
        max_leverage: 20,
        platforms: ['JUPITER', 'FLASH']
      },
      {
        name: 'BTC-PERP',
        base_currency: 'BTC',
        quote_currency: 'USD',
        price_precision: 1,
        size_precision: 6,
        min_size: 0.000001,
        max_leverage: 20,
        platforms: ['JUPITER', 'FLASH']
      },
      {
        name: 'ETH-PERP',
        base_currency: 'ETH',
        quote_currency: 'USD',
        price_precision: 2,
        size_precision: 5,
        min_size: 0.00001,
        max_leverage: 20,
        platforms: ['JUPITER', 'FLASH']
      }
    ];
    
    console.log('Symbols received:');
    console.log(JSON.stringify(mockSymbols, null, 2));
    
    return mockSymbols;
  } catch (error) {
    console.error('Error fetching symbols:', error);
    throw error;
  }
}

/**
 * Run the example
 */
async function runExample() {
  try {
    console.log('Running symbols example...');
    
    // Fetch available symbols
    await getSymbols();
    
    console.log('\nExample completed successfully!');
  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Only run the example if this file is executed directly
if (require.main === module) {
  runExample();
} 