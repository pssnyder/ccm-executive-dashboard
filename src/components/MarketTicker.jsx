import React, { useState, useEffect } from 'react';
import './MarketTicker.css';

const CACHE_KEY = 'market_data_cache';
const CACHE_TIMESTAMP_KEY = 'market_data_timestamp';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

const MarketTicker = ({ commodityFilter = [] }) => {
  const [marketData, setMarketData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/realms/0/market/prices');
      
      // Check if response is JSON (not HTML error page)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('[MarketTicker] API unavailable (CORS or endpoint issue). Using cached data only.');
        return;
      }
      
      const data = await response.json();
      
      // Convert object to array and filter
      let tickerData = Object.entries(data || {})
        .map(([kind, priceData]) => ({
          kind,
          price: typeof priceData === 'object' ? priceData.price : priceData
        }))
        .filter(item => {
          // If we have a commodity filter, only show those commodities
          if (commodityFilter.length > 0) {
            return commodityFilter.some(c => 
              c.toLowerCase() === item.kind.toLowerCase()
            );
          }
          return true;
        })
        .slice(0, 20);
      
      // Cache the data
      localStorage.setItem(CACHE_KEY, JSON.stringify(tickerData));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      setMarketData(tickerData);
      setLastUpdated(new Date());
      console.log('[MarketTicker] Fetched fresh market data');
    } catch (error) {
      // Silently fail - market ticker is non-critical
      console.warn('[MarketTicker] API unavailable. Using cached data only.');
    }
  };

  const loadCachedData = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        
        if (age < CACHE_DURATION) {
          setMarketData(JSON.parse(cached));
          setLastUpdated(new Date(parseInt(timestamp)));
          console.log('[MarketTicker] Using cached market data');
          return true;
        }
      }
    } catch (error) {
      console.warn('[MarketTicker] Failed to load cached data:', error);
    }
    return false;
  };

  useEffect(() => {
    // Try to load cached data first
    const hasCached = loadCachedData();
    
    // If no cache or expired, fetch fresh data
    if (!hasCached) {
      fetchMarketData();
    }
    
    // Set up auto-refresh every hour
    const interval = setInterval(() => {
      fetchMarketData();
    }, CACHE_DURATION);
    
    return () => clearInterval(interval);
  }, [commodityFilter]);

  return (
    <div className="market-ticker-container glass-panel rounded-full">
      <div className="market-ticker">
        {marketData.map((item, index) => (
          <div key={index} className="ticker-item">
            <span className="item-name">{item.kind}.</span>
            <span className="item-price">
              ${typeof item.price === 'number' 
                ? item.price.toFixed(3) 
                : parseFloat(item.price || 0).toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;
