import React, { useState, useEffect } from 'react';
import './MarketTicker.css';

const MarketTicker = ({ commodityFilter = [], commodityData = [] }) => {
  const [marketData, setMarketData] = useState([]);

  useEffect(() => {
    // Use commodity_analysis data from Google Sheets
    if (commodityData && commodityData.length > 0) {
      let tickerData = commodityData
        .filter(item => item.market_price > 0) // Only show items with market prices
        .map(item => {
          const daysOld = item.date ? Math.floor((new Date() - new Date(item.date)) / (1000 * 60 * 60 * 24)) : 0;
          return {
            kind: item.commodity,
            price: item.market_price,
            date: item.date,
            daysOld: daysOld,
            isStale: daysOld > 7
          };
        })
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
      
      setMarketData(tickerData);
    }
  }, [commodityData, commodityFilter]);

  return (
    <div className="market-ticker-container glass-panel rounded-full">
      <div className="market-ticker">
        {marketData.map((item, index) => (
          <div 
            key={index} 
            className={`ticker-item ${item.isStale ? 'opacity-50' : ''}`}
            title={item.date ? `Last updated: ${item.date} (${item.daysOld} days ago)` : 'No date available'}
          >
            <span className="item-name">{item.kind}.</span>
            <span className="item-price">
              ${typeof item.price === 'number' 
                ? item.price.toFixed(2) 
                : parseFloat(item.price || 0).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;
