const WebSocket = require('ws');
require('dotenv').config();

class TransactionMonitor {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || process.env.WS_SERVER_URL || 'wss://staging-sor-api-437363704888.asia-northeast1.run.app/v1/observe_tx';
        this.timeout = options.timeout || 30000; // Default 30s timeout
        this.reconnectInterval = options.reconnectInterval || 3000;
        this.maxReconnects = options.maxReconnects || 5;
        this.apiKey = options.apiKey;
        this.keepAliveInterval = options.keepAliveInterval || 20000; // 20 seconds for ping
        
        this.ws = null;
        this.reconnectCount = 0;
        this.monitoredSignatures = new Set();
        this.currentSignature = null;
        this.pingIntervalId = null;
        this.initialized = false;
        this.callbacks = {
            onOpen: options.onOpen || (() => console.log('WebSocket connected')),
            onClose: options.onClose || (() => console.log('WebSocket disconnected')),
            onError: options.onError || ((error) => console.error('WebSocket error:', error)),
            onMessage: options.onMessage || ((message) => console.log('Message received:', message)),
            onUpdate: options.onUpdate || ((update) => console.log('Transaction update:', update)),
            onTimeout: options.onTimeout || ((signature) => console.log('Transaction monitoring timed out:', signature)),
            onMonitoring: options.onMonitoring || ((signature) => console.log('Monitoring transaction:', signature))
        };
    }

    connect(signature) {
        if (!signature && !this.currentSignature) {
            console.error('No transaction signature provided');
            return;
        }

        if (!this.apiKey) {
            console.error('API key is required for authentication');
            return;
        }

        if (signature) {
            this.currentSignature = signature;
        }

        // Include signature as query parameter
        const url = `${this.baseUrl}?tx_signature=${this.currentSignature}`;
        console.log(`Connecting to ${url}...`);
        
        // Set up WebSocket options with proper headers
        const wsOptions = {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Sec-WebSocket-Version': '13',
                'Sec-WebSocket-Protocol': 'obs-tx-v1',
                'Upgrade': 'websocket',
                'Connection': 'Upgrade'
            }
        };
        
        console.log("WebSocket options:", JSON.stringify(wsOptions, null, 2));
        console.log(`API Key length: ${this.apiKey ? this.apiKey.length : 0}`);
        
        // For debugging: Check which version of ws is being used
        console.log(`WebSocket module version: ${require('ws/package.json').version}`);
        
        this.ws = new WebSocket(url, wsOptions);

        this.ws.on('open', () => {
            console.log('WebSocket connection established');
            this.reconnectCount = 0;
            this.initialized = false;
            this.callbacks.onOpen();
            
            // Send connection_init message
            this._initializeConnection();
            
            // Start ping interval to keep connection alive
            this._startPingInterval();
        });

        this.ws.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                console.log('Received message:', message);
                this.callbacks.onMessage(message);
                
                switch (message.type) {
                    case 'connection_ack':
                        console.log('Connection acknowledged by server');
                        this.initialized = true;
                        if (this.currentSignature) {
                            this.subscribe(this.currentSignature);
                        }
                        break;
                    case 'next':
                        // This is an update message
                        if (message.payload && message.payload.signature) {
                            this.callbacks.onUpdate(message.payload);
                            
                            if (message.payload.status === 'monitoring') {
                                this.monitoredSignatures.add(message.payload.signature);
                                this.callbacks.onMonitoring(message.payload.signature);
                            }
                        }
                        break;
                    case 'error':
                        console.error('Server error:', message.payload);
                        break;
                    case 'connection_error':
                        console.error('Connection error:', message.payload);
                        break;
                    case 'complete':
                        console.log(`Subscription ${message.id} completed`);
                        this.monitoredSignatures.delete(message.id);
                        break;
                    case 'pong':
                        console.log('Server responded to ping');
                        break;
                    case 'connected':
                        // This is from our server welcome message
                        console.log('Server says:', message.message);
                        break;
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });

        this.ws.on('close', () => {
            console.log('WebSocket connection closed');
            this._cleanupConnection();
            this.callbacks.onClose();
            this.reconnect();
        });

        this.ws.on('error', (error) => {
            console.error('WebSocket connection error:', error.message);
            if (error.code) {
                console.error(`Error code: ${error.code}`);
            }
            if (error.errno) {
                console.error(`Error errno: ${error.errno}`);
            }
            if (error.address) {
                console.error(`Error address: ${error.address}`);
            }
            if (error.port) {
                console.error(`Error port: ${error.port}`);
            }
            // Continue with the existing error handler
            this.callbacks.onError(error);
        });
    }

    _initializeConnection() {
        const initMessage = {
            type: 'connection_init',
            payload: {}
        };
        this._sendMessage(initMessage);
    }

    _startPingInterval() {
        this._clearPingInterval();
        this.pingIntervalId = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                const pingMessage = {
                    type: 'ping'
                };
                this._sendMessage(pingMessage);
            }
        }, this.keepAliveInterval);
    }

    _clearPingInterval() {
        if (this.pingIntervalId) {
            clearInterval(this.pingIntervalId);
            this.pingIntervalId = null;
        }
    }

    _cleanupConnection() {
        this._clearPingInterval();
        this.initialized = false;
    }

    _sendMessage(message) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected, cannot send message');
            return false;
        }
        
        try {
            this.ws.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    }

    reconnect() {
        if (this.reconnectCount < this.maxReconnects) {
            this.reconnectCount++;
            console.log(`Reconnecting (${this.reconnectCount}/${this.maxReconnects}) in ${this.reconnectInterval}ms...`);
            setTimeout(() => this.connect(), this.reconnectInterval);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    monitor(signature, timeout = this.timeout) {
        if (this.currentSignature && signature !== this.currentSignature) {
            if (this.ws) {
                this.ws.close();
            }
            this.connect(signature);
            return;
        }

        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.log('WebSocket not connected, connecting now...');
            this.connect(signature);
            return;
        }

        // If connection is established but not initialized, wait for init
        if (!this.initialized) {
            console.log('Connection not yet initialized, waiting...');
            setTimeout(() => this.monitor(signature, timeout), 500);
            return;
        }

        console.log(`Monitoring transaction: ${signature}`);
        this.subscribe(signature);
    }

    subscribe(signature) {
        if (!this.initialized) {
            console.log('Connection not initialized, cannot subscribe');
            return;
        }

        console.log(`Subscribing to transaction: ${signature}`);
        
        const subscribeMessage = {
            type: 'subscribe',
            id: signature,
            payload: {
                signature: signature
            }
        };
        
        this._sendMessage(subscribeMessage);
    }

    unsubscribe(signature) {
        if (!this.initialized) {
            console.log('Connection not initialized, cannot unsubscribe');
            return;
        }

        console.log(`Unsubscribing from transaction: ${signature}`);
        
        const completeMessage = {
            type: 'complete',
            id: signature
        };
        
        this._sendMessage(completeMessage);
        this.monitoredSignatures.delete(signature);
    }

    stopMonitoring(signature = this.currentSignature) {
        this.unsubscribe(signature);
    }

    close() {
        if (this.ws) {
            this._cleanupConnection();
            this.ws.close();
            this.ws = null;
        }
    }
}

// Run tests against the real server
async function runTests() {
    console.log('Starting real server tests');
    
    // Get API key from environment variable
    const apiKey = process.env.SOR_API_KEY;
    if (!apiKey) {
        console.error('Please set SOR_API_KEY in your .env file');
        process.exit(1);
    }
    
    // Get test signature from environment variable or use the provided one
    const testSignature = process.env.TEST_SIGNATURE || '4zbKahoyXddoxPFqhU71iYTPJfrJQqKoCVFP7iUWfeNSPp2mBpgZQKoEDEh4GKFjb5Zij11WR2FZe7STX57nfSgv';
    
    // Create a monitor instance
    const monitor = new TransactionMonitor({
        apiKey,
        keepAliveInterval: 5000, // 5 seconds for testing
        onUpdate: (update) => {
            console.log('🔔 Transaction updated:', update);
        },
        onMonitoring: (signature) => {
            console.log('👀 Started monitoring transaction:', signature);
        }
    });
    
    // Test 1: Monitor a transaction
    console.log('\nTEST 1: Monitor a transaction');
    monitor.connect(testSignature);
    
    // Give it a second to connect and initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start monitoring
    monitor.monitor(testSignature);
    
    // Wait for monitoring to start and observe for a short period
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Clean up
    console.log('\nTest completed, closing connection');
    monitor.close();
}

// If this is the main module, run the tests
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = TransactionMonitor; 