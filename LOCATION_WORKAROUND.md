# Location Workaround for Developers

> How to view and test the flood reporting app when you're outside participating counties

## The Issue

The app is designed to:
- **View flood data**: Available to ANYONE, ANYWHERE (statewide)
- **Submit reports**: Only available from participating counties (Volusia & Palm Beach)

However, when you're outside these counties, the ReportForm shows a message instead of the submission form. The map and all other features should still work fine.

## Quick Workaround: Spoof Your Location (For Development/Testing)

### Chrome/Edge
1. Open Developer Tools (F12 or Cmd+Option+I)
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "sensors" and select "Show Sensors"
4. In the Sensors panel:
   - Find "Location" section
   - Choose a preset location OR enter custom coordinates

**Recommended Test Locations:**

**Volusia County (Daytona Beach area):**
- Latitude: `29.2108`
- Longitude: `-81.0228`

**Palm Beach County (Wellington):**
- Latitude: `26.6617`
- Longitude: `-80.2683`

**Miami (outside reporting area - for testing "view only" mode):**
- Latitude: `25.7617`
- Longitude: `-80.1918`

### Firefox
1. Open Developer Tools (F12 or Cmd+Option+I)
2. Press `Shift+F2` to open Developer Toolbar
3. Type: `geo setlatlon <latitude> <longitude>`
   - Example: `geo setlatlon 29.2108 -81.0228`

### Safari
1. Enable Developer menu: Safari → Preferences → Advanced → Show Develop menu
2. Develop → Simulate Location → Custom Location
3. Enter coordinates:
   - **Volusia**: 29.2108, -81.0228
   - **Palm Beach**: 26.6617, -80.2683

## Understanding the Access Model

### What You CAN Do From Anywhere:
✅ View the entire Florida flood map
✅ See all submitted flood reports (statewide)
✅ View statistics and data panels
✅ Access NOAA weather alerts
✅ View USGS stream gauge data

### What You CANNOT Do Outside Participating Counties:
❌ Submit new flood reports
❌ Access the report submission form

### Why This Design?

The app displays data **statewide** to raise awareness about flooding across Florida, but limits **reporting** to counties with active advocacy groups. This:
- Maintains data quality (reports from verified locations)
- Prevents spam from outside the region
- Allows new counties to join as advocacy expands

## Permanently Allow Reporting from Anywhere (Dev Mode Only)

**⚠️ WARNING: This should NEVER be deployed to production!**

For local development, you can temporarily disable location restrictions:

### Option 1: Comment Out Validation (Frontend)

In `frontend/src/components/Report/ReportForm.tsx`, comment out the location check:

```tsx
// Temporarily disable for testing
// if (!isInVolusia) {
//   return (
//     <div className="bg-blue-50...">
//       ...location required message...
//     </div>
//   );
// }
```

### Option 2: Mock Location in App Store (Frontend)

In `frontend/src/App.tsx`, hardcode a Volusia location:

```tsx
// TEMPORARY: Override for testing
setUserLocation({ lat: 29.2108, lng: -81.0228 });
setIsInVolusia(true);
```

### Option 3: Disable Backend Validation (Backend)

In `backend/src/middleware/validation.ts`, comment out the bounds check:

```typescript
// Temporarily disable for testing
// if (!isInReportingArea(latitude, longitude)) {
//   return res.status(400).json({
//     error: 'Location must be within participating counties'
//   });
// }
```

**Remember:** Remove these changes before committing!

## The Proper Solution: Add More Counties

If you want to expand reporting to more counties, update the constants:

**File:** `frontend/src/utils/constants.ts` and `backend/src/utils/constants.ts`

```typescript
export const REPORTING_COUNTIES = {
  volusia: {
    name: 'Volusia County',
    south: 28.7,
    north: 29.4,
    west: -81.5,
    east: -80.8,
  },
  palmBeach: {
    name: 'Palm Beach County',
    south: 26.1,
    north: 27.0,
    west: -80.7,
    east: -80.0,
  },
  // Add your new county here:
  yourCounty: {
    name: 'Your County',
    south: <south_latitude>,
    north: <north_latitude>,
    west: <west_longitude>,
    east: <east_longitude>,
  },
};
```

Then deploy the changes to both frontend and backend.

## Mobile Testing

When testing on a physical device, you can use location spoofing apps:

**iOS:**
- Requires jailbreak OR use Xcode Simulator
- Xcode: Debug → Simulate Location

**Android:**
- Enable Developer Options
- Settings → Developer Options → Select mock location app
- Use apps like "Fake GPS Location" (search Play Store)

## Browser Extensions (Quick Access)

For frequent testing, use browser extensions:

**Chrome:**
- "Location Guard" - Set custom default location
- "Manual Geolocation" - Quick location spoofing

**Firefox:**
- "Location Guard" - Same features as Chrome version

## Environment Variable Override (Future Enhancement)

Consider adding a `.env` variable for development:

```env
# .env.local (never commit!)
VITE_DISABLE_LOCATION_VALIDATION=true
```

Then in code:
```typescript
const locationValidationDisabled = import.meta.env.VITE_DISABLE_LOCATION_VALIDATION === 'true';

if (!locationValidationDisabled && !isInVolusia) {
  // Show location required message
}
```

## Common Issues

### "User denied Geolocation"
- **Solution**: Allow location access in browser settings, OR use dev tools to spoof location
- The app still works for viewing - just can't submit reports

### Map shows but "Getting your location..." forever
- **Solution**: Check browser console for errors
- Make sure HTTPS is enabled (geolocation requires secure context)
- Try refreshing or using incognito mode

### Changes not appearing after spoofing location
- **Solution**: Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
- Clear service worker cache (DevTools → Application → Clear storage)

## Need Help?

- Check [DEVELOPMENT.md](DEVELOPMENT.md) for local setup
- See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for deployment
- Open an issue on GitHub

---

**Quick Reference - Volusia County Coordinates:**
```
Latitude:  29.2108
Longitude: -81.0228
```

Paste these into your browser's location sensor to enable full testing! 🚀
