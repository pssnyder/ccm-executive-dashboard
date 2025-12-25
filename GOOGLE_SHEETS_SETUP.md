# Google Sheets Integration - Setup Guide

## Overview

The dashboard now fetches data directly from Google Sheets, eliminating the need for manual CSV exports and JSON updates. Your Google Sheet acts as a live database.

## Prerequisites

1. A Google Account
2. Your data organized in a Google Sheet with specific tab names
3. A Google Cloud Project with Sheets API enabled

---

## Step 1: Set Up Your Google Sheet

### Required Sheet Structure

Your Google Sheet must have the following tabs (exact names):

#### Historical Datasets (append new rows over time)
- `Balance Sheet Historical`
- `Cashflow Statement Historical`
- `Income Statement Historical`
- `Economic Phases Historical`
- `Government Orders Historical`
- `Random Events Historical`
- `Realm Data Historical`
- `Financial Ratios Historical`
- `CCM Overview Historical`

#### Current/Snapshot Datasets (overwrite/latest state)
- `Warehouse Current`
- `Buildings Current`
- `Company Levels Current`

### Column Headers

Each sheet's **first row** must contain column headers matching your CSV exports. For example:

**Balance Sheet Historical:**
```
Date, Timestamp, Cash, Accounts Receivable, Inventory Materials, Inventory Finished Goods, ...
```

**Warehouse Current:**
```
Resource, Quality, Amount, Total Value
```

The service automatically converts the first row to object keys.

---

## Step 2: Create Google Cloud Project & Enable Sheets API

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com/

2. **Create a new project** (or use existing)
   - Click "Select a project" → "New Project"
   - Name it: `CCM Dashboard` (or similar)
   - Click "Create"

3. **Enable Google Sheets API**
   - Go to: https://console.cloud.google.com/apis/library
   - Search for "Google Sheets API"
   - Click "Enable"

4. **Create API Key**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "+ CREATE CREDENTIALS" → "API key"
   - Copy the API key (you'll need this in Step 3)

5. **Restrict API Key (recommended for security)**
   - Click "Edit API key" (pencil icon)
   - Under "API restrictions":
     - Select "Restrict key"
     - Check only "Google Sheets API"
   - Under "Application restrictions":
     - Select "HTTP referrers (web sites)"
     - Add: `https://rts-labs-f3981.web.app/*` (your hosting URL)
     - Add: `http://localhost:5173/*` (for local development)
   - Click "Save"

---

## Step 3: Configure the Dashboard

1. **Get your Google Sheet ID**
   - Open your Google Sheet
   - Copy the ID from the URL:
     ```
     https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
     ```

2. **Make the Sheet publicly readable**
   - Click "Share" button in your Google Sheet
   - Change "General access" to "Anyone with the link" → "Viewer"
   - (This allows the API key to read it without OAuth)

3. **Create `.env` file in project root**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` and add your credentials:**
   ```
   VITE_GOOGLE_SHEET_ID=1abc123def456ghi789jkl...
   VITE_GOOGLE_SHEETS_API_KEY=AIzaSyAbc123Def456Ghi789...
   ```

---

## Step 4: Test Locally

1. **Restart the dev server**
   ```bash
   npm run dev
   ```

2. **Check the browser console**
   - You should see: `[GoogleSheetsService] Successfully fetched and structured data from Google Sheets`
   - If you see errors, verify:
     - Sheet ID is correct
     - API key is correct
     - Sheet tabs have exact names listed above
     - Sheet is set to "Anyone with the link can view"

---

## Step 5: Deploy to Production

1. **Build with environment variables**
   ```bash
   npm run build
   ```
   Vite will embed the `VITE_*` variables at build time.

2. **Deploy to Firebase**
   ```bash
   firebase deploy --only hosting --project rts-labs-f3981
   ```

3. **Verify production deployment**
   - Visit: https://rts-labs-f3981.web.app
   - Open browser console
   - Should see: `[GoogleSheetsService] Successfully fetched data from Google Sheets`

---

## Data Update Workflow

### For Historical Data (Balance Sheet, Income Statement, etc.)
1. Open your Google Sheet
2. Add a new row with today's data
3. Save (automatic in Sheets)
4. Refresh the dashboard → new data appears immediately

### For Current/Snapshot Data (Warehouse, Buildings)
1. Open your Google Sheet
2. Update the existing rows (or replace them)
3. Save
4. Refresh the dashboard → updated data appears

### For Manual Data (Operations, Long-term Goals)
- These are still managed in `analytical_layer/core_reporting.json` locally
- Update the JSON file, rebuild, and redeploy to update these sections
- (Future: could move these to Sheets too if desired)

---

## Fallback Behavior

The dashboard has a smart fallback cascade:

```
1. Try Google Sheets API
   ↓ (if fails)
2. Try local JSON file (/analytical_layer/core_reporting.json)
   ↓ (if fails)
3. Use embedded static data (built into the app at deploy time)
```

This ensures the dashboard always works, even if:
- Google Sheets API is down
- You hit rate limits (100 requests per 100 seconds)
- API key expires

---

## Rate Limits

Google Sheets API (with API key):
- **100 read requests per 100 seconds per user**
- For a dashboard refreshing every 30 minutes: **~200 reads/day = well within limits**

If you need more, consider:
- Using OAuth instead of API key (500 requests per 100 seconds)
- Caching results in localStorage with a TTL

---

## Troubleshooting

### "Failed to fetch [sheet name]"
- **Check**: Sheet tab name matches exactly (case-sensitive)
- **Check**: Sheet is set to "Anyone with the link can view"
- **Check**: API key has Sheets API enabled

### "Google Sheets credentials not configured"
- **Check**: `.env` file exists in project root
- **Check**: Variables start with `VITE_` prefix
- **Restart**: Dev server after creating/editing `.env`

### "403 Forbidden" error
- **Check**: API key restrictions allow your domain
- **Check**: Sheet sharing settings allow public read access

### Data appears stale/old
- **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
- **Check**: You're updating the correct sheet
- **Check**: Console for fallback messages (might be using static data)

---

## Advanced: Auto-refresh Data

To make the dashboard automatically refresh every 30 minutes (without page reload):

**Add to `src/App.jsx`:**
```javascript
useEffect(() => {
  // Fetch on mount
  fetchAppData().then(data => setAppData(data));
  
  // Refresh every 30 minutes
  const interval = setInterval(() => {
    fetchAppData().then(data => setAppData(data));
  }, 30 * 60 * 1000); // 30 minutes
  
  return () => clearInterval(interval);
}, []);
```

---

## Security Notes

- **API Key is exposed** in the client-side code (this is normal for public read-only data)
- **Mitigate risk** by:
  - Restricting API key to only Sheets API
  - Restricting API key to specific HTTP referrers (your domain)
  - Making only the necessary sheets public (not your entire Google Drive)
- **Never put sensitive data** in a publicly-readable Google Sheet

---

## Migration from CSV Workflow

**Old workflow:**
1. Export CSV from game/tools
2. Save to `raw_data/`
3. Ask AI to parse CSV and update `core_reporting.json`
4. Refresh dashboard

**New workflow:**
1. Copy data from game/tools
2. Paste directly into Google Sheet
3. Dashboard auto-updates on next load/refresh

**Time saved:** ~90% (no manual file management, no AI parsing step)
