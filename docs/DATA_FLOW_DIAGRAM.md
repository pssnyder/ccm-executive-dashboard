# CCM Dashboard - Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES & COLLECTION                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────┐          ┌────────────────────────────────┐
│   Sim Companies Game           │          │   SimcoTools API               │
│                                │          │   (https://api.simcotools.com) │
│  Manual Exports:               │          │                                │
│  • Balance Sheet               │          │  Endpoints:                    │
│  • Income Statement            │          │  • /realms/0/market/prices     │
│  • Cash Flow                   │          │  • /realms/0/resources         │
│  • Inventory (Warehouse)       │          │  • /realms/0/resources (retail)│
│  • Active Operations           │          │                                │
│  • Transactions                │          │  Rate Limit: 2 req/sec         │
└───────────┬────────────────────┘          └──────────┬─────────────────────┘
            │                                          │
            │ Manual Entry                             │ PowerShell Scripts
            ▼                                          ▼
┌────────────────────────────────┐          ┌────────────────────────────────┐
│   Google Sheets                │          │   PowerShell Scripts           │
│   (Central Data Repository)    │          │   (scripts/)                   │
│                                │          │                                │
│  Historical Tabs (Transposed): │          │  • download-prices.ps1         │
│  • Balance Sheet Historical    │          │  • download-resources.ps1      │
│  • Income Historical           │          │  • download-retail-data.ps1    │
│  • Cashflow Historical         │          │                                │
│  • Economic Phases             │          │  Output: CSV Files             │
│  • Financial Ratios            │          │  Location: raw_data/misc/      │
│  • Government Orders           │          │                                │
│  • Random Events               │          └──────────┬─────────────────────┘
│  • Realm Data                  │                     │
│  • CCM Overview                │                     │ Manual Import
│                                │                     ▼
│  Current Tabs (Standard):      │          ┌────────────────────────────────┐
│  • Active Operations Current   │◄─────────┤   CSV Files                    │
│  • Warehouse Current           │  Import  │   (raw_data/misc/)             │
│  • Retail Research             │          │                                │
│  • Strategic Goals             │          │  • market-prices-*.csv         │
│  • Strategy Notes              │          │  • resources-*.csv             │
│  • Transaction History         │          │  • retail-data-*.csv           │
│  • Company Levels              │          │                                │
└───────────┬────────────────────┘          │  Used for:                     │
            │                                │  • Historical analysis         │
            │                                │  • Offline planning            │
            │ Google Sheets API              │  • External tools              │
            │ (Batch Request)                └────────────────────────────────┘
            ▼
┌────────────────────────────────────────────────────────────────────────────┐
│   googleSheetsService.js                                                    │
│   (src/services/)                                                           │
│                                                                             │
│   Functions:                                                                │
│   ┌─────────────────────────────────────────────────────────────────────┐ │
│   │ fetchAllSheets()                                                     │ │
│   │ • Single batch API call for all sheets                              │ │
│   │ • URL: /values:batchGet?ranges={sheet1}&ranges={sheet2}&...         │ │
│   │ • Reduces API quota usage (1 call vs. 15+ calls)                    │ │
│   │ • Returns: Map of sheet name → parsed data                          │ │
│   └─────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐ │
│   │ sheetsToObjects(values)                                              │ │
│   │ • Standard parser for current sheets                                │ │
│   │ • Row 1 = Headers, Rows 2+ = Data                                   │ │
│   │ • Returns: Array of objects                                         │ │
│   └─────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐ │
│   │ transposedSheetsToObjects(values)                                    │ │
│   │ • Special parser for historical sheets                              │ │
│   │ • Column 1 = Metrics, Row 1 = Dates                                 │ │
│   │ • Returns: Array of date-based objects                              │ │
│   └─────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐ │
│   │ fetchWithRetry(url, retries, delay)                                  │ │
│   │ • Exponential backoff for rate limiting                             │ │
│   │ • 3 retries with 1s, 2s, 4s delays                                  │ │
│   │ • Handles HTTP 429 errors                                           │ │
│   └─────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   Cache Strategy:                                                          │
│   • localStorage key: 'ccm_dashboard_data'                                 │
│   • Timestamp key: 'ccm_dashboard_data_timestamp'                          │
│   • Cache persists indefinitely (manual refresh required)                  │
│   • Fallback to stale cache on API errors                                  │
└───────────┬─────────────────────────────────────────────────────────────────┘
            │
            │ Returns Structured Data Object
            ▼
┌────────────────────────────────────────────────────────────────────────────┐
│   Structured Data Object (appData)                                         │
│                                                                             │
│   {                                                                         │
│     balance_sheet: { cash, assets, equity, ... },                          │
│     balance_sheet_history: [{ date, cash, assets, ... }, ...],             │
│     income_statement_history: [{ date, revenue, expenses, ... }, ...],     │
│     cashflow_history: [{ date, operating, investing, ... }, ...],          │
│     company_overview: { company_value, max_buildings, admin_overhead },    │
│     economic_phases: [{ phase, phase_code, duration_days, ... }, ...],     │
│     government_orders: [{ order_id, project_name, ... }, ...],             │
│     random_events: [{ event_name, date, impact, ... }, ...],               │
│     financial_ratios: { roe, roa, gross_margin, ... },                     │
│     inventory: [{ resource, quality, amount, value }, ...],                │
│     operations: {                                                           │
│       short_term: [{ building, type, product, quantity, ... }, ...],       │
│       long_term_goals: { goal_id: { label, cost, status, ... }, ... },    │
│       medium_term_strategy: "Current strategy notes..."                    │
│     },                                                                      │
│     commodity_analysis: [{ commodity, market_price, retail_price, ... }],  │
│     current_buildings_owned: [{ building_name, type, level }, ...],        │
│     transaction_summary: {                                                  │
│       recent_transactions: [{ timestamp, category, amount, ... }, ...]     │
│     }                                                                       │
│   }                                                                         │
└───────────┬─────────────────────────────────────────────────────────────────┘
            │
            │ Store in localStorage
            │ Pass to Components via Props
            ▼
┌────────────────────────────────────────────────────────────────────────────┐
│   React App (App.jsx)                                                      │
│                                                                             │
│   State Management:                                                         │
│   • const [appData, setAppData] = useState(null)                           │
│   • const [loading, setLoading] = useState(true)                           │
│   • const [error, setError] = useState(null)                               │
│                                                                             │
│   Data Loading Flow:                                                        │
│   useEffect(() => {                                                         │
│     1. Try loadCachedData() from localStorage                              │
│     2. Display cached data immediately (fast initial load)                 │
│     3. fetchAllData() from Google Sheets API                               │
│     4. Update state with fresh data                                        │
│     5. Cache new data in localStorage                                      │
│   }, []);                                                                   │
│                                                                             │
│   Manual Refresh:                                                           │
│   • User clicks "Refresh Data" button                                      │
│   • Triggers fetchAllData() → updates state → re-caches                    │
└───────────┬─────────────────────────────────────────────────────────────────┘
            │
            │ Pass appData prop to all components
            │
            ▼
┌────────────────────────────────────────────────────────────────────────────┐
│   Dashboard Components (Tabs)                                              │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│ ExecutiveSummary   │  │ IntelligenceDesk   │  │ RaidVault          │
│ (Tab: exec)        │  │ (Tab: intel)       │  │ (Tab: vault)       │
│                    │  │                    │  │                    │
│ Data Used:         │  │ Data Used:         │  │ Data Used:         │
│ • company_overview │  │ • economic_phases  │  │ • inventory        │
│ • operations       │  │ • govt_orders      │  │                    │
│ • current_buildings│  │ • random_events    │  │ Displays:          │
│                    │  │ • realm_data       │  │ • Resource list    │
│ Displays:          │  │                    │  │ • Quality levels   │
│ • Firm philosophy  │  │ Displays:          │  │ • Quantities       │
│ • Strategy notes   │  │ • Economic chart   │  │ • Values           │
│ • Building slots   │  │ • Boom/Recession   │  │ • Total value      │
└────────────────────┘  │ • Contracts (30d)  │  └────────────────────┘
                        │ • Events timeline  │
                        └────────────────────┘

┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│ Financials         │  │ TradeAnalysis      │  │ Archives           │
│ (Tab: bench)       │  │ (Tab: trade)       │  │ (Tab: arch)        │
│                    │  │                    │  │                    │
│ Data Used:         │  │ Data Used:         │  │ Data Used:         │
│ • balance_sheet    │  │ • commodity_anal.  │  │ • All historical   │
│ • company_overview │  │ • operations.short │  │                    │
│ • financial_ratios │  │                    │  │ Displays:          │
│ • transactions     │  │ Displays:          │  │ • (Future)         │
│                    │  │ • Active retail    │  │                    │
│ Displays:          │  │ • Top 20 opps      │  └────────────────────┘
│ • Cash runway      │  │ • ROI table        │
│ • Balance sheet    │  │ • Market summary   │
│ • Ratios (ROE/ROA) │  │ • Active badges    │
│ • Transactions     │  └────────────────────┘
└────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│   Component Data Extraction Pattern                                        │
│                                                                             │
│   const MyComponent = ({ appData }) => {                                   │
│     // Extract only what you need with fallbacks                           │
│     const balanceSheet = appData?.balance_sheet || {};                     │
│     const inventory = appData?.inventory || [];                            │
│     const currentCash = balanceSheet.cash || 0;                            │
│                                                                             │
│     // Perform calculations                                                │
│     const totalValue = inventory.reduce((sum, item) => sum + item.value, 0);│
│                                                                             │
│     // Render with null safety                                             │
│     return (                                                                │
│       <div>                                                                 │
│         {inventory.length === 0 ? (                                        │
│           <p>No data available</p>                                         │
│         ) : (                                                               │
│           <table>{/* render data */}</table>                               │
│         )}                                                                  │
│       </div>                                                                │
│     );                                                                      │
│   };                                                                        │
└────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────┐
│                        KEY DATA TRANSFORMATIONS                           │
└──────────────────────────────────────────────────────────────────────────┘

1. TRANSPOSED SHEETS (Historical Data)
   ─────────────────────────────────────
   Input (Google Sheets):
   ┌────────────┬────────────┬────────────┬────────────┐
   │ Metric     │ 2024-12-01 │ 2024-12-02 │ 2024-12-03 │
   ├────────────┼────────────┼────────────┼────────────┤
   │ Cash       │ 45000      │ 48200      │ 51300      │
   │ Assets     │ 125000     │ 128000     │ 132000     │
   │ Revenue    │ 12000      │ 13500      │ 14200      │
   └────────────┴────────────┴────────────┴────────────┘
   
   Output (JavaScript Array):
   [
     { date: "2024-12-01", Cash: 45000, Assets: 125000, Revenue: 12000 },
     { date: "2024-12-02", Cash: 48200, Assets: 128000, Revenue: 13500 },
     { date: "2024-12-03", Cash: 51300, Assets: 132000, Revenue: 14200 }
   ]

2. STANDARD SHEETS (Current Data)
   ────────────────────────────────
   Input (Google Sheets):
   ┌──────────┬────────┬───────┬─────────┬──────────┐
   │ Building │ Type   │ Level │ Product │ Quantity │
   ├──────────┼────────┼───────┼─────────┼──────────┤
   │ Grocery  │ RETAIL │ 1     │ Oranges │ 1686     │
   │ Grocery  │ RETAIL │ 1     │ Grapes  │ 1484     │
   └──────────┴────────┴───────┴─────────┴──────────┘
   
   Output (JavaScript Array):
   [
     { Building: "Grocery", Type: "RETAIL", Level: 1, Product: "Oranges", Quantity: 1686 },
     { Building: "Grocery", Type: "RETAIL", Level: 1, Product: "Grapes", Quantity: 1484 }
   ]

3. DERIVED CALCULATIONS
   ─────────────────────
   Source: multiple data sources
   
   Cash Runway:
   ┌─────────────────────────────────────────────────────┐
   │ Input:  balance_sheet.cash = 100,000               │
   │         company_overview.admin_overhead = 100/hr    │
   │                                                     │
   │ Calc:   hourly_burn = 100                          │
   │         daily_burn = 100 * 24 = 2,400              │
   │         runway_hours = 100,000 / 100 = 1,000       │
   │         runway_days = 1,000 / 24 = 41.7            │
   │                                                     │
   │ Output: { runwayDays: 41.7, status: "healthy" }    │
   └─────────────────────────────────────────────────────┘
   
   Retail ROI:
   ┌─────────────────────────────────────────────────────┐
   │ Input:  market_price = 2.70 (buy from exchange)    │
   │         transport = 0.39 (shipping cost)            │
   │         retail_price = 7.51 (sell to customers)     │
   │                                                     │
   │ Calc:   total_cost = 2.70 + 0.39 = 3.09            │
   │         margin = 7.51 - 3.09 = 4.42                │
   │         roi = (4.42 / 3.09) * 100 = 143%           │
   │                                                     │
   │ Output: { margin: 4.42, roi: 143, status: "high" } │
   └─────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────┐
│                          CACHING STRATEGY                                 │
└──────────────────────────────────────────────────────────────────────────┘

                     ┌────────────────────────┐
                     │   User Opens Dashboard │
                     └───────────┬────────────┘
                                 │
                                 ▼
                     ┌────────────────────────┐
                     │ Check localStorage     │
                     │ for cached data        │
                     └───────┬────────────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
            Cache Found          Cache Not Found
                  │                     │
                  ▼                     ▼
    ┌──────────────────────┐  ┌────────────────────┐
    │ Display cached data  │  │ Show loading state │
    │ immediately (fast!)  │  │ "Fetching data..." │
    └──────────┬───────────┘  └─────────┬──────────┘
               │                        │
               │  ┌─────────────────────┘
               │  │
               ▼  ▼
    ┌────────────────────────────────┐
    │ Fetch fresh data from API      │
    │ (Google Sheets batch request)  │
    └────────────┬───────────────────┘
                 │
                 ▼
    ┌────────────────────────────────┐
    │ Update state with new data     │
    │ setAppData(freshData)          │
    └────────────┬───────────────────┘
                 │
                 ▼
    ┌────────────────────────────────┐
    │ Save to localStorage           │
    │ localStorage.setItem(...)      │
    └────────────┬───────────────────┘
                 │
                 ▼
    ┌────────────────────────────────┐
    │ Components re-render with      │
    │ fresh data                     │
    └────────────────────────────────┘

User manually clicks "Refresh Data":
  → Skip cache check
  → Force API fetch
  → Update state
  → Re-cache
  → Components re-render


┌──────────────────────────────────────────────────────────────────────────┐
│                      ERROR HANDLING FLOW                                  │
└──────────────────────────────────────────────────────────────────────────┘

                  ┌────────────────────────┐
                  │  fetchAllData() called │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │ fetchWithRetry(url)    │
                  └───────────┬────────────┘
                              │
                   ┌──────────┴──────────┐
                   │                     │
            Success (200)         Error (429, 500, etc.)
                   │                     │
                   ▼                     ▼
    ┌──────────────────────┐   ┌────────────────────────┐
    │ Parse response JSON  │   │ Retry #1 (wait 1s)     │
    │ Transform data       │   │ Retry #2 (wait 2s)     │
    │ Return to App        │   │ Retry #3 (wait 4s)     │
    └──────────────────────┘   └──────────┬─────────────┘
                                          │
                               ┌──────────┴──────────┐
                               │                     │
                        Still Failing        Success on Retry
                               │                     │
                               ▼                     ▼
                   ┌────────────────────┐  ┌────────────────────┐
                   │ Check localStorage │  │ Return fresh data  │
                   │ for stale cache    │  └────────────────────┘
                   └──────────┬─────────┘
                              │
                   ┌──────────┴──────────┐
                   │                     │
            Cache Available      No Cache
                   │                     │
                   ▼                     ▼
    ┌─────────────────────────┐  ┌────────────────────┐
    │ Warn user "Using stale  │  │ Show error message │
    │ data due to API error"  │  │ "Failed to load"   │
    │ Return cached data      │  │ Return null        │
    └─────────────────────────┘  └────────────────────┘


┌──────────────────────────────────────────────────────────────────────────┐
│                         LEGEND                                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────┐                                                             │
│  │ Process │  = Active process or transformation                         │
│  └─────────┘                                                             │
│                                                                           │
│  ┌─────────┐                                                             │
│  │  Data   │  = Data storage or structure                                │
│  └─────────┘                                                             │
│                                                                           │
│      │                                                                    │
│      ▼       = Data flow direction                                       │
│                                                                           │
│  ◄─────►     = Bidirectional data flow                                   │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```
