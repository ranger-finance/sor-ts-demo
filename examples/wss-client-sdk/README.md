# SOR WebSocket Client SDK

This SDK provides a client implementation for the SOR WebSocket API, allowing you to monitor and subscribe to transaction updates.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

## Configuration

The following environment variables can be configured in your `.env` file:

- `SOR_API_KEY` (required): Your API key for authentication
- `TEST_SIGNATURE` (optional): Transaction signature to monitor in tests
- `WS_SERVER_URL` (optional): Custom WebSocket server URL

## Usage

### Running Tests

1. Run tests with mock server:
```bash
# Start the mock server in one terminal
npm run start:mock

# Run tests against mock server in another terminal
npm test
```

2. Run tests with real server:
```bash
# Make sure you've configured your .env file first
npm run test:real
```

### Using the SDK in Your Code

```javascript
const TransactionMonitor = require('./path/to/sdk');

const monitor = new TransactionMonitor({
    apiKey: 'your_api_key',
    onUpdate: (update) => {
        console.log('Transaction updated:', update);
        
        // Access the new fee fields
        if (update.maker_fee !== undefined) {
            console.log('Maker fee:', update.maker_fee);
        }
        
        if (update.taker_fee !== undefined) {
            console.log('Taker fee:', update.taker_fee);
        }
    }
});

// Monitor a transaction
monitor.monitor('your_transaction_signature');

// Subscribe to updates
monitor.subscribe('another_transaction_signature');

// Stop monitoring
monitor.stopMonitoring('your_transaction_signature');

// Unsubscribe
monitor.unsubscribe('another_transaction_signature');

// Close connection
monitor.close();
```

## Transaction Update Fields

The `onUpdate` callback receives a payload that includes:

- `signature`: The transaction signature
- `slot`: The Solana slot number
- `timestamp`: Timestamp of the update
- `result`: Status message
- `maker_fee`: The maker fee for the transaction (optional)
- `taker_fee`: The taker fee for the transaction (optional)

## API Reference

### TransactionMonitor

#### Constructor Options

- `apiKey` (required): Your API key for authentication
- `baseUrl` (optional): Custom WebSocket server URL
- `timeout` (optional): Monitoring timeout in milliseconds (default: 30000)
- `reconnectInterval` (optional): Reconnection interval in milliseconds (default: 3000)
- `maxReconnects` (optional): Maximum reconnection attempts (default: 5)

#### Callback Options

- `onOpen`: Called when connection is established
- `onClose`: Called when connection is closed
- `onError`: Called when an error occurs
- `onMessage`: Called for all incoming messages
- `onUpdate`: Called when transaction status is updated
- `onTimeout`: Called when monitoring times out
- `onMonitoring`: Called when monitoring starts

#### Methods

- `connect(signature)`: Connect to WebSocket server
- `monitor(signature, timeout)`: Start monitoring a transaction
- `subscribe(signature)`: Subscribe to transaction updates
- `unsubscribe(signature)`: Unsubscribe from updates
- `stopMonitoring(signature)`: Stop monitoring a transaction
- `close()`: Close the WebSocket connection 