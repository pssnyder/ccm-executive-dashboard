# CCM Executive Dashboard - Data Stream Mapping

This document provides a comprehensive map of all data streams flowing through the CCM Executive Dashboard. Each stream is traced from its raw source through transformation, storage, and finally to its visual presentation on the dashboard.

**Purpose**: This mapping enables rapid troubleshooting of data pipeline issues and serves as a blueprint for the Firebase migration. If data appears incorrect on the frontend, trace backward through this map to identify the point of failure.

---

## Data Stream Legend

Each data stream is documented with the following attributes:

- **Stream ID**: Unique identifier for the data stream
- **Source**: Where the raw data originates (CSV export, API, manual input)
- **Raw Format**: Structure of the original data
- **Transformation**: How raw data is processed into the analytical layer
- **Current Storage**: JSON path in `analytical_layer/core_reporting.json`
- **Future Storage**: Firestore collection/document structure (planned)
- **Consumer Component**: React component that reads this data
- **Visual Output**: What the user sees on the dashboard
- **Update Frequency**: How often this data changes

---

## Active Data Streams

### DS-001: Company Overview Metadata

**Source**: Manual input from game UI  
**Raw Format**: Text/numeric values from company profile page  
**Transformation**: Manual entry → JSON object  
**Current Storage**: `core_reporting.json → company_overview`  
**Future Storage**: Firestore: `companies/{companyId}/metadata`  
**Consumer Component**: `Header.jsx`, `ExecutiveSummary.jsx`  
**Visual Output**:
- Header: "Book Value" display ($47,425)
- Executive Summary: Building slots calculation (5 + 4 = 9 total)
- Metadata display (Level 6, Ranking #22008, Rating B-)

**Update Frequency**: Low (changes only when company levels up or significant value shifts occur)

**Data Fields**:
```json
{
  "ranking": 22008,
  "rating": "B-",
  "company_value": 47425,
  "buildings_value": 17250,
  "level": 6,
  "max_buildings": "5 + 4",
  "admin_overhead": 0.59
}
```

---

### DS-002: Balance Sheet

**Source**: `raw_data/sim-companies-balance-sheet_YYYYMMDD.csv`  
**Raw Format**: CSV with columns for cash, A/R, inventory, buildings, equity  
**Transformation**: CSV parsing → calculations for inventory adjustments → JSON  
**Current Storage**: `core_reporting.json → balance_sheet`  
**Future Storage**: Firestore: `companies/{companyId}/financials/balance_sheet`  
**Consumer Component**: `Header.jsx`, future financial dashboards  
**Visual Output**:
- Header: "Cash Pool" display ($12,361)
- Used for progress calculations in Benchmarks tab

**Update Frequency**: Daily (end-of-day snapshot)

**Data Fields**:
```json
{
  "timestamp": "2025-12-24T01:18:40.910008+00:00",
  "cash": 12361,
  "accounts_receivable": 489,
  "inventory_materials": 24556,
  "inventory_finished_goods": 5667,
  "inventory_valuation_allowance": -4017,
  "buildings": 17250,
  "contributed_capital": 24760,
  "retained_earnings": 22665
}
```

---

### DS-003: Short-Term Operations (Tactical Workspace)

**Source**: Manual input from active production buildings  
**Raw Format**: Building name, product, quantity, cost, finish time (from game UI)  
**Transformation**: Manual entry → structured JSON array with ISO timestamps  
**Current Storage**: `core_reporting.json → operations.short_term[]`  
**Future Storage**: Firestore: `companies/{companyId}/operations/active_production`  
**Consumer Component**: `Workspace.jsx`  
**Visual Output**:
- Workspace tab: Grid of production cards showing:
  - Building name and type badge
  - Product and quantity
  - Cost metrics (total sourcing value, cost per unit)
  - Live countdown timer to completion
  - Quality indicator

**Update Frequency**: High (updated whenever production starts/completes, multiple times per day)

**Data Fields**:
```json
{
  "building": "Orange Farm 1",
  "type": "FARM",
  "product": "Oranges",
  "quantity": 1296,
  "sourcing_value": 2349,
  "quality": 0,
  "cost_per_unit": 1.81,
  "finish_time": "2025-12-24T14:27:00Z"
}
```

---

### DS-004: Medium-Term Strategy

**Source**: Manual strategic planning input  
**Raw Format**: Text description of current strategic focus  
**Transformation**: Direct text entry → JSON string  
**Current Storage**: `core_reporting.json → operations.medium_term_strategy`  
**Future Storage**: Firestore: `companies/{companyId}/strategy/current_focus`  
**Consumer Component**: `ExecutiveSummary.jsx`  
**Visual Output**:
- Executive Summary tab: "Current Focus" card with strategy description
- Styled with orange accent border

**Update Frequency**: Low (updated when strategic direction changes, weekly or monthly)

**Data Fields**:
```json
{
  "medium_term_strategy": "Go all-in on farming: produce seeds and oranges, buying water from the market..."
}
```

---

### DS-005: Long-Term Goals (Strategic Roadmap)

**Source**: Manual input based on game building costs and strategic planning  
**Raw Format**: Building requirements, costs, benefits from game encyclopedia  
**Transformation**: Manual entry with cost calculations → structured JSON objects  
**Current Storage**: `core_reporting.json → long_term_goals{}`  
**Future Storage**: Firestore: `companies/{companyId}/strategy/long_term_goals`  
**Consumer Component**: `Benchmarks.jsx`  
**Visual Output**:
- Benchmarks tab: Grid of goal cards showing:
  - Goal label (e.g., "Power (L1)")
  - Total cost with inflation
  - Progress bar (cash/total_cost %)
  - Status badge (Primary Target, Secondary, etc.)
  - Requirement breakdown
  - Benefit description

**Update Frequency**: Low (updated when goals are added/removed or costs change)

**Data Fields**:
```json
{
  "power_plant": {
    "label": "Power (L1)",
    "total_cost": 58127,
    "cost_inflation": 6377,
    "status": "Primary Target",
    "output": {
      "rate": 2566.94,
      "unit": "units/hour"
    },
    "requirements": {
      "time_to_build": "3h",
      "wages_per_hour": 414,
      "reinforced_concrete": 60,
      "bricks": 825
    }
  }
}
```

---

### DS-006: Warehouse Inventory

**Source**: `raw_data/sim-companies-warehouse_intraday.csv`  
**Raw Format**: CSV with columns: Resource, Quality, Amount, Cost labor, Cost management, Cost 3rd party, Cost material 1-5  
**Transformation**: 
1. CSV parsing
2. Sum all cost columns to calculate total value per resource
3. Convert to simplified JSON array

**Current Storage**: `core_reporting.json → inventory[]`  
**Future Storage**: Firestore: `companies/{companyId}/inventory/current`  
**Consumer Component**: `RaidVault.jsx` (Warehouse tab)  
**Visual Output**:
- Warehouse tab: Table displaying:
  - Resource name
  - Quality level (Q0-Q5)
  - Amount in stock
  - Total value
  - Value per unit (calculated)
- Header showing total inventory value

**Update Frequency**: High (intraday updates whenever significant inventory changes occur)

**Data Fields**:
```json
{
  "resource": "Power",
  "quality": 0,
  "amount": 10100,
  "value": 2328
}
```

**CSV to JSON Mapping**:
```
CSV: Power,0,10100,0.0,0.0,2328.0,0.0,0.0,0.0,0.0,0.0
↓
JSON: { "resource": "Power", "quality": 0, "amount": 10100, "value": 2328 }
(value = sum of all cost columns)
```

---

### DS-007: Live Market Data

**Source**: SimCo Tools API (`https://api.simcotools.com/v1/realms/0/market/prices`)  
**Raw Format**: JSON array with market prices for all resources  
**Transformation**: 
1. API fetch via Vite proxy (`/api` → `https://api.simcotools.com/v1`)
2. Slice first 20 items for ticker display
3. Direct consumption (no storage in analytical layer)

**Current Storage**: None (ephemeral, held in component state only)  
**Future Storage**: Optional Firestore cache: `market_data/realms/0/prices` (for historical analysis)  
**Consumer Component**: `MarketTicker.jsx`  
**Visual Output**:
- Scrolling ticker banner at top of dashboard
- Shows resource name and current price (e.g., "Oranges. $4.450")

**Update Frequency**: Real-time (fetched on component mount, could be set to refresh every N minutes)

**Data Fields** (API Response):
```json
{
  "kind": "Oranges",
  "price": 4.45,
  "quality": 0
}
```

---

### DS-008: Commodity Market Analysis

**Source**: Hybrid - API data + manual cost calculations  
**Raw Format**: Market price from API + production costs from manual input  
**Transformation**: Combine market price history with production cost breakdown  
**Current Storage**: `core_reporting.json → commodities{}`  
**Future Storage**: Firestore: `companies/{companyId}/commodities/{commodity_name}`  
**Consumer Component**: Not yet visualized (planned for Intelligence Desk)  
**Visual Output**: None currently (future: margin analysis, profitability charts)

**Update Frequency**: Daily (market price snapshots) + Low (production costs change rarely)

**Data Fields**:
```json
{
  "oranges": {
    "market_price_history": [
      {
        "date": "2025-12-23",
        "quality": 0,
        "price": 4.45
      }
    ],
    "production_costs": {
      "seeds_per_unit": 0.5,
      "water_per_unit": 1,
      "wages_per_unit": 0
    },
    "notes": "Primary cash-generating asset..."
  }
}
```

---

## Dormant Data Streams (Available but Not Yet Integrated)

These CSV files exist in `raw_data/` but are not yet parsed or displayed:

### DS-009: Income Statement
**Source**: `sim-companies-income-statement_YYYYMMDD.csv`  
**Future Use**: Intelligence Desk - P&L analysis, profitability trends  
**Planned Storage**: Firestore: `companies/{companyId}/financials/income_statements`

### DS-010: Cash Flow Statement
**Source**: `sim-companies-cashflow-statement_YYYYMMDD.csv`  
**Future Use**: Intelligence Desk - liquidity analysis, operating cash flow trends  
**Planned Storage**: Firestore: `companies/{companyId}/financials/cashflow_statements`

### DS-011: Account History
**Source**: `sim-companies-account-history-Cassandra Capital Management_thruYYYYMMDD.csv`  
**Future Use**: Archives tab - transaction history, audit trail  
**Planned Storage**: Firestore: `companies/{companyId}/transactions/history`

### DS-012: Buildings Data
**Source**: `Sim Companies Data - Buildings_thru20251223.csv`  
**Future Use**: Strategic planning - building encyclopedia, cost references  
**Planned Storage**: Firestore: `reference_data/buildings`

### DS-013: Company Levels
**Source**: `Sim Companies Data - Company Levels_thru20251223.csv`  
**Future Use**: Progression tracking, requirement lookups  
**Planned Storage**: Firestore: `reference_data/company_levels`

### DS-014: Economic Phases
**Source**: `Sim Companies Data - Economic Phases_thru20251223.csv`  
**Future Use**: Market timing, economic cycle analysis  
**Planned Storage**: Firestore: `game_data/economic_phases`

### DS-015: Government Orders
**Source**: `Sim Companies Data - Government Orders_thru20251223.csv`  
**Future Use**: Opportunity tracking, contract bidding  
**Planned Storage**: Firestore: `companies/{companyId}/opportunities/government_orders`

### DS-016: Random Events
**Source**: `Sim Companies Data - Random Events_thru20251223.csv`  
**Future Use**: Risk analysis, event history  
**Planned Storage**: Firestore: `companies/{companyId}/events/random`

### DS-017: Realm Data
**Source**: `Sim Companies Data - Realm Data_thru20251223.csv`  
**Future Use**: Competitive analysis, realm-wide metrics  
**Planned Storage**: Firestore: `game_data/realm_statistics`

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         RAW DATA SOURCES                            │
├─────────────────────────────────────────────────────────────────────┤
│  • CSV Exports (Balance Sheet, Income, Cashflow, Warehouse, etc.)  │
│  • Manual Input (Strategy, Active Production, Company Overview)    │
│  • Live API (SimCo Tools Market Data)                              │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    TRANSFORMATION LAYER                             │
├─────────────────────────────────────────────────────────────────────┤
│  • CSV Parsing (Manual - AI Assisted)                              │
│  • Data Cleaning & Validation                                      │
│  • Metric Calculations (totals, ratios, progress %)                │
│  • Format Standardization (ISO timestamps, currency, etc.)         │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ANALYTICAL LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Current: /analytical_layer/core_reporting.json                    │
│  Future:  Firestore collections under companies/{companyId}        │
│                                                                     │
│  Data organized by domain:                                         │
│    - company_overview (DS-001)                                     │
│    - balance_sheet (DS-002)                                        │
│    - operations (DS-003, DS-004)                                   │
│    - long_term_goals (DS-005)                                      │
│    - inventory (DS-006)                                            │
│    - commodities (DS-008)                                          │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    REACT COMPONENTS                                 │
├─────────────────────────────────────────────────────────────────────┤
│  • App.jsx (data fetch & distribution)                             │
│  • Header.jsx (DS-001, DS-002)                                     │
│  • ExecutiveSummary.jsx (DS-001, DS-004)                           │
│  • Workspace.jsx (DS-003)                                          │
│  • Benchmarks.jsx (DS-002, DS-005)                                 │
│  • RaidVault.jsx (DS-006)                                          │
│  • MarketTicker.jsx (DS-007)                                       │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    VISUAL PRESENTATION                              │
├─────────────────────────────────────────────────────────────────────┤
│  • Executive Summary Tab                                           │
│  • Tactical Workspace Tab                                          │
│  • Benchmarks Tab (Long-term Goals)                                │
│  • Warehouse Tab (Inventory)                                       │
│  • Market Ticker (Live prices)                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting Guide

### If data appears incorrect on the dashboard:

1. **Identify the visual element**: Note which component/tab shows the wrong data
2. **Find the data stream**: Use the "Consumer Component" field above to identify which DS-### stream feeds that component
3. **Check the current storage**: Inspect `analytical_layer/core_reporting.json` at the path listed in the data stream
4. **Trace backward**:
   - If JSON is wrong → check transformation step (likely manual parsing error)
   - If JSON is correct → check component logic in the React file
5. **Verify the source**: Check the raw CSV file or manual input for accuracy

### Example Troubleshooting Scenario:

**Problem**: Warehouse tab shows outdated inventory amounts

**Solution Path**:
1. Visual element: Warehouse tab table
2. Data stream: DS-006 (Warehouse Inventory)
3. Current storage: `core_reporting.json → inventory[]`
4. Check JSON: If values are old, the CSV hasn't been re-parsed
5. Source: Upload new `sim-companies-warehouse_intraday.csv` and request manual re-parsing

---

## Migration Checklist: Data Stream to Firestore

When migrating each data stream to Firebase:

- [ ] DS-001: Company Overview → `companies/{companyId}/metadata`
- [ ] DS-002: Balance Sheet → `companies/{companyId}/financials/balance_sheet`
- [ ] DS-003: Short-Term Ops → `companies/{companyId}/operations/active_production`
- [ ] DS-004: Medium Strategy → `companies/{companyId}/strategy/current_focus`
- [ ] DS-005: Long-Term Goals → `companies/{companyId}/strategy/long_term_goals`
- [ ] DS-006: Inventory → `companies/{companyId}/inventory/current`
- [ ] DS-007: Market Data → `market_data/realms/0/prices` (cache)
- [ ] DS-008: Commodity Analysis → `companies/{companyId}/commodities/{name}`
- [ ] DS-009-017: Integrate dormant streams as needed

---

## Notes

- **Timestamps**: All finish times and update timestamps should be stored in ISO 8601 format (UTC)
- **Currency**: All monetary values stored as integers or floats (no currency symbols in storage)
- **Quality**: Stored as integers 0-5 representing game quality levels
- **Component State**: DS-007 (Market Data) is currently ephemeral; consider caching in Firestore for historical analysis
- **Manual Input Streams**: DS-001, DS-003, DS-004, DS-005 will require a web form or admin interface once migrated to Firebase
