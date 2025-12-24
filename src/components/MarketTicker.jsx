import React, { useState, useEffect } from 'react';
import './MarketTicker.css';

const MarketTicker = () => {
  const [marketData, setMarketData] = useState([]);

  useEffect(() => {
    fetch('/api/realms/0/market/prices')
      .then(response => response.json())
      .then(data => {
        // We only need a few items for the ticker
        const tickerData = data.slice(0, 20);
        setMarketData(tickerData);
      })
      .catch(error => console.error("Failed to fetch market data:", error));
  }, []);

  return (
    <div className="market-ticker-container glass-panel rounded-full">
      <div className="market-ticker">
        {marketData.map((item, index) => (
          <div key={index} className="ticker-item">
            <span className="item-name">{item.kind}.</span>
            <span className="item-price">${item.price.toFixed(3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;
