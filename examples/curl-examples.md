# Ranger SOR API - cURL Examples

This document provides examples of how to interact with the Ranger SOR API using cURL commands.

## Authentication

All API requests require an API key in the `x-api-key` header.

```bash
x-api-key: sk_test_limited456
```

## Base URLs

```
SOR API: https://staging-sor-api-437363704888.asia-northeast1.run.app/v1
Data API: https://data-api-staging-437363704888.asia-northeast1.run.app/v1
```

## Examples

### 1. Get a Quote (Order Metadata)

```bash
curl --location 'https://staging-sor-api-437363704888.asia-northeast1.run.app/v1/order_metadata' \
--header 'Content-Type: application/json' \
--header 'x-api-key: sk_test_limited456' \
--data '{ 
  "fee_payer": "AcohpNxNXY62cuUdcb5d38TAzWYvYXW89Q5X6eYNR2iB", 
  "symbol": "SOL", 
  "side": "Long", 
  "size": 1.0, 
  "collateral": 10.0, 
  "size_denomination": "SOL", 
  "collateral_denomination": "USDC", 
  "adjustment_type": "Increase" 
}'
```

### 2. Increase Position

```bash
curl --location 'https://staging-sor-api-437363704888.asia-northeast1.run.app/v1/increase_position' \
--header 'Content-Type: application/json' \
--header 'x-api-key: sk_test_limited456' \
--data '{
  "fee_payer": "AcohpNxNXY62cuUdcb5d38TAzWYvYXW89Q5X6eYNR2iB",
  "symbol": "SOL",
  "side": "Long",
  "size": 1.0,
  "collateral": 10.0,
  "size_denomination": "SOL",
  "collateral_denomination": "USDC",
  "adjustment_type": "Increase"
}'
```

### 3. Decrease Position

```bash
curl --location 'https://staging-sor-api-437363704888.asia-northeast1.run.app/v1/decrease_position' \
--header 'Content-Type: application/json' \
--header 'x-api-key: sk_test_limited456' \
--data '{
  "fee_payer": "AcohpNxNXY62cuUdcb5d38TAzWYvYXW89Q5X6eYNR2iB",
  "symbol": "SOL",
  "side": "Long",
  "size": 0.5,
  "collateral": 5.0,
  "size_denomination": "SOL",
  "collateral_denomination": "USDC",
  "adjustment_type": "DecreaseFlash"
}'
```

### 4. Close Position

```bash
curl --location 'https://staging-sor-api-437363704888.asia-northeast1.run.app/v1/close_position' \
--header 'Content-Type: application/json' \
--header 'x-api-key: sk_test_limited456' \
--data '{
  "fee_payer": "AcohpNxNXY62cuUdcb5d38TAzWYvYXW89Q5X6eYNR2iB",
  "symbol": "SOL",
  "side": "Long",
  "adjustment_type": "CloseFlash"
}'
```

### 5. Get Positions

```bash
curl --location 'https://data-api-staging-437363704888.asia-northeast1.run.app/v1/positions?public_key=Adjmfo9hneSPSzkXj5JYMp9KqiN4zdy6Vsm31a8WVEdg' \
--header 'x-api-key: sk_test_limited456'
```

### 6. Get Positions with Filters

```bash
curl --location 'https://data-api-staging-437363704888.asia-northeast1.run.app/v1/positions?public_key=Adjmfo9hneSPSzkXj5JYMp9KqiN4zdy6Vsm31a8WVEdg&platforms[]=DRIFT&platforms[]=FLASH&symbols[]=SOL-PERP&from=2024-02-18T00:00:00Z' \
--header 'x-api-key: sk_test_limited456'
```

## Response Examples

### Order Metadata Response

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

### Transaction Response

```json
{
  "message": "5KKsT9nUG9tKwUhtw3WP...",
  "meta": {
    "executed_price": 20.55,
    "executed_size": 1.0,
    "executed_collateral": 1000.0,
    "venues_used": ["Flash", "Jupiter"]
  }
}
```

### Positions Response

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