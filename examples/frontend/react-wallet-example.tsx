/**
 * React wallet example for the Ranger SOR API SDK
 * 
 * This example demonstrates how to use the SDK with a React application and wallet adapter.
 * 
 * Note: This is a code example only and not meant to be run directly.
 * You would need to integrate this into a React application with the Solana wallet adapter.
 */
import React, { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SorApi, OrderMetadataResponse, TransactionResponse, TradeSide } from '../../src';

// Create the SOR API client
const sorApi = new SorApi({
  apiKey: process.env.RANGER_API_KEY || 'sk_test_limited456'
});

/**
 * Trading form component
 */
const TradingForm: React.FC = () => {
  // Get connection and wallet from wallet adapter
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  
  // Form state
  const [symbol, setSymbol] = useState('SOL');
  const [side, setSide] = useState<TradeSide>('Long');
  const [size, setSize] = useState(1);
  const [collateral, setCollateral] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<OrderMetadataResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  
  /**
   * Get a quote for the trade
   */
  const handleGetQuote = useCallback(async () => {
    if (!publicKey) {
      setError('Please connect your wallet');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const quoteResponse = await sorApi.getOrderMetadata({
        fee_payer: publicKey.toString(),
        symbol,
        side,
        size,
        collateral,
        size_denomination: symbol,
        collateral_denomination: 'USDC',
        adjustment_type: 'Quote'
      });
      
      setQuote(quoteResponse);
    } catch (err) {
      setError(`Error getting quote: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, symbol, side, size, collateral]);
  
  /**
   * Execute the trade
   */
  const handleExecuteTrade = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Step 1: Get transaction instructions
      const txResponse: TransactionResponse = await sorApi.increasePosition({
        fee_payer: publicKey.toString(),
        symbol,
        side,
        size,
        collateral,
        size_denomination: symbol,
        collateral_denomination: 'USDC',
        adjustment_type: 'Increase'
      });
      
      // Step 2: Execute the transaction
      const result = await sorApi.executeTransaction(
        txResponse,
        signTransaction
      );
      
      setTxSignature(result.signature);
    } catch (err) {
      setError(`Error executing trade: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, signTransaction, symbol, side, size, collateral]);
  
  /**
   * Render the component
   */
  return (
    <div className="trading-form">
      <h2>Ranger SOR Trading</h2>
      
      {/* Connection status */}
      <div className="wallet-status">
        {publicKey ? (
          <p>Connected: {publicKey.toString()}</p>
        ) : (
          <p>Please connect your wallet</p>
        )}
      </div>
      
      {/* Trading form */}
      <div className="form-group">
        <label>
          Symbol:
          <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
            <option value="SOL">SOL</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
          </select>
        </label>
      </div>
      
      <div className="form-group">
        <label>
          Side:
          <select 
            value={side} 
            onChange={(e) => setSide(e.target.value as TradeSide)}
          >
            <option value="Long">Long</option>
            <option value="Short">Short</option>
          </select>
        </label>
      </div>
      
      <div className="form-group">
        <label>
          Size:
          <input 
            type="number" 
            value={size} 
            onChange={(e) => setSize(parseFloat(e.target.value))} 
            min="0.1" 
            step="0.1" 
          />
        </label>
      </div>
      
      <div className="form-group">
        <label>
          Collateral (USDC):
          <input 
            type="number" 
            value={collateral} 
            onChange={(e) => setCollateral(parseFloat(e.target.value))} 
            min="1" 
            step="1" 
          />
        </label>
      </div>
      
      {/* Action buttons */}
      <div className="form-actions">
        <button 
          onClick={handleGetQuote} 
          disabled={isLoading || !publicKey}
        >
          Get Quote
        </button>
        
        <button 
          onClick={handleExecuteTrade} 
          disabled={isLoading || !publicKey || !signTransaction}
        >
          Execute Trade
        </button>
      </div>
      
      {/* Loading indicator */}
      {isLoading && <div className="loading">Loading...</div>}
      
      {/* Error message */}
      {error && <div className="error">{error}</div>}
      
      {/* Quote display */}
      {quote && (
        <div className="quote-result">
          <h3>Quote Result</h3>
          <p>Total Size: {quote.total_size} {symbol}</p>
          <p>Total Collateral: {quote.total_collateral} USDC</p>
          
          <h4>Venues:</h4>
          <ul>
            {quote.venues.map((venue, index) => (
              <li key={index}>
                <strong>{venue.venue_name}</strong>
                <p>Size: {venue.size} {symbol}</p>
                <p>Collateral: {venue.collateral} USDC</p>
                <p>Price: {venue.quote.total}</p>
                <p>Fee: {venue.quote.fee}</p>
                <p>Available Liquidity: {venue.venue_available_liquidity}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Transaction result */}
      {txSignature && (
        <div className="transaction-result">
          <h3>Transaction Successful!</h3>
          <p>Signature: {txSignature}</p>
          <a 
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            View on Solana Explorer
          </a>
        </div>
      )}
    </div>
  );
};

export default TradingForm; 