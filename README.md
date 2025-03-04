# Ranger SOR API Examples

<div align="center">
  </br>
  <p>
    <img height="300" src="https://pbs.twimg.com/profile_banners/1764920763360899072/1711621031/1500x500" />
  </p>
  <p>
    <strong>bifrost</strong>
  </p>
</div>

## Overview

This repository contains examples for using the Ranger Smart Order Router (SOR) API. These examples demonstrate how to interact with the API directly or through the TypeScript SDK.

## API Documentation

For detailed API documentation, see [SOR API Documentation](./docs/sor-api.md).

## Examples

You can run these examples directly without installing the SDK as an npm package. Simply clone this repository and run the examples using the provided scripts.

### Running Examples Locally

To run the examples locally:

1. Clone this repository:
   ```bash
   git clone https://github.com/ranger-finance/sor-sdk.git
   cd sor-sdk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your API key:
   ```
   RANGER_API_KEY=your_api_key_here
   SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   ```

4. Run an example:
   ```bash
   npm run example:positions
   ```

### Example Categories

### Position Management

- [Positions Example](./examples/positions-example.ts) - Demonstrates how to fetch positions using the API
  ```bash
  npm run example:positions
  ```


### Trading

- [Quotes Example](./examples/quotes-example.ts) - Demonstrates how to fetch quotes for different symbols
  ```bash
  npm run example:quotes
  ```

- [Node Example](./examples/node-example.ts) - Basic example of increasing a position
  ```bash
  npm run example:node
  ```

### Integration Examples

- [Integration Example](./examples/integration-example.ts) - Shows how to integrate with existing code structures
  ```bash
  npm run example:integration
  ```

- [Adapter Example](./examples/adapter-example.ts) - Demonstrates how to create an adapter for your existing code
  ```bash
  npm run example:adapter
  ```

## Quick Start

1. Clone this repository
2. Create a `.env` file with your API key (see `.env.example`)
3. Run an example:
   ```bash
   npm run example:positions
   ```

## Examining Examples Without Running

If you prefer to just examine the code without running it, you can browse the examples directly:

- **Basic API Interaction**: 
  - [Position Fetching](./examples/positions-example.ts) - Shows how to authenticate and fetch data
  - [Symbol Information](./examples/symbols-example.ts) - Demonstrates API request structure

- **Transaction Handling**:
  - [Transaction Creation](./examples/node-example.ts) - Shows how to create and sign transactions
  - [Transaction Utilities](./src/utils/transaction.ts) - Contains helper functions for transaction handling

- **Integration Patterns**:
  - [Adapter Pattern](./examples/adapter-example.ts) - Shows how to adapt existing code
  - [React Integration](./examples/integration-example.ts) - Demonstrates integration with React

Each example is well-commented and can be used as a reference for implementing your own API integration.

## Direct API Usage with curl

If you prefer to use the API directly without any SDK or npm installation, you can use curl commands to interact with the Ranger SOR API:

### Authentication

All API requests require an API key passed in the Authorization header:

```bash
-H "Authorization: Bearer YOUR_API_KEY"
```

### Position Management

```bash
# Get all positions
curl -X GET "https://api.ranger.finance/v1/positions" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Get a specific position by ID
curl -X GET "https://api.ranger.finance/v1/positions/YOUR_POSITION_ID" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Market Data

```bash
# Get available symbols
curl -X GET "https://api.ranger.finance/v1/symbols" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Get quotes for a symbol
curl -X GET "https://api.ranger.finance/v1/quotes?symbol=SOL-PERP&side=Long&size=1.0" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Trading

```bash
# Increase a position
curl -X POST "https://api.ranger.finance/v1/increase" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "fee_payer": "YOUR_WALLET_ADDRESS",
    "symbol": "SOL-PERP",
    "side": "Long",
    "size": 1.0,
    "collateral": 10.0,
    "size_denomination": "SOL",
    "collateral_denomination": "USDC",
    "adjustment_type": "Increase"
  }'

# Close a position
curl -X POST "https://api.ranger.finance/v1/close" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "fee_payer": "YOUR_WALLET_ADDRESS",
    "symbol": "SOL-PERP",
    "side": "Long",
    "adjustment_type": "CloseFlash"
  }'
```

For more detailed API documentation, refer to the [SOR API Documentation](./docs/sor-api.md).

### Transaction Signing Process

When using the API directly, you'll need to handle the transaction signing process manually:

1. **Request Transaction Instructions**: The API endpoints like `/increase` and `/close` return a transaction message in base64 format.

2. **Decode the Transaction**: Convert the base64 message to a byte array:
   ```javascript
   function base64ToUint8Array(base64) {
     const binaryString = atob(base64);
     const bytes = new Uint8Array(binaryString.length);
     for (let i = 0; i < binaryString.length; i++) {
       bytes[i] = binaryString.charCodeAt(i);
     }
     return bytes;
   }
   
   const messageBytes = base64ToUint8Array(response.message);
   ```

3. **Create a Transaction**: Use the Solana web3.js library to create a transaction:
   ```javascript
   const transaction = VersionedTransaction.deserialize(messageBytes);
   ```

4. **Update Blockhash**: Get a recent blockhash and update the transaction:
   ```javascript
   const { blockhash } = await connection.getLatestBlockhash('confirmed');
   transaction.message.recentBlockhash = blockhash;
   ```

5. **Sign and Send**: Sign the transaction with your wallet and send it to the network:
   ```javascript
   const signedTx = await wallet.signTransaction(transaction);
   const signature = await connection.sendRawTransaction(signedTx.serialize());
   ```

For a complete implementation, see the [Transaction Utilities](./src/utils/transaction.ts) in the SDK source code.

## Links

- [Ranger](https://app.ranger.finance)
- [Telegram](https://t.me/rangerfinancehq)
