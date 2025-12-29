# CCM Dashboard - Quick Reference

## Common Tasks

### Update Dashboard Data
```bash
# 1. Update Google Sheets with latest game data
# 2. Click "Refresh Data" button in dashboard header
# 3. Wait for green success message
```

### Download Market Data
```powershell
cd "S:\Programming\Gaming Projects\Sim Companies Project\ccm-executive-dashboard\scripts"

# Download all market data
.\download-prices.ps1
.\download-resources.ps1
.\download-retail-data.ps1

# Output files in: raw_data/misc/
```

### Import API Data to Google Sheets
```
1. Run PowerShell scripts (above)
2. Open generated CSV in raw_data/misc/
3. Google Sheets → File → Import → Upload
4. Select CSV → Create new sheet
5. Copy relevant columns to target sheets
```

---

## Data Sources Quick Reference

| Component | Data Sources | Key Metrics |
|-----------|--------------|-------------|
| Executive Summary | company_overview, operations, current_buildings | Open building slots |
| Intelligence Desk | economic_phases, government_orders, random_events | Economic cycle, contracts |
| Raid Vault | inventory | Warehouse value, stock levels |
| Financials | balance_sheet, financial_ratios, transactions | Cash runway, ROE/ROA, margins |
| Trade Analysis | commodity_analysis, operations.short_term | Active stores, retail ROI |

---

## Google Sheets → Dashboard Mapping

### Historical Sheets (Transposed)
- Balance Sheet Historical → `balance_sheet_history`
- Income Statement Historical → `income_statement_history`
- Cashflow Statement Historical → `cashflow_history`
- Financial Ratios Historical → `financial_ratios`
- CCM Overview Historical → `company_overview`
- Economic Phases Historical → `economic_phases`

### Current Sheets (Standard)
- Active Operations Current → `operations.short_term`
- Warehouse Current → `inventory`
- Retail Research → `commodity_analysis`
- Transaction History → `transaction_summary.recent_transactions`
- Strategic Goals Current → `operations.long_term_goals`

---

## Cash Runway Formula

```javascript
Hourly Burn Rate = Company Overview → Admin Overhead
Daily Burn = Hourly Burn × 24
Current Cash = Balance Sheet → Cash

Runway Days = Current Cash ÷ Hourly Burn ÷ 24

Status:
  > 7 days = Healthy (Green)
  3-7 days = Warning (Yellow)
  < 3 days = Critical (Red)
```

---

## Retail ROI Calculation

```javascript
Buy Price = Market Price (exchange)
Transport = Transport commodity market price
Total Cost = Buy Price + Transport

Sell Price = Retail Research → Retail Price
Margin = Sell Price - Total Cost
ROI % = (Margin ÷ Total Cost) × 100

Daily Revenue = Margin × Sales Per Hour × 24
```

---

## File Locations

### Source Code
```
src/
├── App.jsx                      # Main app, data loading
├── components/
│   ├── ExecutiveSummary.jsx     # Tab: exec
│   ├── IntelligenceDesk.jsx     # Tab: intel
│   ├── RaidVault.jsx            # Tab: vault
│   ├── Financials.jsx           # Tab: bench
│   ├── TradeAnalysis.jsx        # Tab: trade
│   └── Navigation.jsx           # Tab switcher
└── services/
    └── googleSheetsService.js   # API fetching
```

### PowerShell Scripts
```
scripts/
├── download-prices.ps1          # Market exchange prices
├── download-resources.ps1       # Resource metadata
└── download-retail-data.ps1     # Retail economics
```

### Data Storage
```
raw_data/
├── Sim Companies SoT - *.csv    # Google Sheets exports
└── misc/
    └── market-prices-*.csv      # API downloads
```

---

## Troubleshooting

### Dashboard shows "No data"
1. Check browser console (F12) for errors
2. Verify Google Sheets tab names match code
3. Clear cache: `localStorage.clear()` in console
4. Refresh page

### Google Sheets API error
1. Check .env file has correct SHEET_ID and API_KEY
2. Verify Sheets API enabled in Google Cloud
3. Check sheet is publicly readable (or API key has access)

### PowerShell script fails
1. Enable execution: `Set-ExecutionPolicy RemoteSigned`
2. Check API endpoint: https://api.simcotools.com/v1/
3. Verify realm parameter (0=Earth, 1=Titan, 2=Ares)

### Stale data displayed
1. Click "Refresh Data" button in header
2. Check "Last updated" timestamp
3. Verify Google Sheets has latest entries

---

## Environment Setup

### Required
- Node.js 18+
- Google Cloud Project with Sheets API enabled
- Google Sheet with correct tab structure
- PowerShell 5.1+ (Windows)

### .env Configuration
```env
VITE_GOOGLE_SHEET_ID=your_sheet_id_from_url
VITE_GOOGLE_SHEETS_API_KEY=your_api_key_from_cloud_console
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Firebase
firebase deploy --only hosting
```

---

## Data Entry Checklist

### Daily (5 minutes)
- [ ] Update Active Operations Current (buildings, products, quantities)
- [ ] Update Warehouse Current (inventory from game export)
- [ ] Click "Refresh Data" in dashboard

### Weekly (15 minutes)
- [ ] Add new date column to Balance Sheet Historical
- [ ] Add new date column to Income Statement Historical
- [ ] Add new date column to Cashflow Statement Historical
- [ ] Export financial statements from game
- [ ] Update Retail Research prices (optional - from API CSVs)

### Monthly (30 minutes)
- [ ] Run all PowerShell scripts to download latest market data
- [ ] Import retail data to Retail Research sheet
- [ ] Review Strategic Goals progress
- [ ] Update Strategy Notes
- [ ] Backup Google Sheets as Excel file

---

## API Rate Limits

**Google Sheets API**:
- 100 requests per 100 seconds per user
- Dashboard uses 1 batch request (all sheets)
- Cache prevents excessive calls

**SimcoTools API**:
- 2 requests per second
- Scripts include `Start-Sleep -Seconds 2` delays
- Total download time: ~3-4 minutes for all data

---

## Support Resources

1. **DATA_PIPELINE.md** - Detailed data flow documentation
2. **COMPONENT_GUIDE.md** - Component architecture and API
3. **Google Sheets Template** - Request access if needed
4. **SimcoTools API Docs** - https://api.simcotools.com/docs

---

**Last Updated**: December 28, 2024  
**Dashboard Version**: 1.0
