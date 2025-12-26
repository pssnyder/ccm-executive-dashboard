# Production Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Data Configuration
- [ ] Populate all 18 Google Sheets tabs with data
- [ ] Verify Commodity Analysis sheet has commodity list
- [ ] Test "⟳ Sheet Data" refresh button locally
- [ ] Confirm data appears correctly in all dashboard sections

### 2. Environment Variables
- [ ] `.env` file configured locally with:
  - `VITE_GOOGLE_SHEET_ID`
  - `VITE_GOOGLE_SHEETS_API_KEY`
- [ ] Google Sheet is set to "Anyone with the link - Viewer"
- [ ] API key has proper restrictions:
  - Restricted to Google Sheets API only
  - Allowed referrers: `https://rts-labs-f3981.web.app/*`
  - Allowed referrers: `http://localhost:5173/*` (for dev)

### 3. Test Locally
```bash
npm run dev
```
- [ ] All tabs load without errors
- [ ] Market ticker shows commodities (not NaN)
- [ ] Refresh buttons work independently
- [ ] Tactical Workspace shows operations with countdowns
- [ ] Executive Summary shows correct building counts
- [ ] Financials displays balance sheet and transactions
- [ ] Intelligence Desk shows economic phases
- [ ] Archives documentation displays

### 4. API Testing
- [ ] Market ticker auto-refreshes every hour
- [ ] Market data cached in localStorage
- [ ] Google Sheets data cached in localStorage
- [ ] No rate limit errors in console
- [ ] Both refresh buttons work independently

### 5. Build for Production
```bash
npm run build
```
- [ ] Build completes without errors
- [ ] Check `dist/` folder created
- [ ] Verify favicon copied to dist
- [ ] Check environment variables embedded in build

### 6. Firebase Deployment
```bash
firebase deploy --only hosting --project rts-labs-f3981
```
- [ ] Deployment completes successfully
- [ ] Visit https://rts-labs-f3981.web.app
- [ ] Verify all features work in production
- [ ] Check browser console for errors

## 🔧 Production Configuration

### Google Sheets API Key Restrictions
1. Go to Google Cloud Console > Credentials
2. Edit API Key
3. **Application restrictions**:
   - Type: HTTP referrers
   - Add: `https://rts-labs-f3981.web.app/*`
   - Add: `https://rts-labs-f3981.firebaseapp.com/*`
4. **API restrictions**:
   - Restrict key
   - Select: Google Sheets API

### Firebase Hosting Settings
File: `firebase.json`
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## 🚨 Known Issues & Fixes

### Issue: NaN in Market Ticker
**Fix**: Now filters by commodities in Commodity Analysis sheet and handles both object/number API responses

### Issue: Rate Limiting (429 errors)
**Fix**: 
- Google Sheets: Single batchGet call + localStorage cache
- Market Data: 1-hour cache + manual refresh button

### Issue: Data Not Updating
**Fix**: Two separate refresh buttons:
- "⟳ Market Prices" - Refreshes market ticker only
- "⟳ Sheet Data" - Refreshes all Google Sheets data

### Issue: Timezone Confusion
**Fix**: All countdown timers use EST. Input times in EST format in Google Sheets.

## 📊 Post-Deployment Monitoring

### Check These After Deployment:
1. **Browser Console** - No errors
2. **Network Tab** - Verify API calls:
   - `/api/realms/0/market/prices` - Should work via Vite proxy (dev only)
   - Google Sheets API - Should return 200 OK
3. **localStorage** - Check cached data exists:
   - `ccm_dashboard_data`
   - `market_data_cache`
4. **Performance**:
   - Page load < 2 seconds
   - Refresh < 3 seconds

## 🎯 Success Criteria

- [ ] Dashboard loads in < 2 seconds
- [ ] All 5 tabs display data correctly
- [ ] Market ticker shows filtered commodities
- [ ] Refresh buttons work independently
- [ ] No console errors
- [ ] Data persists across page refreshes (cache working)
- [ ] Countdown timers update in real-time
- [ ] Favicon displays (no 404 errors)

## 📝 Production URLs

- **Live Site**: https://rts-labs-f3981.web.app
- **Firebase Console**: https://console.firebase.google.com/project/rts-labs-f3981
- **Google Cloud**: https://console.cloud.google.com/apis/credentials
- **Repository**: https://github.com/pssnyder/ccm-executive-dashboard

## 🔄 Deployment Command (Final)

```bash
# 1. Build
npm run build

# 2. Deploy (ALWAYS use --project flag)
firebase deploy --only hosting --project rts-labs-f3981

# 3. Verify
# Visit: https://rts-labs-f3981.web.app
```

**CRITICAL**: Always use `--project rts-labs-f3981` to avoid deploying to wrong project!
