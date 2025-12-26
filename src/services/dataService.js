// Data Service Layer - Provides fallback cascade for data fetching
// Cascade order: localStorage Cache → Google Sheets API (manual refresh) → Embedded Static

import staticData from '../../analytical_layer/core_reporting.json';
import { fetchDataFromGoogleSheets, loadCachedData } from './googleSheetsService';

/**
 * Merges Google Sheets data with static/manual data
 * Google Sheets data takes priority - static data is only used as fallback
 */
function mergeWithStaticData(sheetsData) {
  return {
    ...sheetsData,
    // Use Google Sheets data if available, fallback to static only if missing
    operations: sheetsData.operations || staticData.operations,
    long_term_goals: sheetsData.long_term_goals || staticData.long_term_goals,
    commodities: sheetsData.commodities || staticData.commodities,
    transaction_summary: sheetsData.transaction_summary || staticData.transaction_summary
  };
}

/**
 * Fetches application data with automatic fallback cascade
 * @param {boolean} forceRefresh - If true, forces fetch from Google Sheets
 * @returns {Promise<Object>} Application data object
 */
export async function fetchAppData(forceRefresh = false) {
  // If forcing refresh, fetch from Google Sheets
  if (forceRefresh) {
    try {
      const sheetsData = await fetchDataFromGoogleSheets(true);
      const mergedData = mergeWithStaticData(sheetsData);
      console.log('[DataService] Refreshed data from Google Sheets');
      return mergedData;
    } catch (error) {
      console.error('[DataService] Failed to refresh from Google Sheets:', error);
      // Fall through to cache/static
    }
  }

  // Try localStorage cache first
  const cachedData = loadCachedData();
  if (cachedData) {
    const mergedData = mergeWithStaticData(cachedData);
    console.log('[DataService] Using cached data');
    return mergedData;
  }

  // Try Google Sheets if no cache exists (first load)
  try {
    const sheetsData = await fetchDataFromGoogleSheets(false);
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
