# Geo-Fence Logic Implementation

## Core Algorithms

### 1. Circle Geo-Fence (Haversine Formula)

```typescript
/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if point is within circular geo-fence
 */
function isWithinCircleGeofence(
  userLat: number,
  userLng: number,
  geofence: CircleGeofence
): boolean {
  const distance = calculateDistance(
    userLat, 
    userLng, 
    geofence.center.lat, 
    geofence.center.lng
  );
  
  return distance <= geofence.radius_km;
}
```

### 2. Polygon Geo-Fence (Ray Casting)

```typescript
/**
 * Check if point is within polygon geo-fence using ray casting
 */
function isWithinPolygonGeofence(
  userLat: number,
  userLng: number,
  geofence: PolygonGeofence
): boolean {
  const { coordinates } = geofence;
  let inside = false;
  
  for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
    const [latI, lngI] = coordinates[i];
    const [latJ, lngJ] = coordinates[j];
    
    if (((lngI > userLng) !== (lngJ > userLng)) &&
        (userLat < (latJ - latI) * (userLng - lngI) / (lngJ - lngI) + latI)) {
      inside = !inside;
    }
  }
  
  return inside;
}
```

### 3. Universal Geo-Fence Checker

```typescript
interface CircleGeofence {
  type: 'circle';
  center: { lat: number; lng: number };
  radius_km: number;
}

interface PolygonGeofence {
  type: 'polygon';
  coordinates: [number, number][]; // [lat, lng][]
}

type Geofence = CircleGeofence | PolygonGeofence;

/**
 * Universal geo-fence validation
 */
function validateGeofenceEntry(
  userLat: number,
  userLng: number,
  geofence: Geofence
): { isInside: boolean; distanceKm?: number } {
  switch (geofence.type) {
    case 'circle':
      const distance = calculateDistance(
        userLat, userLng, 
        geofence.center.lat, geofence.center.lng
      );
      return {
        isInside: distance <= geofence.radius_km,
        distanceKm: distance
      };
      
    case 'polygon':
      return {
        isInside: isWithinPolygonGeofence(userLat, userLng, geofence)
      };
      
    default:
      throw new Error('Invalid geofence type');
  }
}
```

## Time Window Logic

### 1. Time Validation

```typescript
/**
 * Check if transfer is still within time window
 */
function isWithinTimeWindow(
  createdAt: Date,
  timeLimitHours: number
): boolean {
  const now = new Date();
  const timeLimit = new Date(createdAt.getTime() + (timeLimitHours * 60 * 60 * 1000));
  return now <= timeLimit;
}

/**
 * Calculate remaining time
 */
function getRemainingTime(
  createdAt: Date,
  timeLimitHours: number
): { expired: boolean; remainingMinutes: number } {
  const now = new Date();
  const timeLimit = new Date(createdAt.getTime() + (timeLimitHours * 60 * 60 * 1000));
  const remainingMs = timeLimit.getTime() - now.getTime();
  
  return {
    expired: remainingMs <= 0,
    remainingMinutes: Math.max(0, Math.floor(remainingMs / (1000 * 60)))
  };
}
```

### 2. Background Job Logic

```typescript
/**
 * Background job to check expired transfers
 */
async function processExpiredTransfers() {
  const expiredTransfers = await db.query(`
    SELECT id, stripe_payment_intent_id 
    FROM conditional_transfers 
    WHERE status = 'pending' 
    AND time_limit < NOW()
  `);
  
  for (const transfer of expiredTransfers) {
    try {
      // Refund via Stripe
      await stripe.paymentIntents.cancel(transfer.stripe_payment_intent_id);
      
      // Update status
      await db.query(`
        UPDATE conditional_transfers 
        SET status = 'expired' 
        WHERE id = $1
      `, [transfer.id]);
      
    } catch (error) {
      console.error(`Failed to process expired transfer ${transfer.id}:`, error);
    }
  }
}
```

## Integration Points

### 1. Location Update Endpoint

```typescript
app.post('/api/location/update', async (req, res) => {
  const { transferId, latitude, longitude, accuracy } = req.body;
  const userId = req.user.id;
  
  // Validate transfer exists and user is recipient
  const transfer = await getTransferForRecipient(transferId, userId);
  if (!transfer) {
    return res.status(404).json({ error: 'Transfer not found' });
  }
  
  // Check if still within time window
  const timeStatus = getRemainingTime(transfer.created_at, transfer.time_limit_hours);
  if (timeStatus.expired) {
    return res.status(400).json({ error: 'Transfer expired' });
  }
  
  // Validate geo-fence
  const geofenceResult = validateGeofenceEntry(
    latitude, longitude, transfer.geo_fence
  );
  
  // Log location
  await logLocation({
    userId,
    transferId,
    latitude,
    longitude,
    accuracy,
    withinGeofence: geofenceResult.isInside,
    distanceFromCenterKm: geofenceResult.distanceKm
  });
  
  // If conditions met, release funds
  if (geofenceResult.isInside) {
    await releaseFunds(transfer);
    return res.json({ 
      success: true, 
      conditionMet: true,
      fundsReleased: true 
    });
  }
  
  res.json({ 
    success: true, 
    conditionMet: false,
    remainingMinutes: timeStatus.remainingMinutes,
    distanceKm: geofenceResult.distanceKm
  });
});
```

### 2. Helper Functions

```typescript
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

async function releaseFunds(transfer: ConditionalTransfer) {
  // Capture the payment intent
  await stripe.paymentIntents.capture(transfer.stripe_payment_intent_id);
  
  // Update transfer status
  await db.query(`
    UPDATE conditional_transfers 
    SET status = 'released', condition_met_at = NOW() 
    WHERE id = $1
  `, [transfer.id]);
}
```
