/**
 * Transaction utility functions for the Ranger SOR API SDK
 */
import { 
  Connection, 
  PublicKey, 
  VersionedTransaction,
  SendTransactionError
} from '@solana/web3.js';
import base64 from 'base64-js';

/**
 * Decodes a base64-encoded transaction message
 */
export function decodeTransactionMessage(base64Message: string): Uint8Array {
  return base64.toByteArray(base64Message);
}

/**
 * Creates a versioned transaction from a base64-encoded message
 */
export function createTransaction(base64Message: string): VersionedTransaction {
  const messageBytes = decodeTransactionMessage(base64Message);
  
  // Use the VersionedTransaction constructor directly with the message bytes
  return VersionedTransaction.deserialize(messageBytes);
}

/**
 * Updates a transaction with a recent blockhash
 */
export async function updateTransactionBlockhash(
  transaction: VersionedTransaction,
  connection: Connection
): Promise<{ transaction: VersionedTransaction, blockhash: string, lastValidBlockHeight: number }> {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  
  // Update the transaction's blockhash
  if (transaction.message) {
    transaction.message.recentBlockhash = blockhash;
  }
  
  return {
    transaction,
    blockhash,
    lastValidBlockHeight
  };
}

/**
 * Signs and sends a transaction
 */
export async function signAndSendTransaction(
  transaction: VersionedTransaction,
  connection: Connection,
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>
): Promise<{ signature: string }> {
  // Update transaction with recent blockhash
  const { transaction: updatedTransaction, blockhash, lastValidBlockHeight } = 
    await updateTransactionBlockhash(transaction, connection);
  
  // Sign the transaction
  const signedTransaction = await signTransaction(updatedTransaction);
  
  // Send the transaction
  const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
    skipPreflight: false,
  });
  
  // Confirm the transaction
  const confirmation = await connection.confirmTransaction(
    {
      signature,
      blockhash,
      lastValidBlockHeight,
    },
    'confirmed'
  );
  
  if (confirmation.value.err) {
    throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
  }
  
  return { signature };
} 