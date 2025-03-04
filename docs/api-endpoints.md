# Ranger SOR API Endpoints

## API URLs

The Ranger SOR SDK supports the following API endpoints:

### Staging Environment
- **SOR API**: `https://staging-sor-api-437363704888.asia-northeast1.run.app`
- **Data API (positions)**: `https://data-api-staging-437363704888.asia-northeast1.run.app`

### Production Environment
- **SOR API**: `https://api.ranger.finance`

## Usage in SDK

When initializing the `RangerSORClient`, you can specify which environment to use:

```typescript
// For staging environment
const stagingClient = new RangerSORClient(
  'your-api-key',
  'https://staging-sor-api-437363704888.asia-northeast1.run.app'
);

// For production environment (default)
const productionClient = new RangerSORClient('your-api-key');
```

For position data queries (using `getPositions`), you'll need to specify the appropriate data API URL separately.

## API Services

The Ranger API is split into two services:

1. **SOR API** - Handles order routing, quotes, and position management
2. **Data API** - Provides access to historical and current position data

Each service has its own base URL but uses the same authentication method with your API key. 

## API Versioning

All API endpoints use the `/v1` prefix. For example:

- `/v1/order_metadata` - For getting quotes
- `/v1/increase_position` - For opening or increasing positions
- `/v1/decrease_position` - For decreasing positions
- `/v1/positions` - For retrieving user positions

Always include the `/v1` prefix in your API calls. 