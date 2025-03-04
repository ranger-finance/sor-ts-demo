/**
 * Adapter example for the Ranger SOR API SDK
 * 
 * This example demonstrates how to adapt the existing code to work with our SDK.
 */
import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import { SorApi, TradeSide, AdjustmentType as SdkAdjustmentType } from '../src';
import bs58 from 'bs58';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// API key from environment variables
const API_KEY = process.env.RANGER_API_KEY || 'sk_test_limited456';

// Example wallet public key and private key
// WARNING: Never hardcode private keys in production code!
// This is just for demonstration purposes.
const WALLET_PUBLIC_KEY = 'AcohpNxNXY62cuUdcb5d38TAzWYvYXW89Q5X6eYNR2iB';
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || '';

// Create SOR API client
const sorApi = new SorApi({
  apiKey: API_KEY,
  // You can customize the RPC URL if needed
  solanaRpcUrl: 'https://api.devnet.solana.com' // Using devnet for testing
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
function base64ToUint8Array(base64: string): Uint8Array {
  return Buffer.from(base64, 'base64');
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
 * Adapter function to execute a trade using the SDK
 */
async function executeTrade(params: TradeParams): Promise<string> {
  const { symbol, size, collateral, side, adjustment_type, action } = params;
  
  console.log('Executing trade with params:', params);
  
  // Map your types to SDK types
  const tradeSide = mapSideToTradeSide(side);
  const sdkAdjustmentType = mapAdjustmentType(adjustment_type);
  
  // Create a keypair from the private key (if available)
  if (!WALLET_PRIVATE_KEY) {
    throw new Error('No private key provided. Set the WALLET_PRIVATE_KEY environment variable.');
  }
  
  const privateKeyBytes = bs58.decode(WALLET_PRIVATE_KEY);
  const keypair = Keypair.fromSecretKey(privateKeyBytes);
  
  // Execute the appropriate action based on the adjustment type
  let transactionResponse;
  
  switch (sdkAdjustmentType) {
    case 'Increase':
      transactionResponse = await sorApi.increasePosition({
        fee_payer: WALLET_PUBLIC_KEY,
        symbol,
        side: tradeSide,
        size,
        collateral,
        size_denomination: symbol,
        collateral_denomination: 'USDC',
        adjustment_type: 'Increase'
      });
      break;
    
    case 'CloseFlash':
      transactionResponse = await sorApi.closePosition({
        fee_payer: WALLET_PUBLIC_KEY,
        symbol,
        side: tradeSide,
        adjustment_type: 'CloseFlash'
      });
      break;
    
    case 'DecreaseFlash':
      transactionResponse = await sorApi.decreasePosition({
        fee_payer: WALLET_PUBLIC_KEY,
        symbol,
        side: tradeSide,
        size,
        collateral,
        size_denomination: symbol,
        collateral_denomination: 'USDC',
        adjustment_type: 'DecreaseFlash'
      });
      break;
    
    default:
      throw new Error(`Unsupported SDK adjustment type: ${sdkAdjustmentType}`);
  }
  
  console.log('Transaction instructions received');
  
  // Decode the transaction message
  const messageBytes = base64ToUint8Array(transactionResponse.message);
  const transaction = VersionedTransaction.deserialize(messageBytes);
  
  // Get a recent blockhash
  const connection = sorApi.getConnection();
  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  
  // Update the transaction with the recent blockhash
  if (transaction.message) {
    transaction.message.recentBlockhash = blockhash;
  }
  
  // Sign the transaction
  transaction.sign([keypair]);
  
  // Send the transaction (commented out for safety)
  /*
  const signature = await connection.sendRawTransaction(transaction.serialize(), {
    skipPreflight: false,
  });
  
  console.log('Transaction sent successfully!');
  console.log('Signature:', signature);
  
  // Confirm the transaction
  const confirmation = await connection.confirmTransaction(signature, 'confirmed');
  
  if (confirmation.value.err) {
    throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
  }
  
  return signature;
  */
  
  // Simulate the transaction sending
  console.log('Transaction would be signed with keypair for public key:', keypair.publicKey.toString());
  console.log('(Actual transaction sending is commented out for this example)');
  
  return 'simulated_signature_for_example_purposes';
}

/**
 * Example usage
 */
async function runExample() {
  try {
    // Example 1: Open a position
    const openSignature = await executeTrade({
      symbol: 'SOL',
      size: 1.0,
      collateral: 10.0,
      side: 'buy',
      adjustment_type: 'open',
      action: 'order'
    });
    
    console.log('Open position transaction signature:', openSignature);
    
    // Example 2: Modify a position
    const modifySignature = await executeTrade({
      symbol: 'SOL',
      size: 0.5,
      collateral: 5.0,
      side: 'buy',
      adjustment_type: 'modify',
      action: 'order'
    });
    
    console.log('Modify position transaction signature:', modifySignature);
    
    // Example 3: Close a position
    const closeSignature = await executeTrade({
      symbol: 'SOL',
      size: 0,
      collateral: 0,
      side: 'buy',
      adjustment_type: 'close',
      action: 'order'
    });
    
    console.log('Close position transaction signature:', closeSignature);
    
    console.log('\nAll examples completed successfully!');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run the example
runExample(); 