/**
 * Transaction Inspection Example for the Ranger SOR API SDK
 * 
 * This example inspects the transaction response from the increasePosition
 * method to understand its format and structure.
 */
import { SorApi, TradeSide } from '../src';
import dotenv from 'dotenv';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import fs from 'fs';

// Load environment variables
dotenv.config();

// API key from environment variables
const API_KEY = process.env.API_KEY || 'sk_test_limited456';

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
 * Inspect the transaction response
 */
async function inspectTransactionResponse() {
  console.log('Inspecting transaction response...');
  
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
    
    // Get transaction instructions for increasing a position
    const request = {
      fee_payer: publicKey,
      symbol: 'SOL',
      side: 'Long' as TradeSide,
      size: 0.1,
      collateral: 1.0,
      size_denomination: 'SOL',
      collateral_denomination: 'USDC',
      adjustment_type: 'Increase' as const
    };
    
    console.log('Getting transaction instructions...');
    const response = await sorApi.increasePosition(request);
    console.log('Transaction instructions received');
    
    // Inspect the response
    console.log('\nTransaction Response:');
    console.log('Response type:', typeof response);
    console.log('Response keys:', Object.keys(response));
    
    if (response.message) {
      console.log('\nMessage:');
      console.log('Type:', typeof response.message);
      console.log('Length:', response.message.length);
      console.log('Preview:', response.message.substring(0, 100) + '...');
      
      // Save the message to a file for further inspection
      const messageBytes = base64ToArrayBuffer(response.message);
      fs.writeFileSync('transaction_message.bin', Buffer.from(messageBytes));
      console.log('Message saved to transaction_message.bin');
      
      // Convert to hex for inspection
      let hexString = '';
      for (let i = 0; i < Math.min(100, messageBytes.length); i++) {
        hexString += messageBytes[i].toString(16).padStart(2, '0') + ' ';
      }
      console.log('Hex representation (first 100 bytes):', hexString + '...');
    }
    
    if (response.meta) {
      console.log('\nMetadata:');
      console.log(JSON.stringify(response.meta, null, 2));
    }
    
    console.log('\nInspection complete');
    
    return 'inspection_complete';
  } catch (error) {
    console.error('Error inspecting transaction:', error);
    throw error;
  }
}

/**
 * Run the example
 */
async function runExample() {
  try {
    await inspectTransactionResponse();
    console.log('\nExample completed successfully!');
  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Run the example
runExample(); 