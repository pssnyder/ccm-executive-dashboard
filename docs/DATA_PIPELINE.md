# CCM Executive Dashboard - Data Pipeline Documentation

## Overview
The CCM Executive Dashboard uses a **dual-source data architecture**:
1. **Google Sheets API** - Primary source for financial, operational, and strategic data (manual entry)
2. **SimcoTools API** - Market intelligence data (automated PowerShell scripts)

This hybrid approach allows:
- Manual tracking of company-specific metrics via Google Sheets
- Automated market/retail data collection without CORS restrictions
- Offline data analysis and CSV exports for strategy planning

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          DATA SOURCES                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────┐      ┌──────────────────────────────┐ │
│  │   Google Sheets         │      │   SimcoTools API             │ │
│  │   (Manual Entry)        │      │   (Automated Scripts)        │ │
│  │                         │      │                              │ │
│  │  • Balance Sheet        │      │  • Market Prices (/prices)   │ │
│  │  • Income Statement     │      │  • Resources (/resources)    │ │
│  │  • Cash Flow            │      │  • Retail Data (retailInfo)  │ │
│  │  • Active Operations    │      │                              │ │
│  │  • Strategic Goals      │      │  Realm 0 (Earth / R1)        │ │
│  │  • Retail Research      │      │  Rate Limit: 2 req/sec       │ │
│  └─────────────────────────┘      └──────────────────────────────┘ │
│           │                                  │                       │
│           │                                  │                       │
└───────────┼──────────────────────────────────┼───────────────────────┘
            │                                  │
            │                                  │
            ▼                                  ▼
  ┌──────────────────────┐          ┌────────────────────────┐
  │ googleSheetsService  │          │  PowerShell Scripts    │
  │                      │          │                        │
  │ • Batch API fetch    │          │ • download-prices.ps1  │
  │ • Data transformation│          │ • download-resources.ps1│
  │ • localStorage cache │          │ • download-retail-data.ps1│
  └──────────────────────┘          └────────────────────────┘
            │                                  │
            │                                  │
            ▼                                  ▼
  ┌──────────────────────┐          ┌────────────────────────┐
  │  React Components    │          │   CSV Files            │
  │                      │          │   (raw_data/misc/)     │
  │ • ExecutiveSummary   │          │                        │
  │ • Financials         │          │ Used for:              │
  │ • IntelligenceDesk   │          │ • Historical analysis  │
  │ • TradeAnalysis      │          │ • Offline planning     │
  │ • RaidVault          │          │ • External tools       │
  └──────────────────────┘          └────────────────────────┘
```

---

## Google Sheets Integration

### Configuration
**File**: `src/services/googleSheetsService.js`

```javascript
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
```

**Environment Variables** (`.env`):
```
VITE_GOOGLE_SHEET_ID=your_sheet_id_here
VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
```

### Sheet Structure

#### Historical Datasets (Time-Series)
These sheets have **dates as column headers** with data growing horizontally (transposed).

| Sheet Name | Tab Name in Google Sheets | Purpose |
|------------|---------------------------|---------|
| BALANCE_SHEET | Balance Sheet Historical | Assets, liabilities, equity over time |
| INCOME | Income Statement Historical | Revenue, expenses, net income by period |
| CASHFLOW | Cashflow Statement Historical | Cash inflows/outflows by period |
| ECONOMIC_PHASES | Economic Phases Historical | Game economy boom/recession cycles |
| GOVERNMENT_ORDERS | Government Orders Historical | Contract history from government |
| RANDOM_EVENTS | Random Events Historical | Game events affecting operations |
| FINANCIAL_RATIOS | Financial Ratios Historical | ROE, ROA, margins, turnover ratios |
| CCM_OVERVIEW | CCM Overview Historical | Company value, buildings, max capacity |

**Transposed Format Example**:
```
Metric          | 2024-12-01 | 2024-12-02 | 2024-12-03
----------------|------------|------------|------------
Cash            | 45000      | 48200      | 51300
Total Assets    | 125000     | 128000     | 132000
Revenue         | 12000      | 13500      | 14200
```

#### Current/Snapshot Datasets
These sheets have **rows as records** with column headers (traditional format).

| Sheet Name | Tab Name in Google Sheets | Purpose |
|------------|---------------------------|---------|
| ACTIVE_OPERATIONS | Active Operations Current | Buildings currently running production/retail |
| WAREHOUSE | Warehouse Current | Inventory: resource, quality, quantity, value |
| STRATEGIC_GOALS | Strategic Goals Current | Long-term objectives with costs/requirements |
| STRATEGY_NOTES | Strategy Notes Current | Medium-term strategy notes |
| TRANSACTION_HISTORY | Transaction History | Recent financial transactions |
| RETAIL_RESEARCH | Retail Research | Market analysis for retail arbitrage |

**Standard Format Example**:
```
Building        | Type   | Level | Product | Quantity
----------------|--------|-------|---------|----------
Grocery Store   | RETAIL | 1     | Oranges | 1686
Grocery Store   | RETAIL | 1     | Grapes  | 1484
```

### Data Fetching Process

#### 1. Batch API Call
The service uses **ONE API call** to fetch all sheets simultaneously:

```javascript
// File: googleSheetsService.js

async function fetchAllSheets() {
  const ranges = Object.values(SHEETS).map(sheetName => encodeURIComponent(sheetName));
  const rangesParam = ranges.join('&ranges=');
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchGet?ranges=${rangesParam}&key=${API_KEY}`;
  
  const response = await fetchWithRetry(url);
  const data = await response.json();
  
  // Convert to map: sheet name -> parsed data
  const sheetsData = {};
  data.valueRanges.forEach((range, index) => {
    const sheetName = Object.values(SHEETS)[index];
    
    // Special handling for transposed sheets
    if (sheetName === SHEETS.FINANCIAL_RATIOS || sheetName === SHEETS.CCM_OVERVIEW) {
      sheetsData[sheetName] = transposedSheetsToObjects(range.values);
    } else {
      sheetsData[sheetName] = sheetsToObjects(range.values);
    }
  });
  
  return sheetsData;
}
```

**Why Batch API?**
- Reduces API quota usage (1 call vs. 15+ calls)
- Faster loading (parallel fetching by Google)
- Atomic updates (all data from same timestamp)

#### 2. Data Transformation
Raw Google Sheets data is transformed into structured objects:

```javascript
// Standard format: rows as records
function sheetsToObjects(values) {
  const headers = values[0];        // First row = column names
  const rows = values.slice(1);     // Remaining rows = data
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
}

// Transposed format: dates as columns
function transposedSheetsToObjects(values) {
  const metrics = values.map(row => row[0]);        // First column = metric names
  const dates = values[0].slice(1);                 // First row (skip label) = dates
  
  return dates.map((date, colIndex) => {
    const obj = { date: date };
    metrics.forEach((metric, rowIndex) => {
      if (rowIndex > 0) {  // Skip header row
        obj[metric] = values[rowIndex][colIndex + 1] || '';
      }
    });
    return obj;
  });
}
```

#### 3. LocalStorage Caching
Fetched data is cached to reduce API calls during user session:

```javascript
const CACHE_KEY = 'ccm_dashboard_data';
const CACHE_TIMESTAMP_KEY = 'ccm_dashboard_data_timestamp';

// Cache data after successful fetch
localStorage.setItem(CACHE_KEY, JSON.stringify(structuredData));
localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

// Load cached data on app start
function loadCachedData() {
  const cached = localStorage.getItem(CACHE_KEY);
  const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  
  if (cached && timestamp) {
    const age = Date.now() - parseInt(timestamp);
    const ageMinutes = Math.floor(age / 60000);
    console.log(`Loaded cached data (${ageMinutes} minutes old)`);
    return JSON.parse(cached);
  }
  return null;
}
```

**Cache Strategy**:
- Data cached indefinitely until manual refresh
- Stale cache used as fallback on API errors
- Users manually refresh via UI to get latest data

#### 4. Error Handling & Retry Logic

```javascript
async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      
      if (response.status === 429 && i < retries - 1) {
        // Rate limited - exponential backoff
        const waitTime = delay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      // Retry with exponential backoff
      const waitTime = delay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}
```

---

## SimcoTools API Scripts

### Why PowerShell Scripts?
The SimcoTools API has **CORS restrictions** that prevent direct browser calls. PowerShell scripts bypass this by:
1. Running server-side (no CORS enforcement)
2. Outputting CSV files for manual Google Sheets import
3. Allowing offline analysis without API rate limits

### Available Scripts

#### 1. Market Prices Downloader
**File**: `scripts/download-prices.ps1`

**Purpose**: Downloads current market exchange prices for all resources across all quality levels.

**Usage**:
```powershell
.\download-prices.ps1 -Realm "0" -OutputFile "market-prices.csv"
```

**Parameters**:
- `Realm` - Game realm (0=Earth/R1, 1=Titan/R2, 2=Ares/R3)
- `OutputFile` - Output CSV filename (defaults to timestamped file)

**API Endpoint**: `GET /realms/{realm}/market/prices`

**Output Schema**:
```csv
resourceId,quality,price,datetime
1,0,0.27,2024-12-28T10:24:00Z
1,1,0.28,2024-12-28T10:24:00Z
6,0,0.71,2024-12-28T10:24:00Z
```

**Data Volume**: ~1,100 rows (150 resources × 7-8 quality levels average)

#### 2. Resources Metadata Downloader
**File**: `scripts/download-resources.ps1`

**Purpose**: Downloads resource definitions with production rates, wages, retail availability.

**Usage**:
```powershell
.\download-resources.ps1 -Realm "0" -OutputFile "resources.csv"
```

**API Endpoint**: `GET /realms/{realm}/resources?page={page}&pageSize=50`

**Pagination**:
- Page size: 50 resources per page
- Rate limit: 2 requests/second (enforced with `Start-Sleep -Seconds 2`)
- Total pages: 3 (150 total resources)

**Output Schema**:
```csv
ResourceId,Name,Transportation,ProductionWagesPerHour,ProducedUnitsPerHour,HasRetail,IsResearch
1,Power,0,0,150,No,No
13,Transport,0,0,0,No,No
121,Oranges,0.39,0,90,Yes,No
```

**Key Fields**:
- `ProductionWagesPerHour` - Worker cost per hour to produce
- `ProducedUnitsPerHour` - Output rate per building
- `HasRetail` - Whether resource can be sold retail
- `Transportation` - Shipping cost per unit

#### 3. Retail Data Downloader
**File**: `scripts/download-retail-data.ps1`

**Purpose**: Extracts retail-specific economics (sales rate, margins, building requirements).

**Usage**:
```powershell
.\download-retail-data.ps1 -Realm "0" -OutputFile "retail-data.csv"
```

**API Endpoint**: `GET /realms/{realm}/resources` (filters resources with `retailInfo`)

**String Parsing**:
The retail data comes as nested string fields requiring regex extraction:

```powershell
foreach ($retail in $resource.retailInfo) {
    if ($retail -match 'quality=(\d+)') { $quality = $matches[1] }
    if ($retail -match 'averagePrice=([\d.]+)') { $avgPrice = $matches[1] }
    if ($retail -match 'salesWages=([\d.]+)') { $salesWages = $matches[1] }
    if ($retail -match 'modeledUnitsSoldAnHour=([\d.]+)') { $unitsSold = $matches[1] }
    if ($retail -match 'modeledProductionCostPerUnit=([\d.]+)') { $prodCost = $matches[1] }
    if ($retail -match 'buildingLevelsNeededPerUnitPerHour=([\d.]+)') { $buildingLevels = $matches[1] }
}
```

**Output Schema**:
```csv
ResourceId,Name,Quality,AverageRetailPrice,SalesWagesPerHour,UnitsSoldPerHour,ProductionCostPerUnit,BuildingLevelsNeeded,ProductionWagesPerHour,ProductionUnitsPerHour,Transportation
121,Oranges,0,7.51,1.20,90,0,0,0,90,0.39
122,Grapes,0,8.53,1.20,80,0,0,0,80,0.39
144,Petrol,0,11.57,1.50,103,0,0,0,180,0.39
```

**Key Retail Metrics**:
- `AverageRetailPrice` - Current market retail price
- `UnitsSoldPerHour` - Sales velocity (critical for revenue calculations)
- `SalesWagesPerHour` - Retail worker cost
- `ProductionCostPerUnit` - Manufacturing cost if produced
- `BuildingLevelsNeeded` - Building capacity required per unit/hour

**Data Volume**: ~78 retail products

---

## Data Usage in Components

### ExecutiveSummary
**Data Sources**:
- `company_overview` - Company value, max buildings
- `operations.medium_term_strategy` - Strategic notes
- `current_buildings_owned` - Calculate open building slots

**Calculations**:
```javascript
const maxBuildings = parseInt(companyOverview.max_buildings.split(' + ')[0]);
const bonusBuildings = parseInt(companyOverview.max_buildings.split(' + ')[1]);
const totalSlots = maxBuildings + bonusBuildings;
const openSlots = totalSlots - currentBuildings.length;
```

### Financials
**Data Sources**:
- `balance_sheet` - Assets, liabilities, equity (current snapshot)
- `company_overview` - Company value, buildings value
- `financial_ratios` - ROE, ROA, margins, turnover
- `transaction_summary` - Recent transactions

**Key Feature**: Cash Runway Analysis
```javascript
const hourlyBurn = parseFloat(companyOverview.admin_overhead);  // $/hr burn rate
const currentCash = balanceSheet.cash;
const runwayHours = currentCash / hourlyBurn;
const runwayDays = runwayHours / 24;
```

### IntelligenceDesk
**Data Sources**:
- `economic_phases` - Boom/recession cycles
- `government_orders` - Contract history
- `random_events` - Game events
- `realm_data` - Server statistics

**Features**:
- Economic phase visualization (LineChart)
- Recent contracts (last 30 days)
- Event timeline

### TradeAnalysis
**Data Sources**:
- `commodity_analysis` (from Retail Research sheet)
- `operations.short_term` (Active Operations)

**Features**:
- Active retail operations display
- Top 20 retail opportunities sorted by revenue
- Market summary stats

**Retail Opportunity Calculation**:
```javascript
const retailOpportunities = commodityAnalysis
  .filter(c => c.revenue_per_unit > 0)
  .sort((a, b) => b.revenue_per_unit - a.revenue_per_unit)
  .slice(0, 20);
```

### RaidVault
**Data Sources**:
- `inventory` - Warehouse stock

**Display**:
- Resource name, quality, quantity, value
- Total warehouse value
- Value per unit calculations

---

## Manual Data Entry Workflow

### Daily Operations Update
1. **Active Operations** (Google Sheets → `Active Operations Current`):
   - Update building status, products, quantities
   - Mark completed operations
   - Add new production queues

2. **Warehouse** (Google Sheets → `Warehouse Current`):
   - Export inventory from game
   - Update resource quantities, qualities, values

3. **Transactions** (Google Sheets → `Transaction History`):
   - Log major transactions (building purchases, large sales)
   - Categorize as Revenue/Expense

### Weekly Financial Updates
1. **Balance Sheet** (Google Sheets → `Balance Sheet Historical`):
   - Add new date column
   - Export balance sheet from game
   - Enter assets, liabilities, equity

2. **Income Statement** (Google Sheets → `Income Statement Historical`):
   - Add new date column
   - Enter revenue, COGS, expenses, net income

3. **Cash Flow** (Google Sheets → `Cashflow Statement Historical`):
   - Add new date column
   - Enter operating, investing, financing cash flows

### Strategic Planning
1. **Strategic Goals** (Google Sheets → `Strategic Goals Current`):
   - Define long-term objectives
   - Calculate total costs with inflation
   - Track completion status

2. **Retail Research** (Google Sheets → `Retail Research`):
   - Update market prices from downloaded CSVs
   - Calculate projected revenue (Retail Price - Market Price - Transport) × Sales Per Hour
   - Prioritize opportunities (High/Medium/Low)

---

## CSV Import Process (API Data → Google Sheets)

### 1. Download Latest Market Data
```powershell
# Run from scripts directory
cd "S:\Programming\Gaming Projects\Sim Companies Project\ccm-executive-dashboard\scripts"

.\download-prices.ps1
.\download-resources.ps1
.\download-retail-data.ps1
```

**Output Location**: `raw_data/misc/` (timestamped files)

### 2. Import to Google Sheets

#### Method A: Direct Import
1. Open Google Sheet
2. File → Import → Upload
3. Select CSV file
4. Import location: Create new sheet
5. Separator: Comma
6. Convert text to numbers: Yes

#### Method B: Manual Copy-Paste
1. Open CSV in Excel/Google Sheets
2. Copy data range
3. Paste into target sheet
4. Preserve column headers

### 3. Update Retail Research
1. Open `retail-data-{timestamp}.csv`
2. Copy `AverageRetailPrice` column
3. Paste into `Retail Research → Retail Price` column
4. Copy `UnitsSoldPerHour` column
5. Paste into `Retail Research → Sales Per Hour` column
6. Formula recalculates `Projected Revenue Per Hour`:
   ```
   = (Retail Price - Market Price - Transport) * Sales Per Hour
   ```

### 4. Verify Data Consistency
- Check for missing values (N/A or blanks)
- Verify numeric formatting (no text strings)
- Confirm date formats (YYYY-MM-DD)

---

## Common Issues & Troubleshooting

### Google Sheets API

#### Issue: 403 Forbidden
**Cause**: API key invalid or Sheets API not enabled  
**Fix**:
1. Go to Google Cloud Console
2. Enable "Google Sheets API"
3. Regenerate API key if needed
4. Update `.env` file

#### Issue: 429 Rate Limit
**Cause**: Too many API requests  
**Fix**: Service automatically retries with exponential backoff. If persistent:
1. Check for infinite refresh loops in code
2. Increase cache duration
3. Reduce manual refresh clicks

#### Issue: Transposed Data Incorrect
**Cause**: Wrong parser used for sheet  
**Fix**: Verify sheet added to transposed list:
```javascript
if (sheetName === SHEETS.FINANCIAL_RATIOS || sheetName === SHEETS.CCM_OVERVIEW) {
  sheetsData[sheetName] = transposedSheetsToObjects(range.values);
}
```

### PowerShell Scripts

#### Issue: Script Execution Disabled
**Cause**: Windows PowerShell execution policy  
**Fix**:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

#### Issue: API Rate Limiting (429 errors)
**Cause**: Exceeding 2 requests/second  
**Fix**: Scripts already include `Start-Sleep -Seconds 2`. If still occurring:
- Increase sleep duration to 3 seconds
- Run during off-peak hours

#### Issue: Regex Parsing Failures
**Cause**: API response format changed  
**Fix**: Check raw API response:
```powershell
$data = Invoke-RestMethod -Uri "https://api.simcotools.com/v1/realms/0/resources?page=1"
$data.resources[0].retailInfo | Write-Host
```
Update regex patterns if format changed.

### Dashboard Display

#### Issue: Component Shows "No Data Available"
**Cause**: Missing or malformed Google Sheets data  
**Fix**:
1. Check browser console for errors
2. Verify sheet names match SHEETS constant
3. Confirm data exists in Google Sheets
4. Clear localStorage and refresh

#### Issue: Stale Data Displayed
**Cause**: LocalStorage cache not refreshed  
**Fix**:
1. Click "Refresh Data" in dashboard UI
2. Or manually clear: `localStorage.clear()`

---

## Best Practices

### Data Entry
1. **Consistency**: Always use same date format (YYYY-MM-DD)
2. **Validation**: Double-check numeric entries (no text in number columns)
3. **Backups**: Export Google Sheets weekly as Excel backup
4. **Comments**: Use Notes column for special cases/explanations

### API Data Collection
1. **Schedule**: Run PowerShell scripts weekly (or when needed for analysis)
2. **Archiving**: Keep timestamped CSVs in `raw_data/misc/` for historical reference
3. **Version Control**: Don't commit large CSV files to git (add to `.gitignore`)

### Performance
1. **Cache**: Let localStorage cache work (don't refresh unnecessarily)
2. **Batch Updates**: Update all Google Sheets data before refreshing dashboard
3. **Minimal Sheets**: Only include sheets actively used (remove unused tabs)

---

## Future Enhancements

### Planned Features
- [ ] Automated CSV import to Google Sheets (Google Apps Script)
- [ ] Real-time API integration (proxy server to bypass CORS)
- [ ] Historical trend analysis (comparative period charts)
- [ ] Portfolio diversification metrics (Sharpe ratio for retail mix)
- [ ] Predictive modeling (economic phase forecasting)

### Technical Debt
- [ ] Add TypeScript types for data structures
- [ ] Implement data validation layer
- [ ] Add unit tests for parsers
- [ ] Optimize bundle size (code splitting)
- [ ] Add error boundary components

---

## Support & Maintenance

**Last Updated**: December 28, 2024  
**Maintainer**: Cassandra Capital Management  
**Documentation Version**: 1.0  

For issues or questions, review this documentation first, then check:
1. Browser console for errors
2. Google Sheets data integrity
3. API script output logs
