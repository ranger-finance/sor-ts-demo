const WebSocket = require('ws');
const http = require('http');
const url = require('url');

// Create HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Mock WebSocket server is running\n');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store active connections and their monitoring states
const connections = new Map();

wss.on('connection', (ws, req) => {
    // Parse query parameters
    const params = url.parse(req.url, true);
    const txSignature = params.query.tx_signature;
    const userId = params.query.user_id;

    console.log(`New connection. tx_signature: ${txSignature}, user_id: ${userId || 'none'}`);

    // Store connection info
    connections.set(ws, {
        txSignature,
        userId,
        isMonitoring: false,
        monitoredSignatures: new Set()
    });

    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received message:', data);

            switch (data.type) {
                case 'monitor':
                    handleMonitorRequest(ws, data);
                    break;
                case 'stop':
                    handleStopRequest(ws, data);
                    break;
                case 'subscribe':
                    handleSubscribeRequest(ws, data);
                    break;
                case 'unsubscribe':
                    handleUnsubscribeRequest(ws, data);
                    break;
                default:
                    sendError(ws, 'Unknown message type');
            }
        } catch (error) {
            console.error('Error parsing message:', error);
            sendError(ws, 'Invalid message format');
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
        connections.delete(ws);
    });

    // Send initial connection message
    sendMessage(ws, {
        type: 'connected',
        message: 'Connected to mock WebSocket server'
    });
});

// Handle monitoring requests
function handleMonitorRequest(ws, data) {
    const conn = connections.get(ws);
    if (!conn) return;

    const { signature, timeout = 30000 } = data;
    console.log(`Monitoring signature: ${signature}`);
    
    conn.monitoredSignatures.add(signature);
    conn.isMonitoring = true;

    // Send monitoring confirmation
    sendMessage(ws, {
        type: 'monitoring',
        signature,
        message: 'Started monitoring transaction'
    });

    // Simulate transaction updates
    simulateTransactionUpdates(ws, signature, timeout);
}

// Handle stop monitoring requests
function handleStopRequest(ws, data) {
    const conn = connections.get(ws);
    if (!conn) return;

    const { signature } = data;
    console.log(`Stopping monitoring for signature: ${signature}`);
    
    conn.monitoredSignatures.delete(signature);
    if (conn.monitoredSignatures.size === 0) {
        conn.isMonitoring = false;
    }

    sendMessage(ws, {
        type: 'stopped',
        signature,
        message: 'Stopped monitoring transaction'
    });
}

// Handle subscribe requests
function handleSubscribeRequest(ws, data) {
    const { signature } = data;
    console.log(`Subscribing to signature: ${signature}`);
    
    const conn = connections.get(ws);
    if (conn) {
        conn.monitoredSignatures.add(signature);
    }

    // Send subscription confirmation
    sendMessage(ws, {
        type: 'subscribed',
        signature,
        message: 'Subscribed to transaction'
    });

    // Simulate a transaction update
    sendMessage(ws, {
        type: 'next',
        id: signature,
        payload: {
            signature,
            slot: 150005565,
            timestamp: Date.now(),
            result: 'Transaction was already confirmed',
            maker_fee: 0.0025,
            taker_fee: 0.004
        }
    });
}

// Handle unsubscribe requests
function handleUnsubscribeRequest(ws, data) {
    const { signature } = data;
    console.log(`Unsubscribing from signature: ${signature}`);
    
    const conn = connections.get(ws);
    if (conn) {
        conn.monitoredSignatures.delete(signature);
    }

    sendMessage(ws, {
        type: 'unsubscribed',
        signature,
        message: 'Unsubscribed from transaction'
    });
}

// Simulate transaction updates
function simulateTransactionUpdates(ws, signature, timeout) {
    const startTime = Date.now();
    
    const interval = setInterval(() => {
        const conn = connections.get(ws);
        if (!conn || !conn.monitoredSignatures.has(signature)) {
            clearInterval(interval);
            return;
        }

        const elapsed = Date.now() - startTime;
        if (elapsed >= timeout) {
            clearInterval(interval);
            sendMessage(ws, {
                type: 'timeout',
                signature,
                message: 'Transaction monitoring timed out'
            });
            return;
        }

        // Send simulated update
        sendMessage(ws, {
            type: 'next',
            id: signature,
            payload: {
                signature,
                slot: 150005565,
                timestamp: Date.now(),
                result: 'Transaction was already confirmed',
                maker_fee: 0.0025,
                taker_fee: 0.004
            }
        });
    }, 2000); // Send updates every 2 seconds
}

// Helper function to send messages
function sendMessage(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
}

// Helper function to send errors
function sendError(ws, message) {
    sendMessage(ws, {
        type: 'error',
        message
    });
}

// Start the server
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Mock WebSocket server running at http://localhost:${PORT}`);
    console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
}); 