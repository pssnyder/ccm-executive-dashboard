// api.js

const API_BASE_URL = 'https://api.simcotools.com/v1';
const REALM = 'entrepreneurs'; // Assuming this is the realm, we can make it dynamic later.

/**
 * Fetches the latest market prices for a given resource.
 * @param {string} resource - The name of the resource to fetch (e.g., 'oranges').
 * @returns {Promise<object>} A promise that resolves to the price data.
 */
async function getPrice(resource) {
    try {
        const response = await fetch(`${API_BASE_URL}/realms/${REALM}/market/prices/${resource}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching price for ${resource}:`, error);
        return null;
    }
}
