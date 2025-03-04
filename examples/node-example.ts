/**
 * Node.js example for the Ranger SOR API SDK
 * 
 * This example demonstrates how to use the SDK in a Node.js environment
 * with a keypair for transaction signing.
 */
import { SorApi, TradeSide } from '../src';
import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
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

/**
 * Converts a base64 string to a Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  return Buffer.from(base64, 'base64');
}

/**
 * Example: Get a quote and then increase a position
 */
async function getQuoteAndIncrease() {
  console.log('Getting a quote and then increasing a position...');
  
  try {
    // Step 1: Get a quote
    const quoteResponse = await sorApi.getOrderMetadata({
      fee_payer: WALLET_PUBLIC_KEY,
      symbol: 'SOL',
      side: 'Long' as TradeSide,
      size: 1.0,
      collateral: 10.0,
      size_denomination: 'SOL',
      collateral_denomination: 'USDC',
      adjustment_type: 'Quote'
    });
    
    console.log('Quote received:');
    console.log(JSON.stringify(quoteResponse, null, 2));
    
    // Step 2: Increase position
    const increaseResponse = await sorApi.increasePosition({
      fee_payer: WALLET_PUBLIC_KEY,
      symbol: 'SOL',
      side: 'Long' as TradeSide,
      size: 1.0,
      collateral: 10.0,
      size_denomination: 'SOL',
      collateral_denomination: 'USDC',
      adjustment_type: 'Increase'
    });
    
    console.log('Transaction instructions received:');
    console.log('Message:', increaseResponse.message.substring(0, 50) + '... (truncated)');
    
    // Step 3: Create a keypair from the private key (if available)
    if (!WALLET_PRIVATE_KEY) {
      console.log('No private key provided. Skipping transaction signing.');
      console.log('To test transaction signing, set the WALLET_PRIVATE_KEY environment variable.');
      return;
    }
    
    const privateKeyBytes = bs58.decode(WALLET_PRIVATE_KEY);
    const keypair = Keypair.fromSecretKey(privateKeyBytes);
    
    // Step 4: Decode the transaction message
    const messageBytes = base64ToUint8Array(increaseResponse.message);
    const transaction = VersionedTransaction.deserialize(messageBytes);
    
    // Step 5: Get a recent blockhash
    const connection = sorApi.getConnection();
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    
    // Step 6: Update the transaction with the recent blockhash
    if (transaction.message) {
      transaction.message.recentBlockhash = blockhash;
    }
    
    // Step 7: Sign the transaction
    transaction.sign([keypair]);
    
    // Step 8: Send the transaction (commented out for safety)
    /*
    const signature = await connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
    });
    
    console.log('Transaction sent successfully!');
    console.log('Signature:', signature);
    
    // Step 9: Confirm the transaction
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      console.error('Transaction failed:', confirmation.value.err.toString());
    } else {
      console.log('Transaction confirmed successfully!');
    }
    */
    
    // Simulate the transaction sending
    console.log('Transaction would be signed with keypair for public key:', keypair.publicKey.toString());
    console.log('(Actual transaction sending is commented out for this example)');
    
    return {
      success: true,
      simulatedSignature: 'simulated_signature_for_example_purposes'
    };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

/**
 * Example: Get positions
 */
async function getPositions() {
  console.log('\nGetting positions...');
  
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
 * Run the examples
 */
async function runExamples() {
  try {
    await getQuoteAndIncrease();
    await getPositions();
    
    console.log('\nAll examples completed successfully!');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run the examples
runExamples(); 