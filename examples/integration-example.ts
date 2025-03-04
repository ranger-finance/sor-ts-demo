/**
 * Integration example for the Ranger SOR API SDK
 * 
 * This example demonstrates how to integrate the SDK with your existing code structure.
 */
import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { SorApi, TradeSide, AdjustmentType as SdkAdjustmentType } from '../src';
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

// Types from your existing code
export type Side = 'buy' | 'sell';
export type AdjustmentType = 'open' | 'close' | 'modify';
export type Action = 'order' | 'cancel' | 'modify';

export interface TradeParams {
  symbol: string;
  size: number;
  collateral: number;
  side: Side;
  adjustment_type: AdjustmentType;
  action: Action;
}

/**
 * Converts a base64 string to a Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Maps your side type to the SDK's TradeSide type
 */
function mapSideToTradeSide(side: Side): TradeSide {
  return side === 'buy' ? 'Long' : 'Short';
}

/**
 * Maps your adjustment type to the SDK's AdjustmentType
 */
function mapAdjustmentType(adjustmentType: AdjustmentType): SdkAdjustmentType {
  switch (adjustmentType) {
    case 'open':
      return 'Increase';
    case 'close':
      return 'CloseFlash';
    case 'modify':
      return 'DecreaseFlash';
    default:
      throw new Error(`Unsupported adjustment type: ${adjustmentType}`);
  }
}

/**
 * Decodes a transaction message from JSON response
 */
export function decodeMessageFromJson(json: any): VersionedTransaction {
  if (!json.message || typeof json.message !== 'string') {
    throw new Error('Failed to get transaction message from response');
  }
  
  const messageBytes = base64ToUint8Array(json.message);
  return VersionedTransaction.deserialize(messageBytes);
}

/**
 * Integration function that uses the SDK to execute trades
 * This is a demonstration of how to integrate the SDK with your existing code
 */
export async function executeTrade(
  params: TradeParams,
  publicKey: string,
  signAndSendTransaction: (tx: VersionedTransaction) => Promise<string>
): Promise<string> {
  const { symbol, size, collateral, side, adjustment_type } = params;
  
  console.log('Executing trade with params:', params);
  
  // Map your types to SDK types
  const tradeSide = mapSideToTradeSide(side);
  const sdkAdjustmentType = mapAdjustmentType(adjustment_type);
  
  try {
    // Execute the appropriate action based on the adjustment type
    console.log(`Would call SDK with ${sdkAdjustmentType} operation`);
    console.log('In a real implementation, this would call the actual API endpoint');
    
    // For demonstration purposes, we'll simulate a successful API call
    // In a real implementation, you would call the actual API and process the response
    
    // Simulate a successful transaction signature
    const signature = 'simulated_signature_' + Math.random().toString(36).substring(2, 15);
    
    console.log('Transaction would be sent successfully!');
    console.log('Simulated signature:', signature);
    
    return signature;
  } catch (error) {
    console.error('Error executing trade:', error);
    throw error;
  }
}

/**
 * Example usage in a React component
 */
function ExampleReactComponent() {
  // This is a mock implementation for demonstration purposes
  const publicKey = 'AcohpNxNXY62cuUdcb5d38TAzWYvYXW89Q5X6eYNR2iB';
  
  // Mock implementation of signAndSendTransaction
  const signAndSendTransaction = async (tx: VersionedTransaction): Promise<string> => {
    console.log('Simulating transaction signing and sending...');
    return 'simulated_signature_for_example_purposes';
  };
  
  // Example handler for a trade button
  const handleTrade = async () => {
    try {
      // Example of opening a position
      console.log('\n--- Example: Opening a position ---');
      let signature = await executeTrade(
        {
          symbol: 'SOL',
          size: 1.0,
          collateral: 10.0,
          side: 'buy',
          adjustment_type: 'open',
          action: 'order'
        },
        publicKey,
        signAndSendTransaction
      );
      
      console.log('Trade executed with signature:', signature);
      
      // Example of modifying a position
      console.log('\n--- Example: Modifying a position ---');
      signature = await executeTrade(
        {
          symbol: 'SOL',
          size: 0.5,
          collateral: 5.0,
          side: 'buy',
          adjustment_type: 'modify',
          action: 'modify'
        },
        publicKey,
        signAndSendTransaction
      );
      
      console.log('Position modified with signature:', signature);
      
      // Example of closing a position
      console.log('\n--- Example: Closing a position ---');
      signature = await executeTrade(
        {
          symbol: 'SOL',
          size: 0,
          collateral: 0,
          side: 'buy',
          adjustment_type: 'close',
          action: 'order'
        },
        publicKey,
        signAndSendTransaction
      );
      
      console.log('Position closed with signature:', signature);
      
    } catch (error) {
      console.error('Trade failed:', error);
    }
  };
  
  // This would be a React component in a real implementation
  return {
    handleTrade
  };
}

/**
 * Run the example
 */
async function runExample() {
  try {
    console.log('Running integration example...');
    console.log('This example demonstrates how to integrate the SDK with your existing code structure');
    console.log('It shows how to map your existing types to the SDK types and execute trades');
    
    // Get the example component
    const component = ExampleReactComponent();
    
    // Simulate clicking the trade button
    await component.handleTrade();
    
    console.log('\nExample completed successfully!');
  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Only run the example if this file is executed directly
if (require.main === module) {
  runExample();
} 