# CCM Executive Dashboard

**Cassandra Capital Management** - Internal investment analysis and operations dashboard for Sim Companies gameplay.

![Dashboard Version](https://img.shields.io/badge/version-1.0-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange)

---

## Overview

A comprehensive executive dashboard for tracking financial performance, market intelligence, and retail arbitrage opportunities in Sim Companies. Combines manual data entry via Google Sheets with automated market data collection from the SimcoTools API.

### Key Features

- 📊 **Financial Statements** - Balance sheet, income statement, cash flow tracking
- 💰 **Cash Runway Analysis** - Real-time burn rate and runway calculations
- 📈 **Economic Intelligence** - Boom/recession cycle tracking and visualization
- 🏪 **Retail Arbitrage Scanner** - Market opportunity analysis with ROI calculations
- 📦 **Warehouse Management** - Inventory tracking and valuation
- 🎯 **Strategic Planning** - Long-term goal tracking with cost projections

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file in project root:

```env
# Google Sheets API
VITE_GOOGLE_SHEET_ID=your_sheet_id_here
VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here

# Firebase Authentication & Hosting
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run Development Server
```bash
npm run dev
```

Dashboard available at: `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
firebase deploy --only hosting
```

---

## Documentation

### 📚 Core Guides

- **[Data Pipeline Documentation](docs/DATA_PIPELINE.md)** - Complete data flow architecture, Google Sheets integration, API scripts
- **[Component Guide](docs/COMPONENT_GUIDE.md)** - Component architecture, data usage patterns, styling system
- **[Quick Reference](docs/QUICK_REFERENCE.md)** - Common tasks, formulas, troubleshooting cheat sheet

### 🎯 What Each Guide Covers

#### Data Pipeline Documentation
- Google Sheets API integration and batch fetching
- PowerShell scripts for market data download
- Data transformation and caching strategies
- CSV import workflows
- Complete sheet structure reference

#### Component Guide
- Component hierarchy and data flow
- Each tab's functionality and calculations
- Styling system and design tokens
- Performance best practices
- Development checklist

#### Quick Reference
- Copy-paste commands for common tasks
- Data source mappings
- Formulas (cash runway, ROI calculations)
- File location reference
- Troubleshooting quick fixes

---

## Architecture

### Tech Stack

**Frontend**:
- React 18 (Vite build tool)
- Tailwind CSS (styling)
- Recharts (data visualization)
- Firebase Authentication

**Backend**:
- Google Sheets API (primary data source)
- Firebase Hosting (deployment)
- SimcoTools API (market data via PowerShell)

**Data Flow**:
```
Google Sheets (Manual Entry)
    ↓
googleSheetsService.js (Batch API fetch)
    ↓
localStorage (Caching)
    ↓
React Components (Display)


SimcoTools API
    ↓
PowerShell Scripts (download-*.ps1)
    ↓
CSV Files (raw_data/misc/)
    ↓
Manual Import → Google Sheets
```

### Project Structure

```
ccm-executive-dashboard/
├── src/
│   ├── App.jsx                      # Main app, routing, data orchestration
│   ├── components/
│   │   ├── ExecutiveSummary.jsx     # Strategic overview (tab: exec)
│   │   ├── IntelligenceDesk.jsx     # Market intelligence (tab: intel)
│   │   ├── RaidVault.jsx            # Warehouse inventory (tab: vault)
│   │   ├── Financials.jsx           # Financial statements (tab: bench)
│   │   ├── TradeAnalysis.jsx        # Retail opportunities (tab: trade)
│   │   └── ...                      # Navigation, Header, Footer
│   ├── services/
│   │   └── googleSheetsService.js   # Google Sheets API integration
│   └── contexts/
│       └── AuthContext.jsx          # Firebase authentication
│
├── scripts/                          # PowerShell API downloaders
│   ├── download-prices.ps1          # Market exchange prices
│   ├── download-resources.ps1       # Resource metadata
│   └── download-retail-data.ps1     # Retail economics data
│
├── raw_data/
│   ├── Sim Companies SoT - *.csv    # Google Sheets manual exports
│   └── misc/                        # API downloaded CSVs
│
├── docs/                            # Documentation
│   ├── DATA_PIPELINE.md
│   ├── COMPONENT_GUIDE.md
│   └── QUICK_REFERENCE.md
│
├── public/                          # Static assets
├── dist/                            # Production build output
└── .env                             # Environment configuration
```

---

## Data Sources

### Google Sheets (Primary)

**Historical Datasets** (Transposed format - dates as columns):
- Balance Sheet Historical
- Income Statement Historical
- Cashflow Statement Historical
- Economic Phases Historical
- Government Orders Historical
- Financial Ratios Historical
- CCM Overview Historical

**Current Datasets** (Standard format - rows as records):
- Active Operations Current
- Warehouse Current
- Retail Research
- Strategic Goals Current
- Transaction History

### SimcoTools API (Market Data)

**Endpoints**:
- `/realms/{realm}/market/prices` - Current exchange prices
- `/realms/{realm}/resources` - Resource metadata, production rates
- `/realms/{realm}/resources` (retail filter) - Retail economics

**Access Method**: PowerShell scripts (bypasses CORS restrictions)

**Realms**:
- 0 = Earth (R1)
- 1 = Titan (R2)
- 2 = Ares (R3)

---

## Dashboard Tabs

### 🔹 Executive Summary (`exec`)
Strategic overview with firm philosophy, medium-term strategy, and building capacity analysis.

**Key Metrics**:
- Open building slots
- Strategic deployment capacity

### 🔹 Intelligence Desk (`intel`)
Market intelligence and economic tracking.

**Features**:
- Economic phase visualization (Boom/Recession cycles)
- Government contract history
- Random event timeline
- Economic cycle chart

### 🔹 Raid Vault (`vault`)
Warehouse inventory management.

**Data**:
- Resource name, quality, quantity
- Total value, value per unit
- Warehouse total value

### 🔹 Financials (`bench`)
Complete financial analysis and statements.

**Sections**:
- Cash runway analysis (burn rate, days remaining)
- Financial overview cards
- Balance sheet (assets & equity)
- Financial ratios (ROE, ROA, margins, turnover)
- Recent transactions

### 🔹 Trade Analysis (`trade`)
Retail market opportunities and active operations.

**Features**:
- Active retail operations cards
- Top 20 retail opportunities table (sorted by revenue)
- Market summary statistics
- ROI% color coding (>50% green, 20-50% yellow, <20% gray)

### 🔹 Archives (`arch`)
Historical data archives (future expansion).

---

## Development Workflow

### Daily Updates (5 minutes)
1. Update Google Sheets:
   - Active Operations Current (buildings, production)
   - Warehouse Current (inventory export)
2. Click "Refresh Data" in dashboard

### Weekly Updates (15 minutes)
1. Add date columns to historical sheets
2. Export financial statements from game
3. Update Google Sheets balance sheet, income, cashflow
4. (Optional) Run PowerShell scripts for market data

### Monthly Analysis (30 minutes)
1. Download latest market data (PowerShell scripts)
2. Import to Retail Research sheet
3. Review strategic goals progress
4. Backup Google Sheets

---

## API Data Collection

### Download Market Data
```powershell
cd scripts

# Download current market prices (~1,100 rows)
.\download-prices.ps1 -Realm "0"

# Download resource metadata (~150 resources)
.\download-resources.ps1 -Realm "0"

# Download retail data (~78 retail products)
.\download-retail-data.ps1 -Realm "0"
```

**Output Location**: `raw_data/misc/market-prices-{timestamp}.csv`

### Import to Google Sheets
1. Open generated CSV file
2. Google Sheets → File → Import → Upload
3. Import location: Create new sheet
4. Copy relevant columns to target sheets (Retail Research)

---

## Key Calculations

### Cash Runway
```javascript
Hourly Burn = Company Overview → Admin Overhead ($/hr)
Current Cash = Balance Sheet → Cash
Runway Days = (Current Cash ÷ Hourly Burn) ÷ 24

Status Thresholds:
  > 7 days = Healthy (Green)
  3-7 days = Warning (Yellow)
  < 3 days = Critical (Red)
```

### Retail ROI
```javascript
Buy Price = Market Price (exchange)
Transport Cost = Transport commodity market price
Total Cost = Buy Price + Transport

Sell Price = Retail Research → Retail Price
Margin = Sell Price - Total Cost
ROI % = (Margin ÷ Total Cost) × 100

Daily Revenue = Margin × Sales Per Hour × 24
```

### Building Capacity
```javascript
Total Slots = Max Buildings + Bonus Buildings
Open Slots = Total Slots - Current Buildings Owned
```

---

## Troubleshooting

### Dashboard shows "No data available"
1. Open browser console (F12) → Check for errors
2. Verify Google Sheets tab names match `googleSheetsService.js` constants
3. Clear cache: Run in console → `localStorage.clear()`
4. Refresh page

### Google Sheets API errors
1. Check `.env` has correct `VITE_GOOGLE_SHEET_ID` and `VITE_GOOGLE_SHEETS_API_KEY`
2. Verify Google Sheets API enabled in Google Cloud Console
3. Confirm sheet sharing permissions (public or API key access)

### PowerShell script errors
1. Enable script execution: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
2. Verify API endpoint reachable: https://api.simcotools.com/v1/
3. Check realm parameter (0=Earth, 1=Titan, 2=Ares)

### Stale data displayed
1. Click "Refresh Data" button in dashboard header
2. Check "Last updated" timestamp
3. Verify Google Sheets has latest entries (check sheet last modified time)

---

## Configuration

### Google Sheets Setup

1. **Create Google Cloud Project**:
   - Go to https://console.cloud.google.com
   - Create new project
   - Enable "Google Sheets API"

2. **Generate API Key**:
   - APIs & Services → Credentials
   - Create Credentials → API Key
   - Restrict key to Google Sheets API

3. **Share Google Sheet**:
   - Open your Google Sheet
   - Share → Anyone with link can view
   - Copy Sheet ID from URL

4. **Create Required Tabs**:
   - See `docs/DATA_PIPELINE.md` for complete sheet structure
   - Match tab names exactly to `SHEETS` constant in `googleSheetsService.js`

### Firebase Setup

1. **Create Firebase Project**:
   - Go to https://console.firebase.google.com
   - Add project
   - Enable Authentication (Email/Password)

2. **Register Web App**:
   - Project Settings → Add app → Web
   - Copy config values to `.env`

3. **Deploy**:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   npm run build
   firebase deploy --only hosting
   ```

---

## Performance

### Bundle Size
- Production build: ~548 KB (gzipped: ~165 KB)
- Main dependencies: React, Recharts, Tailwind

### Load Time
- Initial load: ~1-2 seconds (with cache)
- Data refresh: ~500ms (batch API call)

### Caching Strategy
- Google Sheets data cached in localStorage
- Cache persists across sessions
- Manual refresh required for updates

---

## Future Enhancements

### Planned Features
- [ ] Automated CSV → Google Sheets import (Google Apps Script)
- [ ] Real-time API integration (CORS proxy server)
- [ ] Historical trend analysis charts
- [ ] Portfolio optimization calculator
- [ ] Economic phase prediction model
- [ ] Mobile-responsive design improvements

### Technical Improvements
- [ ] TypeScript migration
- [ ] Data validation layer
- [ ] Unit test coverage
- [ ] Code splitting for faster loads
- [ ] Error boundary components

---

## Contributing

This is an internal tool for Cassandra Capital Management. For questions or improvements:

1. Review relevant documentation in `docs/`
2. Check browser console for errors
3. Verify data integrity in Google Sheets
4. Test changes locally before deploying

---

## License

Internal use only - Cassandra Capital Management  
Not for public distribution

---

## Support

**Documentation**:
- [Data Pipeline Guide](docs/DATA_PIPELINE.md)
- [Component Reference](docs/COMPONENT_GUIDE.md)
- [Quick Reference](docs/QUICK_REFERENCE.md)

**Resources**:
- SimcoTools API: https://api.simcotools.com/docs
- Sim Companies Wiki: https://simcompanies.com/wiki/
- Google Sheets API: https://developers.google.com/sheets/api

---

**Version**: 1.0  
**Last Updated**: December 28, 2024  
**Maintainer**: Cassandra Capital Management
