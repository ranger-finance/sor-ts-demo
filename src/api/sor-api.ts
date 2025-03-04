/**
 * SOR API client implementation
 */
import { Connection } from '@solana/web3.js';
import { 
  SorSdkConfig,
  OrderMetadataRequest,
  OrderMetadataResponse,
  IncreasePositionRequest,
  DecreasePositionRequest,
  ClosePositionRequest,
  TransactionResponse,
  PositionsResponse
} from '../types';
import { apiGet, apiPost } from '../utils/api';
import { createTransaction, signAndSendTransaction } from '../utils/transaction';

/**
 * Default configuration values
 */
const DEFAULT_SOR_API_URL = 'https://staging-sor-api-437363704888.asia-northeast1.run.app/v1';
const DEFAULT_DATA_API_URL = 'https://data-api-staging-437363704888.asia-northeast1.run.app/v1';
const DEFAULT_SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com';

/**
 * SOR API client class
 */
export class SorApi {
  private apiKey: string;
  private sorApiBaseUrl: string;
  private dataApiBaseUrl: string;
  private connection: Connection;

  /**
   * Creates a new SOR API client
   */
  constructor(config: SorSdkConfig) {
    this.apiKey = config.apiKey;
    this.sorApiBaseUrl = config.sorApiBaseUrl || DEFAULT_SOR_API_URL;
    this.dataApiBaseUrl = config.dataApiBaseUrl || DEFAULT_DATA_API_URL;
    this.connection = new Connection(
      config.solanaRpcUrl || DEFAULT_SOLANA_RPC_URL,
      'confirmed'
    );
  }

  /**
   * Gets a quote for a potential trade
   */
  async getOrderMetadata(request: OrderMetadataRequest): Promise<OrderMetadataResponse> {
    const url = `${this.sorApiBaseUrl}/order_metadata`;
    return apiPost<OrderMetadataResponse>(url, this.apiKey, request);
  }

  /**
   * Increases a position
   */
  async increasePosition(request: IncreasePositionRequest): Promise<TransactionResponse> {
    const url = `${this.sorApiBaseUrl}/increase_position`;
    return apiPost<TransactionResponse>(url, this.apiKey, request);
  }

  /**
   * Decreases a position
   */
  async decreasePosition(request: DecreasePositionRequest): Promise<TransactionResponse> {
    const url = `${this.sorApiBaseUrl}/decrease_position`;
    return apiPost<TransactionResponse>(url, this.apiKey, request);
  }

  /**
   * Closes a position
   */
  async closePosition(request: ClosePositionRequest): Promise<TransactionResponse> {
    const url = `${this.sorApiBaseUrl}/close_position`;
    return apiPost<TransactionResponse>(url, this.apiKey, request);
  }

  /**
   * Gets positions for a wallet
   */
  async getPositions(
    publicKey: string,
    options?: {
      platforms?: string[];
      symbols?: string[];
      from?: string;
    }
  ): Promise<PositionsResponse> {
    const url = `${this.dataApiBaseUrl}/positions`;
    
    const params: Record<string, string | string[]> = {
      public_key: publicKey
    };
    
    if (options?.platforms) {
      params.platforms = options.platforms;
    }
    
    if (options?.symbols) {
      params.symbols = options.symbols;
    }
    
    if (options?.from) {
      params.from = options.from;
    }
    
    return apiGet<PositionsResponse>(url, this.apiKey, params);
  }

  /**
   * Executes a transaction from a transaction response
   */
  async executeTransaction(
    transactionResponse: TransactionResponse,
    signTransaction: (tx: any) => Promise<any>
  ): Promise<{ signature: string }> {
    // Create transaction from base64 message
    const transaction = createTransaction(transactionResponse.message);
    
    // Sign and send transaction
    return signAndSendTransaction(
      transaction,
      this.connection,
      signTransaction
    );
  }

  /**
   * Gets the Solana connection
   */
  getConnection(): Connection {
    return this.connection;
  }
} 