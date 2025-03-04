# Ranger SOR API Transaction Integration Guide

This guide explains how to properly integrate transaction instructions from the Ranger SOR API into your application. We created this guide based on our experiments and findings with the Ranger SOR API SDK.

## Understanding the API Response

When you call methods like `increasePosition`, the API returns a response with the following structure:

```json
{
  "message": "base64-encoded-transaction-message",
  "meta": {
    "venues": [...],
    "total_collateral": 0.1,
    "total_size": 0.01
  }
}
```

The `message` field contains a base64-encoded transaction message, and the `meta` field contains useful metadata about the transaction.

## Integration Options

### Option 1: Using the SDK's executeTransaction method (Recommended)

The SDK provides an `executeTransaction` method that handles the deserialization and signing process:

```typescript
// Define a function to sign the transaction
const signTransaction = async (tx: VersionedTransaction): Promise<VersionedTransaction> => {
  // Sign the transaction using your wallet or signer
  tx.sign([keypair]);
  return tx;
};

// Use the SDK's executeTransaction method
const result = await sorApi.executeTransaction(response, signTransaction);
console.log(`Transaction signature: ${result.signature}`);
```

### Option 2: Frontend Integration with walletAdapter

If you're building a frontend application using Solana's wallet adapter:

```typescript
// 1. Get transaction instructions
const response = await sorApi.increasePosition({
  fee_payer: wallet.publicKey.toString(),
  symbol: 'SOL',
  side: 'Long',
  size: 0.01,
  collateral: 0.1,
  size_denomination: 'SOL',
  collateral_denomination: 'USDC',
  adjustment_type: 'Increase'
});

// 2. Send the transaction using the wallet adapter
// Many wallet adapters can directly handle base64 transactions
const signature = await wallet.sendTransaction(response.message);
console.log(`Transaction sent: ${signature}`);
```

### Option 3: Manual Transaction Building (Advanced)

If you need to manually build the transaction:

```typescript
// For Frontend (browser)
const messageBytes = new Uint8Array(atob(response.message).split('').map(c => c.charCodeAt(0)));

// For Node.js
// const messageBytes = Buffer.from(response.message, 'base64');

// Create transaction from the bytes
const transaction = VersionedTransaction.deserialize(messageBytes);

// Sign and send the transaction
transaction.sign([keypair]);
const signature = await connection.sendRawTransaction(transaction.serialize());
```

## Version Compatibility

Pay attention to the version of `@solana/web3.js` you're using:

- The SDK uses version `1.98.0` which may have some compatibility issues with certain response formats
- If you encounter deserialization errors, consider trying a different version of the library
- For frontend applications, follow the recommendations from the Ranger documentation

## Troubleshooting

### "Reached end of buffer unexpectedly"

This error typically indicates an issue with the deserialization process. Possible solutions:

1. Make sure you're properly converting the base64 message to binary data
2. Check that you're using a compatible version of `@solana/web3.js`
3. Try using the wallet adapter's built-in transaction handling

### Transaction Simulation Failures

If your transaction fails during simulation:

1. Check the transaction logs for specific error messages
2. Verify that your wallet has sufficient funds for both the transaction and any associated rent
3. Ensure you have the correct permissions for the transaction

## Complete Example Application Flow

For a complete application, follow these steps:

1. Request transaction instructions from the API
2. Deserialize the transaction from the message
3. Sign the transaction with your wallet
4. Send the transaction to the Solana network
5. Monitor the transaction status
6. Handle success/error states appropriately

## Resources

- [Ranger SOR API Documentation](./docs/sor-api.md)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter) 