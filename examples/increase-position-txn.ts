/**
 * Increase Position Transaction Example for the Ranger SOR API SDK
 * 
 * This example demonstrates how to:
 * 1. Get transaction instructions for increasing a position
 * 2. Decode the transaction message from base64
 * 3. Sign the transaction
 * 4. Send the transaction to the Solana network
 * 
 * yarn example:increase-txn
 */
import { SorApi, TradeSide } from '../src';
import dotenv from 'dotenv';
import { 
  Connection,
  Keypair,
  TransactionMessage,
  VersionedTransaction
} from '@solana/web3.js';
import bs58 from 'bs58';

// Load environment variables
dotenv.config();

// API key from environment variables
const API_KEY = process.env.API_KEY || 'sk_test_limited456';

// Solana RPC URL
const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';

// Create SOR API client
const sorApi = new SorApi({
  apiKey: API_KEY
});

/**
 * Converts a base64 string to a Uint8Array
 */
function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

/**
 * Get transaction instructions, sign, and send to the Solana network
 */
async function increasePositionTransaction() {
  console.log('Getting transaction instructions for increasing a position...');
  
  // Check if we have a private key in the environment
  const privateKeyBase58 = process.env.WALLET_PRIVATE_KEY;
  if (!privateKeyBase58) {
    console.error('Error: WALLET_PRIVATE_KEY environment variable is required');
    console.log('Please add your private key to the .env file:');
    console.log('WALLET_PRIVATE_KEY=your_base58_encoded_private_key');
    return;
  }
  
  try {
    // Create a keypair from the private key
    const privateKeyBytes = bs58.decode(privateKeyBase58);
    const keypair = Keypair.fromSecretKey(privateKeyBytes);
    const publicKey = keypair.publicKey.toBase58();
    
    console.log(`Using wallet: ${publicKey}`);
    
    // Create a connection to the Solana network
    const connection = new Connection(RPC_URL);
    
    // 1. Get transaction instructions for increasing a position
    const request = {
      fee_payer: publicKey,
      symbol: 'SOL',
      side: 'Long' as TradeSide,
      size: 1000, // change to your desired size
      collateral: 11.18, // change to your desired collateral - will determine your leverage
      size_denomination: 'SOL',
      collateral_denomination: 'USDC',
      adjustment_type: 'Increase' as const
    };
    
    console.log('Getting transaction instructions...');
    const response = await sorApi.increasePosition(request);
    console.log('Transaction instructions received');
    
    // 2. Manually reconstruct and deserialize the transaction
    console.log('Deserializing transaction...');
    
    // Convert base64 to byte array
    const messageBytes = base64ToArrayBuffer(response.message);
    
    // Directly deserialize to a VersionedTransaction using the buffer
    const transaction = VersionedTransaction.deserialize(messageBytes);
    
    if (!transaction) {
      throw new Error('Failed to deserialize transaction from message');
    }
    
    console.log('Transaction deserialized successfully');
    
    // 3. Get a recent blockhash
    console.log('Getting recent blockhash...');
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    
    // Update the transaction's blockhash if needed
    if (transaction.message && 'recentBlockhash' in transaction.message) {
      console.log('Updating transaction with recent blockhash...');
      transaction.message.recentBlockhash = blockhash;
    }
    
    // 4. Sign the transaction
    console.log('Signing transaction...');
    transaction.sign([keypair]);
    
    // 5. Send the transaction to the Solana network
    console.log('Sending transaction to Solana network...');
    const serializedTransaction = transaction.serialize();
    const signature = await connection.sendRawTransaction(serializedTransaction, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });
    
    console.log('Transaction sent successfully!');
    console.log(`Transaction signature: ${signature}`);
    console.log(`Solana Explorer URL: https://explorer.solana.com/tx/${signature}`);
    
    // 6. Wait for confirmation
    console.log('Waiting for transaction confirmation...');
    const confirmationStrategy = {
      signature,
      blockhash,
      lastValidBlockHeight
    };
    
    const confirmation = await connection.confirmTransaction(confirmationStrategy);
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
    }
    
    console.log('Transaction confirmed successfully!');
    
    return signature;
  } catch (error) {
    console.error('Error creating or sending transaction:', error);
    throw error;
  }
}

/**
 * Run the example
 */
async function runExample() {
  try {
    await increasePositionTransaction();
    console.log('\nExample completed successfully!');
  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Run the example
runExample(); 