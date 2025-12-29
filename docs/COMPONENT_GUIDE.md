# CCM Dashboard - Component Documentation

## Architecture Overview

The dashboard follows a **container/presenter pattern**:
- **App.jsx**: Main router, data loading orchestration
- **Components**: Presentational tabs consuming data via props
- **Services**: Data fetching and transformation logic
- **Contexts**: Authentication state management

---

## Component Hierarchy

```
App.jsx
├── PublicLanding (unauthenticated)
└── Workspace (authenticated)
    ├── Header
    ├── MarketTicker
    ├── Navigation
    ├── ExecutiveSummary (default tab)
    ├── IntelligenceDesk
    ├── RaidVault
    ├── Financials
    ├── TradeAnalysis
    ├── Benchmarks
    ├── Archives
    └── Footer
```

---

## Core Components

### App.jsx
**Location**: `src/App.jsx`  
**Purpose**: Application shell, data orchestration, routing

**State Management**:
```javascript
const [appData, setAppData] = useState(null);      // All dashboard data
const [activeTab, setActiveTab] = useState('exec'); // Current view
const [loading, setLoading] = useState(true);       // Fetch status
const [error, setError] = useState(null);           // Error state
const [lastFetch, setLastFetch] = useState(null);   // Cache timestamp
```

**Data Flow**:
```javascript
useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAllData();  // googleSheetsService
      setAppData(data);
      setLastFetch(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);
```

**Manual Refresh**:
```javascript
const handleRefresh = async () => {
  setLoading(true);
  const data = await fetchAllData();
  setAppData(data);
  setLastFetch(new Date());
  setLoading(false);
};
```

**Props Passed to All Tabs**:
- `appData`: Complete data object from Google Sheets
- All tabs receive same data, extract what they need

---

### ExecutiveSummary.jsx
**Location**: `src/components/ExecutiveSummary.jsx`  
**Tab ID**: `exec` (default view)  
**Purpose**: High-level company strategy and capacity overview

**Data Consumed**:
```javascript
const companyOverview = appData?.company_overview;
const mediumTermStrategy = appData?.operations?.medium_term_strategy;
const currentBuildings = appData?.current_buildings_owned || [];
```

**Key Calculations**:
```javascript
// Building capacity analysis
const maxBuildings = parseInt(companyOverview?.max_buildings?.split(' + ')[0] || '0', 10);
const bonusBuildings = parseInt(companyOverview?.max_buildings?.split(' + ')[1] || '0', 10);
const totalSlots = maxBuildings + bonusBuildings;
const ownedBuildingsCount = currentBuildings.length;
const openSlots = totalSlots - ownedBuildingsCount;
```

**Sections**:
1. **Firm Philosophy**: Mission statement, investment approach
2. **Medium-Term Strategy**: Current operational focus from Strategy Notes
3. **Strategic Stance**: Deployment capacity (open building slots)

**Visual Style**:
- Glass panel design (`glass-panel` class)
- Indigo accent colors for branding
- Minimal metrics (strategic overview, not operational details)

---

### IntelligenceDesk.jsx
**Location**: `src/components/IntelligenceDesk.jsx`  
**Tab ID**: `intel`  
**Purpose**: Market intelligence - economic cycles, government contracts, events

**Data Consumed**:
```javascript
const economicPhases = appData?.economic_phases || [];
const governmentOrders = appData?.government_orders || [];
const randomEvents = appData?.random_events || [];
const realmData = appData?.realm_data || [];
```

**Key Features**:

#### 1. Economic Status Cards
```javascript
const currentPhase = economicPhases[0] || {};  // Most recent phase

// Display: Phase name, code (-1/0/+1), duration, historical count
```

**Phase Codes**:
- `+1`: BOOM (expansion, green)
- `0`: NORMAL (stable, yellow)
- `-1`: RECESSION (contraction, red)

#### 2. Economic Cycle Chart
Uses **Recharts** LineChart to visualize phase codes over time:

```javascript
<LineChart
  data={economicPhases.slice(0, 30).reverse().map((phase, index) => ({
    index: index,
    phaseCode: parseInt(phase.phase_code) || 0,
    phase: phase.phase,
    duration: `${phase.duration_days}d`,
    date: phase.start_date || ''
  }))}
>
  <XAxis dataKey="index" />
  <YAxis domain={[-1.5, 1.5]} ticks={[-1, 0, 1]} />
  <Line dataKey="phaseCode" stroke="#06b6d4" />
  <ReferenceLine y={0} stroke="#94a3b8" />  {/* Normal baseline */}
  <ReferenceLine y={1} stroke="#22c55e" />  {/* Boom threshold */}
  <ReferenceLine y={-1} stroke="#ef4444" /> {/* Recession threshold */}
</LineChart>
```

#### 3. Recent Government Contracts
Filters orders from last 30 days:

```javascript
const parseISODate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);  // Avoid timezone shifts
};

const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const recentContracts = governmentOrders.filter(order => {
  const orderDate = parseISODate(order.creation_date);
  return orderDate && orderDate >= thirtyDaysAgo;
});
```

#### 4. Random Events Timeline
Displays recent game events with impact indicators:

```javascript
<span className={`${
  parseFloat(event.impact) > 0 ? 'bg-green-900/30 text-green-400' :
  parseFloat(event.impact) < 0 ? 'bg-red-900/30 text-red-400' :
  'bg-yellow-900/30 text-yellow-400'
}`}>
  {(parseFloat(event.impact) * 100).toFixed(0)}%
</span>
```

**Use Cases**:
- Timing market entry/exit based on economic phase
- Identifying government contract opportunities
- Assessing event impacts on operations

---

### RaidVault.jsx
**Location**: `src/components/RaidVault.jsx`  
**Tab ID**: `vault`  
**Purpose**: Warehouse inventory display

**Data Consumed**:
```javascript
const { inventory } = appData;
```

**Features**:
```javascript
// Calculate total warehouse value
const totalValue = inventory.reduce((acc, item) => acc + item.value, 0);

// Display table with:
// - Resource name
// - Quality (Q0-Q12)
// - Amount (units)
// - Total value ($)
// - Value per unit ($/unit)
```

**Empty State**:
```javascript
if (!inventory || inventory.length === 0) {
  return <div>No inventory data available.</div>;
}
```

**Visual Design**:
- Dark theme (`bg-gray-900`)
- Green accent for values (`text-green-400`)
- Blue accent for per-unit prices (`text-blue-400`)
- Hover effects on rows

---

### Financials.jsx
**Location**: `src/components/Financials.jsx`  
**Tab ID**: `bench` (Bench = Benchmarks/Financials)  
**Purpose**: Financial statements, ratios, cash runway analysis

**Data Consumed**:
```javascript
const balanceSheet = appData?.balance_sheet || {};
const companyOverview = appData?.company_overview || {};
const financialRatios = appData?.financial_ratios || {};
const transactions = appData?.transaction_summary?.recent_transactions || [];
```

**Key Features**:

#### 1. Cash Runway Analysis
**Purpose**: Calculate how long current cash will last at current burn rate

```javascript
const getCashRunway = () => {
  const hourlyBurn = parseFloat(companyOverview.admin_overhead || 0);  // $/hr
  const dailyBurn = hourlyBurn * 24;
  const weeklyBurn = dailyBurn * 7;
  const currentCash = balanceSheet.cash || 0;
  
  const runwayHours = hourlyBurn > 0 ? currentCash / hourlyBurn : 0;
  const runwayDays = runwayHours / 24;
  
  return {
    currentCash,
    hourlyBurn,
    dailyBurn,
    weeklyBurn,
    runwayHours,
    runwayDays,
    status: runwayDays > 7 ? 'healthy' : runwayDays > 3 ? 'warning' : 'critical'
  };
};
```

**Visual Indicators**:
- **Healthy** (>7 days): Green gradient
- **Warning** (3-7 days): Yellow gradient
- **Critical** (<3 days): Red gradient

#### 2. Financial Overview Cards
Quick metrics displayed as gradient cards:
- Company Value
- Cash
- Assets Value (buildings)
- Retained Earnings

#### 3. Balance Sheet
**Two-Column Layout**:

**Assets** (left column):
- Cash
- Accounts Receivable
- Inventory (Materials)
- Inventory (Finished Goods)
- Buildings
- **Total Assets** (calculated sum)

**Liabilities & Equity** (right column):
- Contributed Capital
- Retained Earnings
- **Total Equity** (calculated sum)

```javascript
const totalAssets = 
  (balanceSheet.cash || 0) +
  (balanceSheet.accounts_receivable || 0) +
  (balanceSheet.inventory_materials || 0) +
  (balanceSheet.inventory_finished_goods || 0) +
  (balanceSheet.buildings || 0);
```

#### 4. Financial Ratios
**Three Categories**:

**Profitability**:
- Gross Margin
- Operating Margin
- Net Margin

**Efficiency**:
- ROE (Return on Equity)
- ROA (Return on Assets)

**Turnover**:
- Inventory Turnover (times per year)
- Assets Turnover (times per year)
- Debt to Building ratio

```javascript
const formatPercent = (value) => {
  // Values stored as decimals (1.0546 = 105.46%)
  return `${((value || 0) * 100).toFixed(2)}%`;
};
```

#### 5. Recent Transactions
Displays last 10 transactions with:
- Date
- Category (Revenue/Expense with color coding)
- Amount (green for positive, red for negative)
- Description

```javascript
<span className={`px-2 py-1 rounded text-xs ${
  tx.category === 'Revenue' ? 'bg-green-900/30 text-green-400' :
  tx.category === 'Expense' ? 'bg-red-900/30 text-red-400' :
  'bg-blue-900/30 text-blue-400'
}`}>
  {tx.category}
</span>
```

**NOTE**: Retail Arbitrage Scanner was **removed** from this component (duplicate of TradeAnalysis)

---

### TradeAnalysis.jsx
**Location**: `src/components/TradeAnalysis.jsx`  
**Tab ID**: `trade`  
**Purpose**: Retail market opportunities and active operations tracking

**Data Consumed**:
```javascript
const commodityAnalysis = appData?.commodity_analysis || [];
const activeOperations = appData?.operations?.short_term || [];
```

**Key Features**:

#### 1. Active Retail Operations
Displays currently running retail stores:

```javascript
const activeRetailOps = activeOperations.filter(op => op.type === 'RETAIL');

// Display cards showing:
// - Building name (e.g., "Grocery Store")
// - Product (e.g., "Oranges")
// - Quantity in stock
```

**Empty State**:
```javascript
{activeRetailOps.length === 0 && (
  <div className="text-slate-500 italic">No active retail operations</div>
)}
```

#### 2. Top Retail Opportunities Table
Shows best 20 retail products sorted by revenue potential:

```javascript
const retailOpportunities = commodityAnalysis
  .filter(c => c.revenue_per_unit > 0)  // Only profitable items
  .sort((a, b) => b.revenue_per_unit - a.revenue_per_unit)
  .slice(0, 20);
```

**Columns**:
- **Product**: Name (with "● ACTIVE" indicator if currently running)
- **Buy Price**: Market exchange price
- **Sell Price**: Average retail price
- **Margin**: Revenue per unit
- **ROI %**: Return on investment percentage (color-coded)
  - Green: >50%
  - Yellow: 20-50%
  - Gray: <20%
- **Status**: Priority level (High/Medium/Low badges)

**Active Product Detection**:
```javascript
const activeProducts = activeOperations.map(op => op.product).filter(Boolean);
const isActive = activeProducts.includes(item.commodity);
```

#### 3. Market Summary Cards
Three stat cards:
- **Total Products**: All items in retail research
- **Profitable Items**: Count of positive margin opportunities
- **Active Stores**: Currently running retail buildings

```javascript
<div className="text-3xl font-bold text-white">
  {activeOperations.filter(op => op.type === 'RETAIL').length}
</div>
```

**Use Cases**:
- Identify new retail opportunities (high ROI products not yet active)
- Monitor current operations at a glance
- Compare market opportunities vs. active portfolio

---

### Navigation.jsx
**Location**: `src/components/Navigation.jsx`  
**Purpose**: Tab switcher

**Tab Structure**:
```javascript
const tabs = [
  { id: 'exec', label: 'Exec', icon: '◆' },
  { id: 'intel', label: 'Intel', icon: '◈' },
  { id: 'vault', label: 'Vault', icon: '◇' },
  { id: 'bench', label: 'Bench', icon: '◊' },
  { id: 'trade', label: 'Trade', icon: '⬡' },
  { id: 'arch', label: 'Arch', icon: '◉' }
];
```

**Active State**:
```javascript
<button
  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
  onClick={() => setActiveTab(tab.id)}
>
  <span className="tab-icon">{tab.icon}</span>
  {tab.label}
</button>
```

**Styling**:
- Dark background with indigo accents
- Geometric icons for visual interest
- Active tab highlighted with brighter color
- Uppercase labels for formal aesthetic

---

### Header.jsx
**Location**: `src/components/Header.jsx`  
**Purpose**: Branding, data refresh, auth controls

**Features**:
```javascript
// Company branding
<h1>Cassandra Capital Management</h1>
<p>Executive Dashboard</p>

// Last data fetch timestamp
{lastFetch && (
  <div className="text-xs text-slate-500">
    Last updated: {lastFetch.toLocaleString()}
  </div>
)}

// Refresh button
<button onClick={onRefresh} disabled={loading}>
  {loading ? 'Refreshing...' : 'Refresh Data'}
</button>

// Logout
<button onClick={logout}>Sign Out</button>
```

**User Context**:
```javascript
const { user, logout } = useAuth();

// Display current user email
{user?.email}
```

---

### MarketTicker.jsx
**Location**: `src/components/MarketTicker.jsx`  
**Purpose**: Scrolling market data display

**Data Source**:
```javascript
const commodityData = appData?.commodity_analysis || [];
```

**Display Logic**:
```javascript
// Filter to show only items with prices
const marketData = commodityData
  .filter(item => item.market_price > 0)
  .map(item => ({
    name: item.commodity,
    price: formatCurrency(item.market_price),
    change: calculateChange(item)  // If historical data available
  }));
```

**Animation**:
```css
@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.ticker-content {
  animation: scroll 60s linear infinite;
}
```

**Visual Style**:
- Dark background strip
- Monospace font for prices
- Green/red for price changes
- Continuous horizontal scroll

---

### Footer.jsx
**Location**: `src/components/Footer.jsx`  
**Purpose**: Legal disclaimer, version info

**Content**:
```javascript
<footer className="text-center text-xs text-slate-600 py-4">
  <p>© 2024 Cassandra Capital Management</p>
  <p>Dashboard v1.0 | For internal use only</p>
  <p>Data refreshed from Google Sheets API</p>
</footer>
```

---

## Data Flow Patterns

### Pattern 1: Direct Prop Access
Most common pattern - components receive `appData` and extract what they need:

```javascript
const Financials = ({ appData }) => {
  const balanceSheet = appData?.balance_sheet || {};
  const companyOverview = appData?.company_overview || {};
  // ... render using extracted data
};
```

### Pattern 2: Derived Calculations
Components compute metrics from raw data:

```javascript
const getCashRunway = () => {
  const hourlyBurn = parseFloat(companyOverview.admin_overhead);
  const currentCash = balanceSheet.cash;
  const runwayDays = (currentCash / hourlyBurn) / 24;
  
  return {
    runwayDays,
    status: runwayDays > 7 ? 'healthy' : 'critical'
  };
};
```

### Pattern 3: Filtering & Sorting
Components transform data for display:

```javascript
// Filter recent contracts
const recentContracts = governmentOrders.filter(order => 
  parseDate(order.creation_date) >= thirtyDaysAgo
);

// Sort opportunities
const topOpportunities = commodityAnalysis
  .filter(c => c.revenue_per_unit > 0)
  .sort((a, b) => b.revenue_per_unit - a.revenue_per_unit)
  .slice(0, 20);
```

---

## Styling System

### Design Tokens
**File**: `src/index.css`

```css
/* Color Palette */
--color-bg-primary: #0f172a;      /* Slate 900 */
--color-bg-secondary: #1e293b;    /* Slate 800 */
--color-accent-primary: #6366f1;  /* Indigo 500 */
--color-accent-secondary: #06b6d4; /* Cyan 500 */
--color-text-primary: #f1f5f9;    /* Slate 100 */
--color-text-secondary: #94a3b8;  /* Slate 400 */

/* Glass Panel Effect */
.glass-panel {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.1);
}
```

### Gradient Cards
Financial metrics use gradient backgrounds for visual hierarchy:

```css
.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

/* Variants */
from-blue-900/30 to-blue-800/20    /* Blue metrics */
from-green-900/30 to-green-800/20  /* Positive/revenue */
from-red-900/30 to-red-800/20      /* Negative/expense */
from-purple-900/30 to-purple-800/20 /* Analytical */
from-cyan-900/30 to-cyan-800/20    /* Secondary */
```

### Status Colors

**Semantic Color Coding**:
- **Green**: Positive, healthy, revenue, profit
- **Red**: Negative, critical, expense, loss
- **Yellow**: Warning, neutral, stable
- **Blue**: Primary data, informational
- **Purple**: Analytics, calculations
- **Cyan**: Secondary data, highlights

---

## Component Best Practices

### 1. Null Safety
Always provide fallbacks for missing data:

```javascript
const inventory = appData?.inventory || [];
const currentPhase = economicPhases[0] || {};
const cashValue = balanceSheet.cash || 0;
```

### 2. Formatting Utilities
Use consistent formatting functions:

```javascript
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(value || 0);
};

const formatPercent = (value) => {
  return `${((value || 0) * 100).toFixed(2)}%`;
};
```

### 3. Responsive Design
Use Tailwind grid utilities:

```jsx
<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Cards stack on mobile, 2 cols on tablet, 4 on desktop */}
</div>
```

### 4. Empty States
Always handle empty data gracefully:

```jsx
{data.length === 0 ? (
  <div className="text-center text-slate-500">
    No data available
  </div>
) : (
  <table>{/* data rows */}</table>
)}
```

### 5. Loading States
Show loading indicators during data fetch:

```jsx
{loading ? (
  <div className="spinner">Loading...</div>
) : (
  <Dashboard data={appData} />
)}
```

---

## Component Development Checklist

When creating a new component:

- [ ] Add to Navigation.jsx with unique tab ID
- [ ] Add route in App.jsx tab rendering
- [ ] Extract only needed data from appData prop
- [ ] Provide default values for all data access
- [ ] Implement null/empty state handling
- [ ] Use semantic color coding
- [ ] Apply glass-panel styling for consistency
- [ ] Add responsive grid layouts
- [ ] Format numbers with utility functions
- [ ] Test with missing/incomplete data
- [ ] Document data dependencies
- [ ] Add meaningful CSS class names

---

## Performance Considerations

### Memoization
Consider React.memo for expensive components:

```javascript
const ExpensiveChart = React.memo(({ data }) => {
  return <LineChart data={data} />;
}, (prevProps, nextProps) => {
  // Only re-render if data changed
  return prevProps.data === nextProps.data;
});
```

### Lazy Loading
Code-split large components:

```javascript
const Archives = React.lazy(() => import('./components/Archives'));

<Suspense fallback={<div>Loading...</div>}>
  <Archives appData={appData} />
</Suspense>
```

### Data Filtering
Filter data once, not in render loops:

```javascript
// ❌ Bad - filters on every render
{items.filter(i => i.active).map(i => <Card key={i.id} />)}

// ✅ Good - filter once in useMemo
const activeItems = useMemo(() => 
  items.filter(i => i.active), 
  [items]
);
{activeItems.map(i => <Card key={i.id} />)}
```

---

## Testing Guidelines

### Component Tests
Focus on:
1. Renders without data (null/undefined props)
2. Renders with empty data (empty arrays)
3. Renders with valid data
4. Handles user interactions (button clicks)
5. Calculates derived metrics correctly

### Example Test Structure:
```javascript
describe('Financials Component', () => {
  it('renders without crashing with no data', () => {
    render(<Financials appData={{}} />);
  });
  
  it('calculates cash runway correctly', () => {
    const mockData = {
      balance_sheet: { cash: 100000 },
      company_overview: { admin_overhead: 100 }
    };
    const { getByText } = render(<Financials appData={mockData} />);
    expect(getByText(/41.7 days/)).toBeInTheDocument();
  });
});
```

---

## Maintenance Log

**Last Updated**: December 28, 2024  
**Changes**:
- Removed duplicate Retail Arbitrage Scanner from Financials
- Added TradeAnalysis component documentation
- Updated data flow diagrams

**Version**: 1.0
