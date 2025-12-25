// Google Sheets API Service
// Fetches data from Google Sheets with proper structure for historical vs. current datasets

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

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
  COMPANY_LEVELS: 'Company Levels Current'
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
 * Fetches a single sheet from Google Sheets
 */
async function fetchSheet(sheetName) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${sheetName}: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return sheetsToObjects(data.values || []);
}

/**
 * Fetches multiple sheets in parallel
 */
async function fetchMultipleSheets(sheetNames) {
  const promises = sheetNames.map(name => 
    fetchSheet(name).catch(err => {
      console.warn(`[GoogleSheetsService] Failed to fetch ${name}:`, err.message);
      return [];
    })
  );
  
  return Promise.all(promises);
}

/**
 * Main function: Fetches all data from Google Sheets and structures it for the dashboard
 */
export async function fetchDataFromGoogleSheets() {
  if (!SHEET_ID || !API_KEY) {
    throw new Error('Google Sheets credentials not configured. Set VITE_GOOGLE_SHEET_ID and VITE_GOOGLE_SHEETS_API_KEY in .env');
  }

  console.log('[GoogleSheetsService] Fetching data from Google Sheets...');

  try {
    // Fetch all sheets in parallel
    const [
      balanceSheetHistory,
      cashflowHistory,
      incomeHistory,
      economicPhases,
      governmentOrders,
      randomEvents,
      realmData,
      financialRatios,
      ccmOverview,
      warehouseSnapshot,
      buildingsSnapshot,
      companyLevels
    ] = await fetchMultipleSheets([
      SHEETS.BALANCE_SHEET,
      SHEETS.CASHFLOW,
      SHEETS.INCOME,
      SHEETS.ECONOMIC_PHASES,
      SHEETS.GOVERNMENT_ORDERS,
      SHEETS.RANDOM_EVENTS,
      SHEETS.REALM_DATA,
      SHEETS.FINANCIAL_RATIOS,
      SHEETS.CCM_OVERVIEW,
      SHEETS.WAREHOUSE,
      SHEETS.BUILDINGS,
      SHEETS.COMPANY_LEVELS
    ]);

    // Get latest records from historical datasets (last 90 days or last N records)
    const getLatest = (arr, count = 90) => arr.slice(-count);
    const getMostRecent = (arr) => arr[arr.length - 1] || {};

    // Structure data to match existing dashboard format
    const structuredData = {
      // Company overview from latest CCM Overview record
      company_overview: {
        ranking: parseInt(getMostRecent(ccmOverview)['Ranking'] || 0),
        rating: getMostRecent(ccmOverview)['Rating'] || 'N/A',
        company_value: parseFloat(getMostRecent(ccmOverview)['Company Value'] || 0),
        buildings_value: parseFloat(getMostRecent(ccmOverview)['Buildings Value'] || 0),
        level: parseInt(getMostRecent(ccmOverview)['Level'] || 0),
        max_buildings: getMostRecent(ccmOverview)['Max Buildings'] || '0',
        admin_overhead: parseFloat(getMostRecent(ccmOverview)['Admin Overhead'] || 0)
      },

      // Balance sheet from latest record
      balance_sheet: {
        timestamp: getMostRecent(balanceSheetHistory)['Timestamp'] || new Date().toISOString(),
        cash: parseFloat(getMostRecent(balanceSheetHistory)['Cash'] || 0),
        accounts_receivable: parseFloat(getMostRecent(balanceSheetHistory)['Accounts Receivable'] || 0),
        inventory_materials: parseFloat(getMostRecent(balanceSheetHistory)['Inventory Materials'] || 0),
        inventory_finished_goods: parseFloat(getMostRecent(balanceSheetHistory)['Inventory Finished Goods'] || 0),
        inventory_valuation_allowance: parseFloat(getMostRecent(balanceSheetHistory)['Inventory Valuation Allowance'] || 0),
        buildings: parseFloat(getMostRecent(balanceSheetHistory)['Buildings'] || 0),
        contributed_capital: parseFloat(getMostRecent(balanceSheetHistory)['Contributed Capital'] || 0),
        retained_earnings: parseFloat(getMostRecent(balanceSheetHistory)['Retained Earnings'] || 0)
      },

      // Balance sheet history (last 90 days for charting)
      balance_sheet_history: getLatest(balanceSheetHistory, 90).map(row => ({
        date: row['Date'] || row['Timestamp'],
        cash: parseFloat(row['Cash'] || 0),
        accounts_receivable: parseFloat(row['Accounts Receivable'] || 0),
        inventory_materials: parseFloat(row['Inventory Materials'] || 0),
        total_assets: parseFloat(row['Total Assets'] || 0),
        retained_earnings: parseFloat(row['Retained Earnings'] || 0)
      })),

      // Income statement history
      income_statement_history: getLatest(incomeHistory, 90).map(row => ({
        date: row['Date'] || row['Timestamp'],
        sales: parseFloat(row['Sales'] || 0),
        cogs: parseFloat(row['COGS'] || 0),
        gross_profit: parseFloat(row['Gross Profit'] || 0),
        operating_expenses: parseFloat(row['Operating Expenses'] || 0),
        net_income: parseFloat(row['Net Income'] || 0)
      })),

      // Cashflow statement history
      cashflow_history: getLatest(cashflowHistory, 90).map(row => ({
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
        value: parseFloat(row['Total Value'] || 0)
      })),

      // Economic phases (historical for context overlay)
      economic_phases: economicPhases.map(row => ({
        phase: row['Phase'],
        start_date: row['Start Date'],
        end_date: row['End Date'],
        duration_days: parseInt(row['Duration (Days)'] || 0)
      })),

      // Financial ratios (latest)
      financial_ratios: {
        current_ratio: parseFloat(getMostRecent(financialRatios)['Current Ratio'] || 0),
        quick_ratio: parseFloat(getMostRecent(financialRatios)['Quick Ratio'] || 0),
        debt_to_equity: parseFloat(getMostRecent(financialRatios)['Debt to Equity'] || 0),
        roe: parseFloat(getMostRecent(financialRatios)['ROE'] || 0),
        roa: parseFloat(getMostRecent(financialRatios)['ROA'] || 0),
        gross_margin: parseFloat(getMostRecent(financialRatios)['Gross Margin'] || 0),
        operating_margin: parseFloat(getMostRecent(financialRatios)['Operating Margin'] || 0),
        net_margin: parseFloat(getMostRecent(financialRatios)['Net Margin'] || 0)
      },

      // Government orders (active/recent)
      government_orders: getLatest(governmentOrders, 20).map(row => ({
        order_id: row['Order ID'],
        project_name: row['Project Name'],
        creation_date: row['Creation Date'],
        days_to_fulfill: parseInt(row['Days to Fulfill'] || 0),
        resources_required: row['Resources Required']
      })),

      // Buildings snapshot
      buildings_snapshot: buildingsSnapshot.map(row => ({
        building_type: row['Building Type'],
        quantity: parseInt(row['Quantity'] || 0),
        proportion: parseFloat(row['Proportion'] || 0)
      })),

      // Company levels reference
      company_levels: companyLevels.map(row => ({
        level: parseInt(row['Level'] || 0),
        xp_required: parseInt(row['XP Required'] || 0),
        benefits: row['Benefits']
      })),

      // Keep existing manual-input fields (operations, long_term_goals, etc.)
      // These will be merged from static data or manual input
      operations: {
        short_term: [], // Manually updated (not in Sheets)
        medium_term_strategy: '' // Manually updated
      },
      
      long_term_goals: {}, // Manually updated
      
      commodities: {}, // Partially manual, partially API

      last_updated: new Date().toISOString()
    };

    console.log('[GoogleSheetsService] Successfully fetched and structured data from Google Sheets');
    return structuredData;

  } catch (error) {
    console.error('[GoogleSheetsService] Error fetching from Google Sheets:', error);
    throw error;
  }
}
