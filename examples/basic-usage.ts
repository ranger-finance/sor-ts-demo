/**
 * Basic usage example for the Ranger SOR API SDK
 * 
 * This example demonstrates how to use the SDK to get quotes, positions, and execute trades.
 */
import { SorApi, OrderMetadataRequest, TradeSide } from '../src';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// API key from environment variables
const API_KEY = process.env.RANGER_API_KEY || 'sk_test_limited456';

// Example wallet public key
const WALLET_PUBLIC_KEY = 'AcohpNxNXY62cuUdcb5d38TAzWYvYXW89Q5X6eYNR2iB';

// Create SOR API client
const sorApi = new SorApi({
  apiKey: API_KEY
});

/**
 * Example 1: Get a quote for a potential trade
 */
async function getQuoteExample() {
  console.log('Example 1: Getting a quote for a potential trade...');
  
  const request: OrderMetadataRequest = {
    fee_payer: WALLET_PUBLIC_KEY,
    symbol: 'SOL',
    side: 'Long' as TradeSide,
    size: 1.0,
    collateral: 10.0,
    size_denomination: 'SOL',
    collateral_denomination: 'USDC',
    adjustment_type: 'Increase'
  };
  
  try {
    const quote = await sorApi.getOrderMetadata(request);
    console.log('Quote received:');
    console.log(JSON.stringify(quote, null, 2));
    return quote;
  } catch (error) {
    console.error('Error getting quote:', error);
    throw error;
  }
}

/**
 * Example 2: Get positions for a wallet
 */
async function getPositionsExample() {
  console.log('\nExample 2: Getting positions for a wallet...');
  
  try {
    const positions = await sorApi.getPositions(
      'Adjmfo9hneSPSzkXj5JYMp9KqiN4zdy6Vsm31a8WVEdg',
      {
        platforms: ['DRIFT', 'FLASH'],
        symbols: ['SOL-PERP']
      }
    );
    
    console.log('Positions received:');
    console.log(JSON.stringify(positions, null, 2));
    return positions;
  } catch (error) {
    console.error('Error getting positions:', error);
    throw error;
  }
}

/**
 * Example 3: Increase a position (get transaction instructions)
 */
async function increasePositionExample() {
  console.log('\nExample 3: Increasing a position (getting transaction instructions)...');
  
  const request = {
    fee_payer: WALLET_PUBLIC_KEY,
    symbol: 'SOL',
    side: 'Long' as TradeSide,
    size: 1.0,
    collateral: 10.0,
    size_denomination: 'SOL',
    collateral_denomination: 'USDC',
    adjustment_type: 'Increase' as const
  };
  
  try {
    const response = await sorApi.increasePosition(request);
    console.log('Transaction instructions received:');
    console.log('Message:', response.message.substring(0, 50) + '... (truncated)');
    
    if (response.meta) {
      console.log('Metadata:', response.meta);
    }
    
    return response;
  } catch (error) {
    console.error('Error increasing position:', error);
    throw error;
  }
}

/**
 * Run all examples
 */
async function runExamples() {
  try {
    await getQuoteExample();
    await getPositionsExample();
    await increasePositionExample();
    
    console.log('\nAll examples completed successfully!');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run the examples
runExamples(); 