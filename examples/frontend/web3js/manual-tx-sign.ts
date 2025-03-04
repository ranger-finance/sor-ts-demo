/**
 * Manual Transaction Signing Example for the Ranger SOR API SDK
 * 
 * This example demonstrates how to manually create and sign a transaction
 * to test the transaction signing workflow.
 */
import { SorApi, TradeSide } from '../../../src';
import dotenv from 'dotenv';
import { 
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction
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
 * Manually create and sign a simple Solana transaction
 */
async function manualTransactionSign() {
  console.log('Creating and signing a manual transaction...');
  
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
    console.log(`Connecting to Solana network at ${RPC_URL}`);
    const connection = new Connection(RPC_URL, 'confirmed');
    
    // Get the current balance
    const balance = await connection.getBalance(keypair.publicKey);
    console.log(`Current wallet balance: ${balance / LAMPORTS_PER_SOL} SOL`);
    
    if (balance < 0.001 * LAMPORTS_PER_SOL) {
      console.log('Warning: Low balance. This transaction might fail.');
    }
    
    // Send SOL to a well-known address instead of creating a new one
    // Using the Solana Foundation's address as an example recipient
    const recipientPublicKey = new PublicKey('JBpj7yM7JwHWrTZYhA2cRwi3UTbZYGQz6KSdqMHhKk8k');
    console.log(`Using recipient wallet: ${recipientPublicKey.toBase58()}`);
    
    // Create a simple transaction to transfer a small amount of SOL
    console.log('Creating a simple transfer transaction...');
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: recipientPublicKey,
        lamports: 1000, // 0.000001 SOL
      })
    );
    
    // Get a recent blockhash
    console.log('Getting recent blockhash...');
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = keypair.publicKey;
    
    // Sign and send the transaction
    console.log('Signing and sending transaction...');
    
    // Just sign the transaction first to verify that works
    transaction.sign(keypair);
    console.log('Transaction signed successfully');
    
    // Now send the signed transaction
    console.log('Sending signed transaction...');
    const rawTransaction = transaction.serialize();
    
    try {
      const signature = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      
      console.log('Transaction sent successfully!');
      console.log(`Transaction signature: ${signature}`);
      console.log(`Solana Explorer URL: https://explorer.solana.com/tx/${signature}`);
      
      // Wait for confirmation
      console.log('Waiting for confirmation...');
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
      }
      
      console.log('Transaction confirmed successfully!');
      return signature;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in manual transaction signing:', error);
    throw error;
  }
}

/**
 * Run the example
 */
async function runExample() {
  try {
    await manualTransactionSign();
    console.log('\nExample completed successfully!');
  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Run the example
runExample(); 