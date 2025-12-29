// Google Sheets API Service
// Fetches data from Google Sheets with proper structure for historical vs. current datasets

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

// localStorage key for cached data
const CACHE_KEY = 'ccm_dashboard_data';
const CACHE_TIMESTAMP_KEY = 'ccm_dashboard_data_timestamp';

// Sheet tab names mapping to your Google Sheet
const SHEETS = {
  // Historical datasets (multi-row, time-series data)
  BALANCE_SHEET: 'Balance Sheet Historical',
  CASHFLOW: 'Cashflow Statement Historical',
  INCOME: 'Income Statement Historical',
  ECONOMIC_PHASES: 'Economic Phases Historical',
  GOVERNMENT_ORDERS: 'Government Orders Historical',
  RANDOM_EVENTS: 'Random Events Historical',
  REALM_DATA: 'Realm Data Historical',
  FINANCIAL_RATIOS: 'Financial Ratios Historical',
  CCM_OVERVIEW: 'CCM Overview Historical',
  
  // Current/snapshot datasets (single or latest state)
  WAREHOUSE: 'Warehouse Current',
  BUILDINGS: 'Buildings Current',
  COMPANY_LEVELS: 'Company Levels Current',
  
  // New required sheets for dashboard features
  ACTIVE_OPERATIONS: 'Active Operations Current',
  STRATEGIC_GOALS: 'Strategic Goals Current',
  STRATEGY_NOTES: 'Strategy Notes Current',
  TRANSACTION_HISTORY: 'Transaction History',
  
  // Retail market analysis
  RETAIL_RESEARCH: 'Retail Research'
};

/**
 * Converts Google Sheets range data to array of objects
 * First row is treated as headers
 */
function sheetsToObjects(values) {
  if (!values || values.length === 0) return [];
  
  const headers = values[0];
  const rows = values.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || null;
    });
    return obj;
  });
}

/**
 * Converts transposed Google Sheets data to array of objects
 * First column is metric names, subsequent columns are dates
 * Used for sheets like Financial Ratios where dates are column headers
 */
function transposedSheetsToObjects(values) {
  if (!values || values.length < 2) return [];
  
  const dateRow = values[0]; // First row contains dates
  const dates = dateRow.slice(1).filter(d => d && d.trim()); // Skip first cell, get date columns
  
  // Create an object for each date column
  const result = dates.map((date, dateIndex) => {
    const obj = { Date: date };
    
    // Iterate through metric rows (skip header row)
    for (let rowIndex = 1; rowIndex < values.length; rowIndex++) {
      const row = values[rowIndex];
      const metricName = row[0]; // First cell is metric name
      const value = row[dateIndex + 1]; // +1 because first column is metric name
      
      if (metricName && metricName.trim()) {
        obj[metricName] = value || null;
      }
    }
    
    return obj;
  });
  
  return result;
}

/**
 * Robust number parser - handles currency symbols, commas, and empty values
 * Strips $, commas, and whitespace before parsing
 */
function parseNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  
  // Strip currency symbols, commas, and whitespace
  const cleaned = String(value)
    .replace(/[$,\s]/g, '')
    .trim();
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Get the most recent non-empty value from transposed data array
 * Transposed data is ordered left-to-right (oldest to newest), so search backwards
 */
function getMostRecentValue(dataArray, fieldName, defaultValue = 0) {
  // Search from end of array backwards (newest to oldest)
  for (let i = dataArray.length - 1; i >= 0; i--) {
    const value = dataArray[i]?.[fieldName];
    if (value !== null && value !== undefined && value !== '') {
      return parseNumber(value);
    }
  }
  return defaultValue;
}

/**
 * Exponential backoff retry logic
 */
async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      
      if (response.status === 429 && i < retries - 1) {
        // Rate limited - wait with exponential backoff
        const waitTime = delay * Math.pow(2, i);
        console.warn(`[GoogleSheetsService] Rate limited. Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[GoogleSheetsService] HTTP ${response.status} error:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      const waitTime = delay * Math.pow(2, i);
      console.warn(`[GoogleSheetsService] Request failed. Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

/**
 * Fetch all sheets in a SINGLE API call using batchGet
 */
async function fetchAllSheets() {
  // Build ranges array for all sheets - URL encode properly
  const ranges = Object.values(SHEETS).map(sheetName => encodeURIComponent(sheetName));
  
  // Use batchGet endpoint - ONE API CALL for all sheets
  const rangesParam = ranges.join('&ranges=');
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchGet?ranges=${rangesParam}&key=${API_KEY}`;
  
  const response = await fetchWithRetry(url);
  const data = await response.json();
  
  // Convert to map of sheet name -> parsed data
  const sheetsData = {};
  data.valueRanges.forEach((range, index) => {
    const sheetName = Object.values(SHEETS)[index];
    
    // Use transposed parser for sheets with dates as columns
    if (sheetName === SHEETS.FINANCIAL_RATIOS || sheetName === SHEETS.CCM_OVERVIEW) {
      sheetsData[sheetName] = transposedSheetsToObjects(range.values);
    } else {
      sheetsData[sheetName] = sheetsToObjects(range.values);
    }
  });
  
  return sheetsData;
}

/**
 * Load data from localStorage cache
 */
export function loadCachedData() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (cached && timestamp) {
      const data = JSON.parse(cached);
      const age = Date.now() - parseInt(timestamp);
      const ageMinutes = Math.floor(age / 60000);
      
      console.log(`[GoogleSheetsService] Loaded cached data (${ageMinutes} minutes old)`);
      return data;
    }
  } catch (error) {
    console.warn('[GoogleSheetsService] Failed to load cached data:', error);
  }
  return null;
}

/**
 * Main function: Fetches all data from Google Sheets and structures it for the dashboard
 * Now uses a SINGLE API call via batchGet endpoint
 */
export async function fetchDataFromGoogleSheets(forceRefresh = false) {
  if (!SHEET_ID || !API_KEY) {
    throw new Error('Google Sheets credentials not configured. Set VITE_GOOGLE_SHEET_ID and VITE_GOOGLE_SHEETS_API_KEY in .env');
  }

  // Return cached data unless forcing refresh
  if (!forceRefresh) {
    const cached = loadCachedData();
    if (cached) return cached;
  }

  console.log('[GoogleSheetsService] Fetching data from Google Sheets (1 API call)...');

  try {
    // Fetch ALL sheets in ONE API call using batchGet
    const sheetsData = await fetchAllSheets();
    
    // Destructure the data
    const balanceSheetHistory = sheetsData[SHEETS.BALANCE_SHEET] || [];
    const cashflowHistory = sheetsData[SHEETS.CASHFLOW] || [];
    const incomeHistory = sheetsData[SHEETS.INCOME] || [];
    const economicPhases = sheetsData[SHEETS.ECONOMIC_PHASES] || [];
    const governmentOrders = sheetsData[SHEETS.GOVERNMENT_ORDERS] || [];
    const randomEvents = sheetsData[SHEETS.RANDOM_EVENTS] || [];
    const realmData = sheetsData[SHEETS.REALM_DATA] || [];
    const financialRatios = sheetsData[SHEETS.FINANCIAL_RATIOS] || [];
    const ccmOverview = sheetsData[SHEETS.CCM_OVERVIEW] || [];
    const warehouseSnapshot = sheetsData[SHEETS.WAREHOUSE] || [];
    const buildingsSnapshot = sheetsData[SHEETS.BUILDINGS] || [];
    const companyLevels = sheetsData[SHEETS.COMPANY_LEVELS] || [];
    const activeOperations = sheetsData[SHEETS.ACTIVE_OPERATIONS] || [];
    const strategicGoals = sheetsData[SHEETS.STRATEGIC_GOALS] || [];
    const strategyNotes = sheetsData[SHEETS.STRATEGY_NOTES] || [];
    const transactionHistory = sheetsData[SHEETS.TRANSACTION_HISTORY] || [];
    const retailResearch = sheetsData[SHEETS.RETAIL_RESEARCH] || [];

    // Get latest records from historical datasets (CSVs are newest-first)
    const getLatest = (arr, count = 90) => arr.slice(0, count);
    const getMostRecent = (arr) => arr[0] || {};

    // Structure data to match existing dashboard format
    const structuredData = {
      // Company overview from latest CCM Overview record (transposed data, newest first)
      company_overview: {
        ranking: getMostRecentValue(ccmOverview, 'Ranking', 0),
        rating: ccmOverview[0]?.['Rating'] || 'N/A',
        company_value: getMostRecentValue(ccmOverview, 'Company value', 0),
        buildings_value: getMostRecentValue(ccmOverview, 'Buildings value', 0),
        level: getMostRecentValue(ccmOverview, 'Level', 0),
        max_buildings: ccmOverview[0]?.['Max Buildings'] || '0',
        admin_overhead: getMostRecentValue(ccmOverview, 'Administration overhead', 0)
      },

      // Balance sheet from latest record
      balance_sheet: {
        timestamp: getMostRecent(balanceSheetHistory)['Timestamp'] || new Date().toISOString(),
        cash: getMostRecentValue(ccmOverview, 'Cash', 0), // From CCM Overview (most recent non-empty)
        accounts_receivable: parseFloat(getMostRecent(balanceSheetHistory)['Accounts Receivable'] || 0),
        inventory_materials: parseFloat(getMostRecent(balanceSheetHistory)['Inventory - materials'] || 0),
        inventory_finished_goods: parseFloat(getMostRecent(balanceSheetHistory)['Inventory - finished goods'] || 0),
        inventory_valuation_allowance: parseFloat(getMostRecent(balanceSheetHistory)['Inventory - valuation allowance'] || 0),
        buildings: parseFloat(getMostRecent(balanceSheetHistory)['Buildings'] || 0),
        contributed_capital: parseFloat(getMostRecent(balanceSheetHistory)['Contributed Capital'] || 0),
        retained_earnings: parseFloat(getMostRecent(balanceSheetHistory)['Retained Earnings'] || 0)
      },

      // Balance sheet history (last 90 days for charting)
      balance_sheet_history: balanceSheetHistory.slice(0, 90).map(row => ({
        date: row['Timestamp'],
        cash: parseFloat(row['Cash'] || 0),
        accounts_receivable: parseFloat(row['Accounts Receivable'] || 0),
        inventory_materials: parseFloat(row['Inventory - materials'] || 0),
        total_assets: parseFloat(row['Cash'] || 0) + parseFloat(row['Accounts Receivable'] || 0) + parseFloat(row['Inventory - materials'] || 0) + parseFloat(row['Buildings'] || 0),
        retained_earnings: parseFloat(row['Retained Earnings'] || 0)
      })),

      // Income statement history (first 90 records, newest-first)
      income_statement_history: incomeHistory.slice(0, 90).map(row => ({
        date: row['Date'] || row['Timestamp'],
        sales: parseFloat(row['Sales'] || 0),
        cogs: parseFloat(row['COGS'] || 0),
        gross_profit: parseFloat(row['Gross Profit'] || 0),
        operating_expenses: parseFloat(row['Operating Expenses'] || 0),
        net_income: parseFloat(row['Net Income'] || 0)
      })),

      // Cashflow statement history (first 90 records, newest-first)
      cashflow_history: cashflowHistory.slice(0, 90).map(row => ({
        date: row['Date'] || row['Timestamp'],
        operating_cashflow: parseFloat(row['Operating Cashflow'] || 0),
        investing_cashflow: parseFloat(row['Investing Cashflow'] || 0),
        financing_cashflow: parseFloat(row['Financing Cashflow'] || 0),
        net_cashflow: parseFloat(row['Net Cashflow'] || 0)
      })),

      // Warehouse inventory (current snapshot)
      inventory: warehouseSnapshot.map(row => ({
        resource: row['Resource'],
        quality: parseInt(row['Quality'] || 0),
        amount: parseFloat(row['Amount'] || 0),
        cost_labor: parseFloat(row['Cost labor'] || 0),
        cost_management: parseFloat(row['Cost management'] || 0),
        cost_3rd_party: parseFloat(row['Cost 3rd party'] || 0),
        value: parseFloat(row['Cost labor'] || 0) + parseFloat(row['Cost management'] || 0) + parseFloat(row['Cost 3rd party'] || 0) + 
               parseFloat(row['Cost material 1'] || 0) + parseFloat(row['Cost material 2'] || 0) + parseFloat(row['Cost material 3'] || 0)
      })),

      // Economic phases (historical for context overlay)
      economic_phases: economicPhases.map(row => ({
        phase: row['game.phase'] || row['Phase'],
        start_date: row['start'] || row['Start Date'],
        end_date: row['end'] || row['End Date'],
        duration_days: parseInt(row['days'] || row['Duration (Days)'] || 0),
        duration_weeks: parseFloat(row['weeks'] || row['Duration (Weeks)'] || 0),
        phase_code: parseInt(row['phase.code'] || row['Phase Code'] || 0) // -1=recession, 0=normal, 1=boom
      })),

      // Financial ratios (latest non-empty values from transposed data)
      financial_ratios: {
        gross_margin: getMostRecentValue(financialRatios, 'Gross Margin (%)', 0),
        operating_margin: getMostRecentValue(financialRatios, 'Operating Margin (%)', 0),
        net_margin: getMostRecentValue(financialRatios, 'Net Profit Margin (%)', 0),
        roe: getMostRecentValue(financialRatios, 'Return on Equity (%)', 0),
        roa: getMostRecentValue(financialRatios, 'Return on Quick Assets (%)', 0),
        inventory_turnover: getMostRecentValue(financialRatios, 'Inventory Turnover (1:)', 0),
        assets_turnover: getMostRecentValue(financialRatios, 'Assets Turnover (1:)', 0),
        debt_to_building: getMostRecentValue(financialRatios, 'Debt to Building Ratio (%)', 0)
      },

      // Random events
      random_events: randomEvents.map(row => ({
        event_name: row['Resource'] || row['Event Name'],
        date: row['Since'] || row['Date'],
        impact: row['Speed modifier'] || row['Impact'],
        building: row['buildings'] || '',
        until_date: row['Until'] || '',
        description: `${row['buildings'] || row['Description']} (Until: ${row['Until'] || 'N/A'})`
      })),

      // Government orders (all of them since CSV is already newest-first)
      government_orders: governmentOrders.map(row => ({
        order_id: row['Order ID'],
        project_name: row['Project Name'],
        creation_date: row['Creation Date'],
        days_to_fulfill: parseInt(row['Days to Fulfill'] || 0),
        resources_required: row['Resources'] || row['Resources Required']
      })),

      // Buildings snapshot
      buildings_snapshot: buildingsSnapshot.map(row => ({
        building_type: row['Building Type'],
        quantity: parseInt(row['Quantity'] || 0),
        proportion: parseFloat(row['Proportion'] || 0)
      })),

      // Operations data from sheets
      operations: {
        short_term: activeOperations.map(row => ({
          building: row['Building'],
          type: row['Type'],
          product: row['Product'],
          quantity: parseNumber(row['Quantity']),
          sourcing_value: parseNumber(row['Sourcing Value']),
          quality: parseNumber(row['Quality']),
          cost_per_unit: parseNumber(row['Cost Per Unit']),
          finish_time: row['Finish Time'],
          price: parseNumber(row['Price']),
          projected_revenue: parseNumber(row['Projected Revenue'])
        })),
        medium_term_strategy: strategyNotes.find(row => row['Type'] === 'Medium Term')?.['Content'] || ''
      },
      
      long_term_goals: strategicGoals.reduce((acc, row) => {
        const goalId = (row['Goal ID'] || '').toLowerCase().replace(/\s+/g, '_');
        if (goalId) {
          let requirements = {};
          try {
            if (row['Requirements (JSON)']) {
              requirements = JSON.parse(row['Requirements (JSON)']);
            }
          } catch (jsonError) {
            console.error(`[GoogleSheetsService] Invalid JSON in Strategic Goals row "${row['Label']}" (Goal ID: ${row['Goal ID']}):`, jsonError.message);
            console.error('Problematic JSON string:', row['Requirements (JSON)']);
            // Continue with empty requirements object
          }
          
          acc[goalId] = {
            label: row['Label'],
            total_cost: parseFloat(row['Total Cost'] || 0),
            cost_inflation: parseFloat(row['Cost Inflation'] || 0),
            status: row['Status'],
            benefit: row['Benefit'],
            requirements: requirements
          };
        }
        return acc;
      }, {}),
      
      current_buildings_owned: activeOperations.map(row => ({
        building_name: row['Building'],
        building_type: row['Type'],
        level: parseInt(row['Level'] || 1)
      })),
      
      // Retail research data from Google Sheets (replaces Commodity Analysis)
      commodity_analysis: retailResearch.map(row => ({
        commodity: row['Name'],
        date: new Date().toISOString(),
        priority: row['Priority'],
        market_price: parseFloat(row['Market Price'] || 0),
        average_retail_price: parseFloat(row['Retail Price'] || 0),
        quality: 0,
        sourcing_cost_per_unit: 0,
        water_per_unit: 0,
        power_per_unit: 0,
        seeds_per_unit: 0,
        diesel_per_unit: 0,
        gold_ore_per_unit: 0,
        production_units_per_hour: 0,
        production_wages_per_hour: 0,
        worker_cost_per_unit: 0,
        admin_cost_per_unit: 0,
        units_sold_an_hour: 0,
        revenue_per_unit: parseFloat(row['Projected Revenue'] || 0),
        dependency_buildings: row['Dependent Building'],
        notes: row['Notes']
      })),
      
      // Legacy commodities object (for backward compatibility)
      commodities: {},

      transaction_summary: {
        recent_transactions: transactionHistory.slice(0, 20).map(row => ({
          id: row['id'],
          timestamp: row['Timestamp'],
          category: row['Category'],
          amount: parseFloat(row['Money'] || 0),
          description: row['Description']
        })),
        // Calculate aggregates from transaction history
        daily_cash_flow: [], // Calculated from transactions if needed
        revenue_breakdown: {}, // Calculated from transactions if needed
        expense_breakdown: {} // Calculated from transactions if needed
      },

      last_updated: new Date().toISOString()
    };

    console.log('[GoogleSheetsService] Successfully fetched and structured data from Google Sheets');
    
    // Cache in localStorage
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(structuredData));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      console.log('[GoogleSheetsService] Data cached to localStorage');
    } catch (error) {
      console.warn('[GoogleSheetsService] Failed to cache data:', error);
    }
    
    return structuredData;

  } catch (error) {
    console.error('[GoogleSheetsService] Error fetching from Google Sheets:', error);
    
    // Fallback to cached data if available
    const cached = loadCachedData();
    if (cached) {
      console.warn('[GoogleSheetsService] Using stale cached data due to fetch error');
      return cached;
    }
    
    throw error;
  }
}
