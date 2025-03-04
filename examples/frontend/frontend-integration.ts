/**
 * Frontend Integration Example for the Ranger SOR API SDK
 * 
 * This is a pseudo-code example that demonstrates how to integrate
 * with the Ranger SOR API in a frontend application using a wallet adapter.
 * 
 * Note: This file is meant for reference only and cannot be executed directly.
 */

// In a real frontend application, you would import these:
// import { SorApi, TradeSide } from '@ranger-finance/sor-sdk';
// import { useWallet } from '@solana/wallet-adapter-react';
// import { WalletNotConnectedError } from '@solana/wallet-adapter-base';

/**
 * Example React component that demonstrates the integration
 */
function IncreasePositionExample() {
  // In a real application, you would access the wallet like this:
  // const { publicKey, sendTransaction } = useWallet();
  
  /**
   * Function to handle increasing a position
   */
  const handleIncreasePosition = async () => {
    try {
      // Check if wallet is connected
      if (!publicKey) {
        throw new WalletNotConnectedError();
      }
      
      // Create SOR API client
      const sorApi = new SorApi({
        apiKey: 'YOUR_API_KEY'
      });
      
      // Define increase position request
      const request = {
        fee_payer: publicKey.toString(),
        symbol: 'SOL',
        side: 'Long',
        size: 0.01,
        collateral: 0.1,
        size_denomination: 'SOL',
        collateral_denomination: 'USDC',
        adjustment_type: 'Increase'
      };
      
      console.log('Getting transaction instructions...');
      const response = await sorApi.increasePosition(request);
      
      if (!response.message) {
        throw new Error('No transaction message in response');
      }
      
      console.log('Transaction metadata:', response.meta);
      
      // 1. APPROACH ONE: Most wallet adapters can directly handle the base64 transaction
      const signature = await sendTransaction(response.message);
      
      // 2. ALTERNATIVE APPROACH: If needed, you can manually deserialize
      // const messageBytes = Buffer.from(response.message, 'base64');
      // const transaction = VersionedTransaction.deserialize(messageBytes);
      // const signature = await sendTransaction(transaction);
      
      console.log('Transaction sent:', signature);
      
      // Optionally wait for confirmation
      // const connection = new Connection('https://api.mainnet-beta.solana.com');
      // await connection.confirmTransaction(signature);
      
      console.log('Position increased successfully!');
      return signature;
    } catch (error) {
      console.error('Error increasing position:', error);
      throw error;
    }
  };
  
  // In a real React component, you would return JSX like this:
  // return (
  //   <div>
  //     <h2>Increase Position Example</h2>
  //     <button 
  //       onClick={handleIncreasePosition}
  //       disabled={!publicKey}
  //     >
  //       Increase Position
  //     </button>
  //   </div>
  // );
}

/**
 * Another example using the React hook pattern
 */
function useIncreasePosition() {
  // In a real application, you would access the wallet like this:
  // const { publicKey, sendTransaction } = useWallet();
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);
  
  /**
   * Function to increase a position
   */
  const increasePosition = async (params) => {
    // setLoading(true);
    // setError(null);
    
    try {
      // Check if wallet is connected
      if (!publicKey) {
        throw new WalletNotConnectedError();
      }
      
      // Create SOR API client
      const sorApi = new SorApi({
        apiKey: 'YOUR_API_KEY'
      });
      
      // Define increase position request
      const request = {
        fee_payer: publicKey.toString(),
        symbol: params.symbol || 'SOL',
        side: params.side || 'Long',
        size: params.size || 0.01,
        collateral: params.collateral || 0.1,
        size_denomination: params.size_denomination || 'SOL',
        collateral_denomination: params.collateral_denomination || 'USDC',
        adjustment_type: 'Increase'
      };
      
      console.log('Getting transaction instructions...');
      const response = await sorApi.increasePosition(request);
      
      if (!response.message) {
        throw new Error('No transaction message in response');
      }
      
      // Send the transaction using the wallet adapter
      const signature = await sendTransaction(response.message);
      
      console.log('Transaction sent:', signature);
      return {
        signature,
        meta: response.meta
      };
    } catch (error) {
      // setError(error);
      console.error('Error increasing position:', error);
      throw error;
    } finally {
      // setLoading(false);
    }
  };
  
  // In a real React hook, you would return these:
  // return {
  //   increasePosition,
  //   loading,
  //   error
  // };
}

// Export the examples
export { IncreasePositionExample, useIncreasePosition }; 