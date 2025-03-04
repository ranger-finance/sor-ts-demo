/**
 * Quotes example for the Ranger SOR API SDK
 * 
 * This example demonstrates how to fetch quotes using the SDK.
 */
import { SorApi, TradeSide } from '../src';
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
 * Fetches quotes for a given symbol and side
 */
async function getQuotes(symbol: string, side: TradeSide, size: number) {
  try {
    console.log(`Fetching quotes for ${size} ${symbol} (${side})...`);
    
    // In a real implementation, this would call the actual API
    // For demonstration purposes, we'll simulate the API response
    console.log('In a real implementation, this would call the actual API endpoint');
    
    // Simulate a quote response
    const mockQuote = {
      symbol,
      side,
      size,
      price: side === 'Long' ? 220.50 : 219.75,
      timestamp: new Date().toISOString(),
      platforms: [
        {
          name: 'JUPITER',
          price: side === 'Long' ? 220.75 : 219.50,
          available_size: size * 2
        },
        {
          name: 'FLASH',
          price: side === 'Long' ? 220.25 : 220.00,
          available_size: size * 1.5
        }
      ]
    };
    
    console.log('Quote received:');
    console.log(JSON.stringify(mockQuote, null, 2));
    
    return mockQuote;
  } catch (error) {
    console.error('Error fetching quotes:', error);
    throw error;
  }
}

/**
 * Run the example
 */
async function runExample() {
  try {
    console.log('Running quotes example...');
    
    // Fetch quotes for SOL Long
    await getQuotes('SOL-PERP', 'Long', 1.0);
    
    console.log('\n---\n');
    
    // Fetch quotes for SOL Short
    await getQuotes('SOL-PERP', 'Short', 0.5);
    
    console.log('\nExample completed successfully!');
  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Only run the example if this file is executed directly
if (require.main === module) {
  runExample();
} 