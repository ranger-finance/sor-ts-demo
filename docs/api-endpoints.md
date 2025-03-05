# Ranger Smart Order Router (SOR) API

Welcome to the Ranger SOR API documentation. The Smart Order Router provides endpoints for routing trades across multiple venues to find the best execution price and liquidity.

created a type script sdk here for the APIs

https://github.com/ranger-finance/sor-sdk

## Table of Contents

## API Reference

### Base URL

```
sor-api: https://staging-sor-api-437363704888.asia-northeast1.run.app
data api (positions): https://data-api-staging-437363704888.asia-northeast1.run.app (will migrate to sor-api soon)
```

### Authentication

The API requires authentication using an API key. You must include your API key in the `x-api-key` header with every request.

### API Key Header

```
x-api-key: your-api-key-here
test-key: sk_test_limited456

```

### Authentication Errors

| Status Code | Error | Description |
| --- | --- | --- |
| 401 | MissingApiKey | No API key provided in the x-api-key header |
| 403 | InvalidApiKey | The provided API key is invalid or has been deactivated |
| 429 | RateLimitExceeded | You have exceeded your API key's rate limit |

### Rate Limits

Each API key has its own rate limit configured. The default rate limit is 1000 requests per key. Rate limits are enforced on a per-key basis, not per IP.

### Example Error Response

```json
{
  "message": "Missing API key - Please provide an API key in the x-api-key header",
  "error_code": 401
}

```

### SOR API Endpoints

The SOR API provides endpoints for routing trades and managing positions across different venues.

### Quote Endpoint

`POST /v1/order_metadata`

Get a quote for a potential trade, including price, available liquidity, and routing information.

### Request Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| fee_payer | string | Yes | The public key of the fee payer account |
| symbol | string | Yes | Trading symbol (e.g., "SOL", "BTC", "ETH") |
| side | string | Yes | Trading side ("Long" or "Short") |
| size | number | Yes | The size of the position in base asset |
| collateral | number | Yes | The amount of collateral to use (in USDC) |
| size_denomination | string | Yes | Denomination of the size (must match symbol) |
| collateral_denomination | string | Yes | Denomination of the collateral (must be "USDC") |
| adjustment_type | string | Yes | Type of position adjustment (e.g., "Increase", "Quote") |

### Example Request

```json
{
  "fee_payer": "Adjmfo9hneSPSzkXj5JYMp9KqiN4zdy6Vsm31a8WVEdg",
  "symbol": "SOL",
  "side": "Long",
  "size": 1.0,
  "collateral": 10.0,
  "size_denomination": "SOL",
  "collateral_denomination": "USDC",
  "adjustment_type": "Increase"
}

```

### Common `adjustment_type` Values

| Value | Description |
| --- | --- |
| "Quote" | Get a quote without executing a trade |
| "Increase" | Open a new position or add to an existing one |
| "DecreaseFlash", "DecreaseJupiter", "DecreaseDrift", "DecreaseAdrena" | Reduce a position using a specific venue |
| "CloseFlash", "CloseJupiter", "CloseDrift", "CloseAdrena", "CloseAll" | Close positions on specific venues or all venues |

### Response Fields

| Field | Type | Description |
| --- | --- | --- |
| message | string | Transaction message or status |
| meta | object | Metadata about the quote |
| meta.venue_allocations | array | List of venues and their allocations |
| meta.total_size | number | Total size of the position |
| meta.total_collateral | number | Total collateral required |
| meta.price_impact | number | Estimated price impact in percentage |

### Example Response

```json
{
  "venues": [
    {
      "venue_name": "Flash",
      "collateral": 10.0,
      "size": 1.0,
      "quote": {
        "base": 159.86,
        "fee": 0.16,
        "total": 160.03,
        "fee_breakdown": {
          "base_fee": 0.16,
          "spread_fee": 0.0,
          "volatility_fee": 0.0,
          "margin_fee": 0.0,
          "close_fee": 0.0005,
          "other_fees": 0.0
        }
      },
      "order_available_liquidity": 15831.83,
      "venue_available_liquidity": 15831.83
    }
  ],
  "total_collateral": 10.0,
  "total_size": 1.0
}

```

### Increase Position Endpoint

`POST /v1/increase_position`

Open a new position or increase the size of an existing position.

### Request Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| fee_payer | string | Yes | The public key of the fee payer account |
| symbol | string | Yes | Trading symbol (e.g., "SOL", "BTC", "ETH") |
| side | string | Yes | Trading side ("Long" or "Short") |
| size | number | Yes | The size of the position in base asset |
| collateral | number | Yes | The amount of collateral to use (in USDC) |
| size_denomination | string | Yes | Denomination of the size (must match symbol) |
| collateral_denomination | string | Yes | Denomination of the collateral (must be "USDC") |
| adjustment_type | string | Yes | Must be "Increase" for this endpoint |

### Example Response

```json

{
  "message": "5KKsT9nUG9tKwUhtw3WP...",
  "meta": {
    "venues": [
      {
        "venue_name": "Flash",
        "collateral": 500.0,
        "size": 0.5,
        "quote": {
          "base": 20.5,
          "fee": 0.1,
          "total": 20.6,
          "fee_breakdown": {
            "base_fee": 10.0,
            "spread_fee": 5.0
          }
        },
        "order_available_liquidity": 10.0,
        "venue_available_liquidity": 100.0
      },
      {
        "venue_name": "Jupiter",
        "collateral": 500.0,
        "size": 0.5,
        "quote": {
          "base": 20.6,
          "fee": 0.05,
          "total": 20.65,
          "fee_breakdown": {
            "base_fee": 5.0,
            "spread_fee": 2.5
          }
        },
        "order_available_liquidity": 8.0,
        "venue_available_liquidity": 80.0
      }
    ],
    "total_collateral": 1000.0,
    "total_size": 1.0
  }
}
```

### Decrease Position Endpoint

`POST /v1/decrease_position`

Decrease the size of an existing position.

### Request Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| fee_payer | string | Yes | The public key of the fee payer account |
| symbol | string | Yes | Trading symbol (e.g., "SOL", "BTC", "ETH") |
| side | string | Yes | Trading side ("Long" or "Short") |
| size | number | Yes | The size to decrease by in base asset |
| collateral | number | Yes | The amount of collateral to withdraw (in USDC) |
| size_denomination | string | Yes | Denomination of the size (must match symbol) |
| collateral_denomination | string | Yes | Denomination of the collateral (must be "USDC") |
| adjustment_type | string | Yes | Must be venue-specific: "DecreaseFlash", "DecreaseJupiter", "DecreaseDrift", "DecreaseAdrena" |

### Close Position Endpoint

`POST /v1/close_position`

Close an existing position completely.

### Request Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| fee_payer | string | Yes | The public key of the fee payer account |
| symbol | string | Yes | Trading symbol (e.g., "SOL", "BTC", "ETH") |
| side | string | Yes | Trading side ("Long" or "Short") |
| adjustment_type | string | Yes | Must be venue-specific: "CloseFlash", "CloseJupiter", "CloseDrift", "CloseAdrena", or "CloseAll" |

### Example cURL Request

```bash
curl -X POST ${BASE_URL}/v1/close_position \\
     -H "Content-Type: application/json" \\
     -H "x-api-key: YOUR_API_KEY" \\
     -d '{
        "fee_payer": "RANTf8vmj5A31zpNzNiGEeEGZigr9bznSQFCo5KrL17",
        "symbol": "BTC",
        "size": 0.000908,
        "collateral": 9.06,
        "size_denomination": "BTC",
        "collateral_denomination": "USDC",
        "side": "Long",
        "adjustment_type": "CloseFlash"
    }'

```

### Deposit Collateral Endpoint (WIP)

`POST /v1/deposit_collateral`

Deposit additional collateral to an existing position.

### Request Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| fee_payer | string | Yes | The public key of the fee payer account |
| symbol | string | Yes | Trading symbol (e.g., "SOL", "BTC", "ETH") |
| side | string | Yes | Trading side ("Long" or "Short") |
| collateral | number | Yes | The amount of collateral to deposit |
| collateral_denomination | string | Yes | Denomination of the collateral (must be "USDC") |
| adjustment_type | string | Yes | Must be "DepositCollateralFlash", "DepositCollateralJupiter", or "DepositCollateralDrift" |

### Withdraw Collateral Endpoint (WIP)

`POST /v1/withdraw_collateral`

Withdraw collateral from an existing position.

### Request Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| fee_payer | string | Yes | The public key of the fee payer account |
| symbol | string | Yes | Trading symbol (e.g., "SOL", "BTC", "ETH") |
| side | string | Yes | Trading side ("Long" or "Short") |
| collateral | number | Yes | The amount of collateral to withdraw |
| collateral_denomination | string | Yes | Denomination of the collateral (must be "USDC") |
| adjustment_type | string | Yes | Must be "WithdrawCollateralFlash", "WithdrawCollateralJupiter", or "WithdrawCollateralDrift" |

### Data API Endpoints

The Data API provides read-only access to position and account data.

### Get Positions Endpoint

`GET /v1/positions`

Retrieve user positions across all venues or filtered by specific platforms/symbols.

### Query Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| public_key | string | Yes | User's Solana wallet address |
| platforms | string[] | No | Optional list of platforms to filter by (e.g., ["DRIFT", "FLASH"]) |
| symbols | string[] | No | Optional list of symbols to filter by (e.g., ["SOL-PERP", "BTC-PERP"]) |
| from | datetime | No | Optional earliest position date to fetch (defaults to 2 days ago) |

### Example Request

```
GET /v1/positions?public_key=Adjmfo9hneSPSzkXj5JYMp9KqiN4zdy6Vsm31a8WVEdg&platforms=DRIFT,FLASH&symbols=SOL-PERP

```

### Example cURL Request

```bash
curl -v -H "x-api-key: YOUR_API_KEY" \\
  "${BASE_URL}/v1/positions?public_key=RANTf8vmj5A31zpNzNiGEeEGZigr9bznSQFCo5KrL17&platforms[]=drift&platforms[]=mango&symbols[]=SOL-PERP&symbols[]=BTC-PERP&from=2024-02-18T00:00:00Z"

```

### Response Fields

| Field | Type | Description |
| --- | --- | --- |
| positions | array | List of position objects |

### Position Object

| Field | Type | Description |
| --- | --- | --- |
| id | string | Unique position identifier |
| symbol | string | Trading symbol (e.g., "SOL-PERP") |
| side | string | Trading side ("Long" or "Short") |
| quantity | number | Position size in base asset |
| entry_price | number | Entry price of the position |
| liquidation_price | number | Liquidation price of the position |
| position_leverage | number | Leverage used for the position |
| real_collateral | number | Actual collateral allocated to the position |
| unrealized_pnl | number | Unrealized profit/loss |
| borrow_fee | number | Accumulated borrow fees |
| funding_fee | number | Accumulated funding fees |
| open_fee | number | Fee paid to open the position |
| close_fee | number | Estimated fee to close the position |
| created_at | datetime | When the position was created |
| opened_at | datetime | When the position was opened |
| platform | string | The platform where the position was opened |

### Example Response

```json
{
  "positions": [
    {
      "id": "abc-123",
      "symbol": "SOL-PERP",
      "side": "Long",
      "quantity": 10.0,
      "entry_price": 24.5,
      "liquidation_price": 18.9,
      "position_leverage": 4.0,
      "real_collateral": 60.0,
      "unrealized_pnl": 15.0,
      "borrow_fee": 0.0,
      "funding_fee": 0.0,
      "open_fee": 0.0,
      "close_fee": 0.0,
      "created_at": "2024-02-20T00:00:00Z",
      "opened_at": "2024-02-20T00:00:00Z",
      "platform": "DRIFT"
    }
  ]
}

```

## Getting Started with the SOR API in TypeScript

- Note that if you need code snippets for other languages, please let us know and we can add them.

### API Key Setup

Before using the Ranger SOR API, you need to obtain an API key. Include this key in the `x-api-key` header with every request.

```tsx
// API key setup
const BASE_URL = '<https://api.ranger.finance>';
const API_KEY = 'your-api-key-here';
const headers = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY
};

```

## Code Examples by Endpoint

### 1. Get a Quote

```tsx
// Using fetch API
const getQuote = async () => {
  const response = await fetch(`${BASE_URL}/v1/order_metadata`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      fee_payer: "Adjmfo9hneSPSzkXj5JYMp9KqiN4zdy6Vsm31a8WVEdg", // Your Solana wallet public key
      symbol: "SOL",
      side: "Long",
      size: 1.0,
      collateral: 10.0,
      size_denomination: "SOL",
      collateral_denomination: "USDC",
      adjustment_type: "Increase"
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Quote request failed: ${error.message}`);
  }

  return response.json();
};

// Example usage
getQuote()
  .then(quote => console.log('Quote received:', quote))
  .catch(error => console.error('Error:', error));

```

```jsx
// Using axios
const axios = require('axios');
const BASE_URL = '<https://api.ranger.finance>';

axios.post(`${BASE_URL}/v1/order_metadata`, {
  fee_payer: "Adjmfo9hneSPSzkXj5JYMp9KqiN4zdy6Vsm31a8WVEdg", // Your Solana wallet public key
  symbol: "SOL",
  side: "Long",
  size: 1.0,
  collateral: 10.0,
  size_denomination: "SOL",
  collateral_denomination: "USDC",
  adjustment_type: "Increase"
}, {
  headers
})
.then(response => console.log('Quote received:', response.data))
.catch(error => console.error('Error:', error.response?.data || error.message));

```

### 2. Increase Position

```tsx
// Using fetch API
const increasePosition = async () => {
  const response = await fetch(`${BASE_URL}/v1/increase_position`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      fee_payer: "Adjmfo9hneSPSzkXj5JYMp9KqiN4zdy6Vsm31a8WVEdg", // Your Solana wallet public key
      symbol: "SOL",
      side: "Long",
      size: 1.0,
      collateral: 10.0,
      size_denomination: "SOL",
      collateral_denomination: "USDC",
      adjustment_type: "Increase"
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Increase position request failed: ${error.message}`);
  }

  return response.json();
};

```

### 3. Close Position

```tsx
// Using fetch API
const closePosition = async () => {
  const response = await fetch(`${BASE_URL}/v1/close_position`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      fee_payer: "Adjmfo9hneSPSzkXj5JYMp9KqiN4zdy6Vsm31a8WVEdg", // Your Solana wallet public key
      symbol: "SOL",
      side: "Long",
      adjustment_type: "CloseFlash"
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Close position request failed: ${error.message}`);
  }

  return response.json();
};

```

### 4. Get Positions

```tsx
// Using fetch API
const getPositions = async () => {
  // Build query parameters
  const params = new URLSearchParams({
    public_key: "Adjmfo9hneSPSzkXj5JYMp9KqiN4zdy6Vsm31a8WVEdg", // Your Solana wallet public key
    platforms: "DRIFT,FLASH",
    symbols: "SOL-PERP"
  });

  const response = await fetch(`${BASE_URL}/v1/positions?${params}`, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Get positions request failed: ${error.message}`);
  }

  return response.json();
};

```

### Common Parameters Explained

| Parameter | Description |
| --- | --- |
| fee_payer | Your Solana wallet public key that will pay for transaction fees |
| public_key | Your Solana wallet public key used to identify your account and positions |
| symbol | Trading symbol (e.g., "SOL", "BTC", "ETH") |
| side | Trading side ("Long" or "Short") |
| adjustment_type | Type of operation to perform (e.g., "Quote", "Increase", "CloseFlash") |
| size | The size of the position in base asset |
| collateral | The amount of collateral to use (in USDC) |

### Using with Node.js

```jsx
// Install required packages:
// npm install node-fetch@2 dotenv

require('dotenv').config(); // Load API key from .env file
const fetch = require('node-fetch');

const API_KEY = process.env.RANGER_API_KEY;
const BASE_URL = '<https://api.ranger.finance>';

// Example function to get a quote
async function getQuote(symbol, side, size, collateral) {
  const response = await fetch(`${BASE_URL}/v1/order_metadata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: JSON.stringify({
      fee_payer: process.env.SOLANA_PUBLIC_KEY,
      symbol,
      side,
      size,
      collateral,
      size_denomination: symbol,
      collateral_denomination: 'USDC',
      adjustment_type: 'Increase'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Quote request failed: ${error.message}`);
  }

  return response.json();
}

// Example usage
getQuote('SOL', 'Long', 1.0, 10.0)
  .then(quote => console.log(quote))
  .catch(error => console.error(error));

```

### Using with cURL

```bash
# Define base URL (for reference - replace in actual commands)
BASE_URL="<https://api.ranger.finance>"

# Get a quote
curl -X POST ${BASE_URL}/v1/order_metadata \\
     -H "Content-Type: application/json" \\
     -H "x-api-key: YOUR_API_KEY" \\
     -d '{
        "fee_payer": "Adjmfo9hneSPSzkXj5JYMp9KqiN4zdy6Vsm31a8WVEdg",
        "symbol": "SOL",
        "side": "Long",
        "size": 1.0,
        "collateral": 10.0,
        "size_denomination": "SOL",
        "collateral_denomination": "USDC",
        "adjustment_type": "Increase"
     }'

# Get positions
curl -H "x-api-key: YOUR_API_KEY" \\
     "${BASE_URL}/v1/positions?public_key=Adjmfo9hneSPSzkXj5JYMp9KqiN4zdy6Vsm31a8WVEdg&platforms=DRIFT,FLASH&symbols=SOL-PERP"

```

## Transaction Signing and Execution

The SOR API provides transaction instructions but doesn't handle signing or submission. This section explains how to complete the full transaction flow using TypeScript and the Solana web3.js library.

### Transaction Flow Overview

1. **Request Data**: Get position data or quotes as needed
2. **Get Transaction Instructions**: Call the SOR API endpoint based on your action
3. **Decode Instructions**: Convert the base64-encoded message from the API into a Solana transaction
4. **Add Recent Blockhash**: Update the transaction with a recent blockhash from the Solana network
5. **Sign & Submit**: Use a wallet adapter to sign and send the transaction to the Solana network
6. **Monitor**: Track the transaction status for completion or errors

### TypeScript Implementation Example

Here's a complete example of how to build, sign, and execute a transaction with the SOR API using TypeScript:

```tsx
import { Connection, PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import base64 from 'base64-js';

// Full transaction flow
async function executeTradeWithSorApi(
  walletPublicKey: string,
  symbol: string,
  side: 'Long' | 'Short',
  size: number,
  collateral: number,
  action: 'increase_position' | 'decrease_position' | 'close_position'
) {
  try {
    // Step 1: Call SOR API to get transaction instructions
    const sorApiUrl = '<https://api.ranger.finance/v1>';
    const endpoint = `${sorApiUrl}/${action}`;

    const requestBody = {
      fee_payer: walletPublicKey,
      symbol: symbol,
      side: side,
      size: size,
      collateral: collateral,
      size_denomination: symbol,
      collateral_denomination: 'USDC',
      adjustment_type: action === 'increase_position' ? 'Increase' :
                       action === 'decrease_position' ? 'DecreaseFlash' :
                       'CloseFlash'
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'YOUR_API_KEY_HERE'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`SOR API request failed: ${errorData.message}`);
    }

    const responseData = await response.json();

    // Step 2: Decode the base64 transaction message from the API
    const messageBase64 = responseData.message;
    const messageBytes = base64.toByteArray(messageBase64);

    // Step 3: Deserialize into a versioned transaction
    const deserializedMessage = TransactionMessage.deserialize(messageBytes);
    const transaction = new VersionedTransaction(deserializedMessage);

    // Step 4: Connect to Solana and get the latest blockhash
    const connection = new Connection('<https://api.mainnet-beta.solana.com>', 'confirmed');
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    // Step 5: Update the transaction with the recent blockhash
    transaction.message.recentBlockhash = blockhash;

    // Step 6: Sign and send the transaction (using wallet adapter)
    // This would typically be done in a React component using the useWallet hook
    const wallet = useWallet(); // This would be from a React hook
    const signedTransaction = await wallet.signTransaction(transaction);

    const signature = await connection.sendRawTransaction(signedTransaction.serialize());

    // Step 7: Confirm transaction
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }

    console.log('Transaction confirmed:', signature);
    return {
      signature,
      success: true,
      meta: responseData.meta
    };

  } catch (error) {
    console.error('Error executing trade:', error);
    throw error;
  }
}

```

### React Component Example

```tsx
import { FC, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

const TradingForm: FC = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction } = useWallet();

  const [symbol, setSymbol] = useState('SOL');
  const [side, setSide] = useState<'Long' | 'Short'>('Long');
  const [size, setSize] = useState(1);
  const [collateral, setCollateral] = useState(1000);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Get quote first (optional)
      const quote = await getQuote(publicKey.toString(), symbol, side, size, collateral);

      // Present quote details to user and confirm
      const userConfirmed = window.confirm(
        `Opening ${side} position for ${size} ${symbol} with ${collateral} USDC collateral.\\n` +
        `Estimated price: ${quote.meta.price}\\n` +
        `Price impact: ${quote.meta.price_impact}%\\n\\n` +
        `Proceed with transaction?`
      );

      if (!userConfirmed) {
        setIsLoading(false);
        return;
      }

      // Step 2: Call SOR API to get transaction
      const response = await fetch(`https://api.ranger.finance/v1/increase_position`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'YOUR_API_KEY_HERE'
        },
        body: JSON.stringify({
          fee_payer: publicKey.toString(),
          symbol,
          side,
          size,
          collateral,
          size_denomination: symbol,
          collateral_denomination: 'USDC',
          adjustment_type: 'Increase'
        })
      });

      const data = await response.json();

      // Step 3: Process the transaction
      const messageBase64 = data.message;
      const messageBytes = base64.toByteArray(messageBase64);
      const deserializedMessage = TransactionMessage.deserialize(messageBytes);
      const transaction = new VersionedTransaction(deserializedMessage);

      // Step 4: Add a recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.message.recentBlockhash = blockhash;

      // Step 5: Sign and send transaction
      const signature = await sendTransaction(transaction, connection);

      console.log('Transaction sent:', signature);
      alert(`Transaction submitted! Signature: ${signature}`);

    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields for trading parameters */}
      <button type="submit" disabled={isLoading || !publicKey}>
        {isLoading ? 'Processing...' : 'Execute Trade'}
      </button>
    </form>
  );
};

// Helper function to get quote
async function getQuote(
  publicKey: string,
  symbol: string,
  side: 'Long' | 'Short',
  size: number,
  collateral: number
) {
  const response = await fetch(`https://api.ranger.finance/v1/order_metadata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY_HERE'
    },
    body: JSON.stringify({
      fee_payer: publicKey,
      symbol,
      side,
      size,
      collateral,
      size_denomination: symbol,
      collateral_denomination: 'USDC',
      adjustment_type: 'Increase'
    })
  });

  return await response.json();
}

```

### Using with Node.js (No UI)

If you're using Node.js without a browser wallet, you'll need to use a keypair:

```tsx
import { Connection, Keypair, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import base64 from 'base64-js';
import bs58 from 'bs58';

// Load your private key (NEVER hardcode in production)
const privateKeyString = process.env.PRIVATE_KEY;
const privateKey = bs58.decode(privateKeyString);
const keypair = Keypair.fromSecretKey(privateKey);

async function executeTrade() {
  // Similar flow as above, but with manual signing

  // ... Get transaction from SOR API ...

  // Sign transaction with keypair
  transaction.sign([keypair]);

  // Send the signed transaction
  const connection = new Connection('<https://api.mainnet-beta.solana.com>');
  const signature = await connection.sendRawTransaction(transaction.serialize());

  console.log('Transaction sent:', signature);
  return signature;
}

```

### cURL Example for Testing

Here's a complete cURL example to test the workflow:

```bash
# 1. Get positions (if needed)
curl -X GET "<https://api.ranger.finance/v1/positions?public_key=YOUR_WALLET_ADDRESS>" \\
  -H "x-api-key: YOUR_API_KEY"

# 2. Get a quote
curl -X POST "<https://api.ranger.finance/v1/order_metadata>" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "fee_payer": "YOUR_WALLET_ADDRESS",
    "symbol": "SOL",
    "side": "Long",
    "size": 1.0,
    "collateral": 10.0,
    "size_denomination": "SOL",
    "collateral_denomination": "USDC",
    "adjustment_type": "Increase"
  }'

# 3. Get transaction instructions for increase
curl -X POST "<https://api.ranger.finance/v1/increase_position>" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "fee_payer": "YOUR_WALLET_ADDRESS",
    "symbol": "SOL",
    "side": "Long",
    "size": 1.0,
    "collateral": 10.0,
    "size_denomination": "SOL",
    "collateral_denomination": "USDC",
    "adjustment_type": "Increase"
  }'

# 4. The response will include a base64-encoded message
# You would then decode, sign, and submit this transaction using your code

```