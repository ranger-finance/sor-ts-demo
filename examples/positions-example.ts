/**
 * Positions example for the Ranger SOR API SDK
 * 
 * This example demonstrates how to fetch positions using the SDK.
 */
import { SorApi } from '../src';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// API key from environment variables
const API_KEY = process.env.RANGER_API_KEY || 'sk_test_limited456';

// Create SOR API client
const sorApi = new SorApi({
  apiKey: API_KEY
});

/**
 * Example: Get positions
 */
async function getPositions() {
  console.log('Getting positions...');
  
  try {
    const positions = await sorApi.getPositions(
      'Adjmfo9hneSPSzkXj5JYMp9KqiN4zdy6Vsm31a8WVEdg',
      {
        platforms: ['DRIFT', 'FLASH'],
        symbols: ['SOL-PERP']
      }
    );
    
    console.log('Positions received:');
    console.log(JSON.stringify(positions, null, 2));
    
    return positions;
  } catch (error) {
    console.error('Error getting positions:', error);
    throw error;
  }
}

/**
 * Run the example
 */
async function runExample() {
  try {
    await getPositions();
    console.log('\nExample completed successfully!');
  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Run the example
runExample(); 