# Location & Maps Migration Checklist

**Goal:** Migrate to open-source location services (Nominatim) while preserving existing business logic and UI.

**Start Date:** May 25, 2026  
**Status:** IN PROGRESS

---

## ⚠️ TECHNICAL CLARIFICATION

### Current Setup Analysis:
- ✅ `react-native-maps` already installed - uses PROVIDER_GOOGLE (free tier, no API key needed)
- ✅ `expo-location` already installed - for GPS + reverse geocoding
- ❌ NO actual Google Maps API key in use (using built-in Google provider)
- ❌ Help Requests have NO location picker (text-only)
- ❌ Requests model missing locationGeo (can't do geospatial queries)

### Map Tile Strategy:
- **OSM Tiles on Native:** React-native-maps doesn't natively support custom OSM tiles easily across iOS+Android
  - Android: Could use PROVIDER_OSMDROID (requires additional lib)
  - iOS: No built-in OSM support
  - **Decision:** Keep Google Maps provider (free tier) for now, focus on data layer (Nominatim)
- **Reverse Geocoding:** MIGRATE from expo-location → Nominatim API (open-source, no key needed)

### Scope:
- ✅ Migrate reverse geocoding → Nominatim
- ✅ Add LocationPicker to HelpRequestForm
- ✅ Fix request geospatial DB support
- ✅ Create shared location utilities
- ⚠️ Maps tiles: Keep Google provider (technical limitation on native platforms)

---

## 📋 PHASE 1: PREPARATION & SETUP

### Step 1.1 - Verify Current Dependencies
- [x] `react-native-maps` (^1.26.20) - Already installed
- [x] `expo-location` (~55.1.9) - Already installed
- [ ] **No new packages needed** - Nominatim is free HTTP API

### Step 1.2 - Create Environment Variables (if needed)
Location service URLs (open-source, no auth needed):
```env
# No auth required - these are open services
NOMINATIM_REVERSE_URL=https://nominatim.openstreetmap.org/reverse
```

---

## 📋 PHASE 2: FRONTEND - CREATE SHARED LOCATION UTILITIES

### Step 2.1 - Create `app/lib/locationService.ts` (NEW)
Replace expo-location reverse geocoding with Nominatim

**Location:** `app/lib/locationService.ts`  
**Scope:**
- `getCurrentLocation()` - Get device GPS (use expo-location)
- `reverseGeocodeNominatim()` - Convert coords → address (use Nominatim)
- `requestLocationPermission()` - Permission handling
- **Remove dependency:** expo-location's reverseGeocodeAsync

---

## 📋 PHASE 3: FRONTEND - UPDATE LOCATION PICKER

### Step 3.1 - Update `app/components/common/LocationPicker.tsx`
- [ ] Import new `reverseGeocodeNominatim()` from locationService
- [ ] Replace `Location.reverseGeocodeAsync()` calls with Nominatim
- [ ] Keep all UI/UX intact
- [ ] Keep all state management intact

### Step 3.2 - Update `app/components/common/MapLocationPickerModal.tsx`
- [ ] Import new `reverseGeocodeNominatim()` from locationService
- [ ] Replace `Location.reverseGeocodeAsync()` calls with Nominatim
- [ ] Keep map provider as-is (PROVIDER_GOOGLE)
- [ ] Keep UI/UX intact

---

## 📋 PHASE 4: FRONTEND - ADD LOCATION TO HELP REQUESTS

### Step 4.1 - Update `app/components/Recipient/HelpRequestForm.tsx`
- [ ] Import LocationPicker component
- [ ] Replace text input `<TextInput placeholder="Your area..."/>` with LocationPicker
- [ ] Add state for location object: `{latitude, longitude, landmark, areaName, fullAddress}`
- [ ] Update form submission to include location coordinates
- [ ] Keep UI layout and styling (add LocationPicker where location input was)

### Step 4.2 - Update `app/store/requestStore.ts`
- [ ] Update `createRequest()` to send full location object with coordinates
- [ ] Update `mapBackendRequest()` to handle location.coordinates
- [ ] Add `distanceKm` support like donationStore

---

## 📋 PHASE 5: BACKEND - UPDATE REQUEST MODEL

### Step 5.1 - Update `backend/modules/requests/model.js`
- [ ] Add `locationGeo` field (GeoJSON Point)
- [ ] Add 2dsphere index
- [ ] Keep existing `location` field for backward compatibility

**Schema to add:**
```javascript
locationGeo: {
  type: { type: String, enum: ["Point"] },
  coordinates: { type: [Number], default: undefined }
}
// Index: requestSchema.index({ locationGeo: "2dsphere" }, { sparse: true })
```

---

## 📋 PHASE 6: BACKEND - CREATE SHARED GEOSPATIAL UTILITIES

### Step 6.1 - Create `backend/shared/geospatial.js` (NEW)
- [ ] Extract `setLocationGeoFromBody()` function
- [ ] Extract `calculateDistanceKm()` function
- [ ] Export `DEFAULT_BROWSE_RADIUS_KM` constant
- [ ] Both donations & requests will import these

---

## 📋 PHASE 7: BACKEND - UPDATE REQUEST CONTROLLER

### Step 7.1 - Update `backend/modules/requests/controller.js`
- [ ] Import shared geospatial utilities
- [ ] Update `createRequest()` to call `setLocationGeoFromBody()`
- [ ] Replace `getNearbyRequests()` manual loop with `$geoNear` aggregation
- [ ] Copy $geoNear pattern from donations/controller.js

---

## 📋 PHASE 8: BACKEND - REFACTOR DONATIONS CONTROLLER

### Step 8.1 - Update `backend/modules/donations/controller.js`
- [ ] Import from `backend/shared/geospatial.js`
- [ ] Replace inline functions with imported utilities
- [ ] Keep all $geoNear logic intact

---

## 📋 PHASE 9: VERIFY & CLEANUP

### Step 9.1 - Remove Unused Code
- [ ] Remove unused imports from expo-location where replaced by Nominatim
- [ ] Remove old inline distance functions (now in shared utils)
- [ ] Verify NO Google Maps API keys in code (should be none)

### Step 9.2 - Test Compilation
- [ ] Frontend compiles without errors
- [ ] Backend compiles without errors
- [ ] No TypeScript errors

### Step 9.3 - Runtime Verification
- [ ] App loads without crashes
- [ ] LocationPicker renders in DonationPost
- [ ] LocationPicker renders in HelpRequestForm
- [ ] Map modal shows map
- [ ] GPS location button works
- [ ] Manual location selection works
- [ ] Reverse geocoding returns addresses (Nominatim)
- [ ] Donation post saves location with coordinates
- [ ] Help request saves location with coordinates
- [ ] Nearby donation search works
- [ ] Nearby request search works

---

## 📋 PHASE 10: DATABASE MIGRATION

### Step 10.1 - Add Index to MongoDB
After deploying new request model:
```javascript
// Run in MongoDB:
db.requests.createIndex({ locationGeo: "2dsphere" }, { sparse: true })
```

### Step 10.2 - Backfill Existing Requests (Optional)
- [ ] If requests exist without locationGeo, they'll simply not appear in geospatial queries
- [ ] New requests will have locationGeo automatically
- [ ] No data loss, gradual migration

---

## 📊 FILES AFFECTED

### To Create (NEW):
- [ ] `app/lib/locationService.ts` - Shared location utilities
- [ ] `backend/shared/geospatial.js` - Shared geospatial utilities

### To Modify:
Frontend:
- [ ] `app/components/common/LocationPicker.tsx` - Use Nominatim
- [ ] `app/components/common/MapLocationPickerModal.tsx` - Use Nominatim
- [ ] `app/components/Recipient/HelpRequestForm.tsx` - Add LocationPicker
- [ ] `app/store/requestStore.ts` - Handle coordinates

Backend:
- [ ] `backend/modules/requests/model.js` - Add locationGeo + index
- [ ] `backend/modules/requests/controller.js` - Use $geoNear
- [ ] `backend/modules/donations/controller.js` - Use shared utils

### To NOT Touch:
- ✅ `app/components/Donor/DonationPost.tsx` - Works as-is (uses LocationPicker)
- ✅ `backend/modules/donations/model.js` - Already correct
- ✅ Authentication, messages, notifications
- ✅ DonationRequest flow
- ✅ Any other unrelated components

### To Delete:
- [ ] Check if any unused imports after migration
- [ ] No files to completely delete

---

## 🔄 SUMMARY OF CHANGES

### Data Flow (Before vs After):

**Before:**
```
User picks location → LocationPicker → expo-location.reverseGeocodeAsync()
  → Sends: {landmark, areaName, coordinates}
  → Backend stores location object
  → Help Request: NO LocationPicker, text-only
  → Requests: NO geospatial queries
```

**After:**
```
User picks location → LocationPicker → Nominatim API reverse geocoding
  → Sends: {landmark, areaName, fullAddress, coordinates}
  → Backend stores location object + locationGeo GeoJSON
  → Help Request: USES LocationPicker, full coordinates
  → Requests: Uses $geoNear for geospatial queries
```

---

## ✅ COMPLETION CRITERIA

- [ ] No compilation errors
- [ ] No TypeScript errors
- [ ] LocationPicker works in both DonationPost and HelpRequestForm
- [ ] Map renders correctly
- [ ] Reverse geocoding works with Nominatim
- [ ] Donation post saves with coordinates
- [ ] Help request saves with coordinates
- [ ] Nearby search works for both donations and requests
- [ ] All unit tests pass (if any)
- [ ] No Google API keys in code
- [ ] Database indexes created

---

## 📝 NOTES

- Nominatim API: Free, open-source, no authentication required
- No rate limiting for reasonable usage (small app)
- Coordinate order: Frontend uses `{lat, lng}`, MongoDB expects `[lng, lat]`
- Backward compatibility maintained (old records without locationGeo work)
- React-native-maps stays with Google provider (free tier, works across platforms)
