// Data Service Layer - Provides fallback cascade for data fetching
// Cascade order: Google Sheets API → Local JSON → Embedded Static → Error

import staticData from '../../analytical_layer/core_reporting.json';
import { fetchDataFromGoogleSheets } from './googleSheetsService';

/**
 * Merges Google Sheets data with static/manual data
 * Google Sheets provides: financials, inventory, historical data
 * Static data provides: operations (short_term), long_term_goals, commodities
 */
function mergeWithStaticData(sheetsData) {
  return {
    ...sheetsData,
    // Preserve manually-managed fields from static data
    operations: staticData.operations || sheetsData.operations,
    long_term_goals: staticData.long_term_goals || sheetsData.long_term_goals,
    commodities: staticData.commodities || sheetsData.commodities,
    transaction_summary: staticData.transaction_summary || sheetsData.transaction_summary
  };
}

/**
 * Fetches application data with automatic fallback cascade
 * @returns {Promise<Object>} Application data object
 */
export async function fetchAppData() {
  // Try Google Sheets first (if configured)
  try {
    const sheetsData = await fetchDataFromGoogleSheets();
    const mergedData = mergeWithStaticData(sheetsData);
    console.log('[DataService] Loaded data from Google Sheets');
    return mergedData;
  } catch (error) {
    console.warn('[DataService] Google Sheets unavailable, trying local JSON:', error.message);
  }

  // Fallback to local JSON (dev environment)
  try {
    const response = await fetch('/analytical_layer/core_reporting.json');
    
    if (response.ok) {
      const data = await response.json();
      console.log('[DataService] Loaded data from local JSON file');
      return data;
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.warn('[DataService] Local JSON unavailable, using embedded static data:', error.message);
  }

  // Final fallback to embedded static data (production scenario)
  console.log('[DataService] Using embedded static data');
  return staticData;
}

/**
 * Future: Fetch from Firestore with fallback cascade
 * Uncomment and implement when Firebase is configured
 */
// export async function fetchAppDataFromFirestore() {
//   try {
//     // Try Firestore first
//     const doc = await getDoc(doc(db, 'companies', 'cassandra-capital'));
//     if (doc.exists()) {
//       console.log('[DataService] Loaded data from Firestore');
//       return doc.data();
//     }
//   } catch (error) {
//     console.warn('[DataService] Firestore unavailable, falling back:', error.message);
//   }
//   
//   // Fallback to fetchAppData (which has its own cascade)
//   return fetchAppData();
// }
