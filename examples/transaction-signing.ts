/**
 * Transaction signing example for the Ranger SOR API SDK
 * 
 * This example demonstrates how to sign and send transactions using a Solana keypair.
 */
import { SorApi, TradeSide } from '../src';
import { Keypair, VersionedTransaction } from '@solana/web3.js';
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
 * Example: Increase a position and sign the transaction
 */
async function increasePositionAndSign() {
  console.log('Increasing a position and signing the transaction...');
  
  // Check if we have a private key
  if (!WALLET_PRIVATE_KEY) {
    console.log('No private key provided. Skipping transaction signing.');
    console.log('To test transaction signing, set the WALLET_PRIVATE_KEY environment variable.');
    return;
  }
  
  try {
    // Step 1: Get transaction instructions for increasing a position
    const increaseResponse = await sorApi.increasePosition({
      fee_payer: WALLET_PUBLIC_KEY,
      symbol: 'SOL',
      side: 'Long' as TradeSide,
      size: 0.1, // Using a smaller size for testing
      collateral: 1.0, // Using smaller collateral for testing
      size_denomination: 'SOL',
      collateral_denomination: 'USDC',
      adjustment_type: 'Increase'
    });
    
    console.log('Transaction instructions received');
    
    // Step 2: Create a keypair from the private key
    const privateKeyBytes = bs58.decode(WALLET_PRIVATE_KEY);
    const keypair = Keypair.fromSecretKey(privateKeyBytes);
    
    // Step 3: Define a function to sign the transaction with the keypair
    const signTransaction = async (tx: VersionedTransaction): Promise<VersionedTransaction> => {
      tx.sign([keypair]);
      return tx;
    };
    
    // Step 4: Execute the transaction
    console.log('Signing and sending transaction...');
    
    // In a real application, you would uncomment this code
    // For this example, we'll just simulate the signing
    /*
    const result = await sorApi.executeTransaction(
      increaseResponse,
      signTransaction
    );
    
    console.log('Transaction executed successfully!');
    console.log('Signature:', result.signature);
    */
    
    // Simulate the signing process
    console.log('Transaction would be signed with keypair for public key:', keypair.publicKey.toString());
    console.log('(Actual transaction sending is commented out for this example)');
    
    return {
      success: true,
      simulatedSignature: 'simulated_signature_for_example_purposes'
    };
  } catch (error) {
    console.error('Error increasing position and signing transaction:', error);
    throw error;
  }
}

/**
 * Run the example
 */
async function runExample() {
  try {
    await increasePositionAndSign();
    console.log('\nExample completed successfully!');
  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Run the example
runExample(); 