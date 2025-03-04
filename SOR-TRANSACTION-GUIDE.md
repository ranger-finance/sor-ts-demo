# SOR API Transaction Integration Guide

After extensive testing and analysis, we've determined that the SOR API transaction format is designed to be used with a frontend wallet adapter rather than directly in a Node.js environment. This guide explains our findings and provides recommendations for proper integration.

## Key Findings

1. **Special Transaction Format**: The SOR API returns a transaction in a specific format (base64-encoded message) that:
   - Starts with byte `0x80`, indicating it's a Versioned Transaction
   - Has a specific structure expected by the Solana blockchain
   - Requires proper signature formatting and handling

2. **Compatibility Issues with @solana/web3.js in Node.js**:
   - We've tried multiple approaches with version 1.98.0 of @solana/web3.js:
     - Direct deserialization with `VersionedTransaction.deserialize()`
     - SDK's built-in `executeTransaction()` method
     - Low-level manual transaction construction and signing
   - All approaches resulted in similar errors related to deserialization or signature verification

3. **Format Designed for Browser Use**: 
   - The transaction format is designed to be used with Solana wallet adapters in a browser environment
   - Frontend wallet adapters handle the complexities of transaction serialization/deserialization
   - The format may be optimized for specific versions of @solana/web3.js used in frontends

## Recommended Integration Approach

### For Frontend Applications (Recommended)

```typescript
// Using a wallet adapter (like @solana/wallet-adapter-react)
import { useWallet } from '@solana/wallet-adapter-react';

function YourComponent() {
  const { publicKey, sendTransaction } = useWallet();
  
  const handleTransaction = async () => {
    // Get transaction from SOR API
    const response = await sorApi.increasePosition({
      fee_payer: publicKey.toString(),
      // other parameters...
    });
    
    // Send directly with wallet adapter
    const signature = await sendTransaction(response.message);
    console.log(`Transaction sent: ${signature}`);
  };
}
```

### For Backend/Node.js Applications

If you must use the SOR API in a Node.js environment:

1. **Consider Using a Different API Endpoint**:
   - Check if the SOR API provides alternative endpoints or parameters for obtaining raw transaction instructions
   - These could be used to build a transaction from scratch in Node.js

2. **Update @solana/web3.js Version**:
   - Try different versions of @solana/web3.js that might be compatible
   - The version used in frontend applications might handle the format better

3. **Proxy to Frontend**:
   - Use your backend to obtain the transaction information
   - Pass it to a frontend application for signing and sending

## Issues Encountered

1. **Deserialization Error**: `Reached end of buffer unexpectedly`
   - Occurs when trying to deserialize the transaction using `VersionedTransaction.deserialize()`
   - Indicates incompatibility between the message format and the deserialization logic

2. **Simulation Error**: `failed to deserialize solana_sdk::transaction::versioned::VersionedTransaction`
   - Occurs when trying to send a manually constructed transaction
   - Indicates that our low-level transaction construction doesn't match expected formats

3. **API Limitations**: The API doesn't provide raw transaction instructions
   - Only provides a pre-built transaction in a specific format
   - This format is optimized for wallet adapters, not direct Node.js manipulation

## Conclusion

The SOR API transaction format is designed for use with Solana wallet adapters in a browser environment. For the best results and simplest integration, we recommend using the API in a frontend application with a wallet adapter.

If you must use it in a backend environment, consider reaching out to Ranger support for guidance on backend-specific integration methods or alternative API endpoints that provide raw transaction instructions.

See [INTEGRATION-GUIDE.md](./INTEGRATION-GUIDE.md) and [examples/frontend-integration.ts](./examples/frontend-integration.ts) for more details on frontend integration. 