/**
 * Type definitions for the Ranger SOR API SDK
 */

/**
 * Trading side options
 */
export type TradeSide = 'Long' | 'Short';

/**
 * Adjustment type options for different operations
 */
export type AdjustmentType =
  | 'Quote'
  | 'Increase'
  | 'DecreaseFlash'
  | 'DecreaseJupiter'
  | 'DecreaseDrift'
  | 'DecreaseAdrena'
  | 'CloseFlash'
  | 'CloseJupiter'
  | 'CloseDrift'
  | 'CloseAdrena'
  | 'CloseAll';

/**
 * Base request interface with common parameters
 */
export interface BaseRequest {
  fee_payer: string;
  symbol: string;
  side: TradeSide;
  size_denomination?: string;
  collateral_denomination?: string;
}

/**
 * Order metadata request interface
 */
export interface OrderMetadataRequest extends BaseRequest {
  size: number;
  collateral: number;
  size_denomination: string;
  collateral_denomination: string;
  adjustment_type: AdjustmentType;
}

/**
 * Increase position request interface
 */
export interface IncreasePositionRequest extends BaseRequest {
  size: number;
  collateral: number;
  size_denomination: string;
  collateral_denomination: string;
  adjustment_type: 'Increase';
}

/**
 * Decrease position request interface
 */
export interface DecreasePositionRequest extends BaseRequest {
  size: number;
  collateral: number;
  size_denomination: string;
  collateral_denomination: string;
  adjustment_type: 'DecreaseFlash' | 'DecreaseJupiter' | 'DecreaseDrift' | 'DecreaseAdrena';
}

/**
 * Close position request interface
 */
export interface ClosePositionRequest extends BaseRequest {
  adjustment_type: 'CloseFlash' | 'CloseJupiter' | 'CloseDrift' | 'CloseAdrena' | 'CloseAll';
}

/**
 * Fee breakdown structure
 */
export interface FeeBreakdown {
  base_fee: number;
  spread_fee: number;
  volatility_fee: number;
  margin_fee: number;
  close_fee: number;
  other_fees: number;
}

/**
 * Quote information structure
 */
export interface Quote {
  base: number;
  fee: number;
  total: number;
  fee_breakdown: FeeBreakdown;
}

/**
 * Venue allocation structure
 */
export interface VenueAllocation {
  venue_name: string;
  collateral: number;
  size: number;
  quote: Quote;
  order_available_liquidity: number;
  venue_available_liquidity: number;
}

/**
 * Order metadata response interface
 */
export interface OrderMetadataResponse {
  venues: VenueAllocation[];
  total_collateral: number;
  total_size: number;
}

/**
 * Transaction response metadata
 */
export interface TransactionMeta {
  executed_price?: number;
  executed_size?: number;
  executed_collateral?: number;
  venues_used?: string[];
}

/**
 * Transaction response interface
 */
export interface TransactionResponse {
  message: string; // Base64-encoded transaction message
  meta?: TransactionMeta;
}

/**
 * Position interface
 */
export interface Position {
  id: string;
  symbol: string;
  side: TradeSide;
  quantity: number;
  entry_price: number;
  liquidation_price: number;
  position_leverage: number;
  real_collateral: number;
  unrealized_pnl: number;
  borrow_fee: number;
  funding_fee: number;
  open_fee: number;
  close_fee: number;
  created_at: string;
  opened_at: string;
  platform: string;
}

/**
 * Positions response interface
 */
export interface PositionsResponse {
  positions: Position[];
}

/**
 * API error interface
 */
export interface ApiError {
  message: string;
  error_code: number;
}

/**
 * SDK configuration options
 */
export interface SorSdkConfig {
  apiKey: string;
  sorApiBaseUrl?: string;
  dataApiBaseUrl?: string;
  solanaRpcUrl?: string;
} 