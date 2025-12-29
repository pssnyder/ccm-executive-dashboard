import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MarketTiming = ({ appData }) => {
  const marketHistory = appData?.market_history || [];
  
  // Group data by commodity for trend analysis
  const commodityTrends = useMemo(() => {
    const grouped = {};
    
    marketHistory.forEach(row => {
      const key = row.resource_name;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(row);
    });
    
    // Sort each commodity's data by date
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });
    
    return grouped;
  }, [marketHistory]);
  
  // Get latest snapshot for each commodity
  const latestPrices = useMemo(() => {
    const latest = {};
    
    Object.entries(commodityTrends).forEach(([commodity, data]) => {
      if (data.length > 0) {
        latest[commodity] = data[data.length - 1];
      }
    });
    
    return Object.values(latest).sort((a, b) => a.saturation - b.saturation);
  }, [commodityTrends]);
  
  // Calculate buy signals based on saturation
  const getBuySignal = (saturation) => {
    if (saturation < 40) return { label: 'STRONG BUY', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (saturation < 60) return { label: 'BUY', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (saturation < 80) return { label: 'HOLD', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (saturation < 100) return { label: 'CAUTION', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { label: 'AVOID', color: 'text-red-400', bg: 'bg-red-500/20' };
  };
  
  // Format price for display
  const formatPrice = (price) => {
    return price >= 1000 ? `$${(price / 1000).toFixed(1)}k` : `$${price.toFixed(2)}`;
  };
  
  // Calculate margin
  const calculateMargin = (retailPrice, marketPrice) => {
    return retailPrice - marketPrice;
  };
  
  // Calculate ROI percentage
  const calculateROI = (retailPrice, marketPrice) => {
    if (marketPrice === 0) return 0;
    return ((retailPrice - marketPrice) / marketPrice) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="gradient-card p-6">
        <h2 className="text-2xl font-bold text-slate-200 mb-2">Market Timing & Supply Analysis</h2>
        <p className="text-slate-400 text-sm">
          Track market prices, retail saturation, and identify optimal buying opportunities based on supply/demand dynamics.
        </p>
      </div>

      {/* Current Market Snapshot */}
      <div className="gradient-card p-6">
        <h3 className="text-xl font-bold text-slate-200 mb-4">Current Market Snapshot</h3>
        
        {latestPrices.length === 0 ? (
          <div className="glass-panel p-8 text-center">
            <p className="text-slate-400">No market data available</p>
            <p className="text-slate-500 text-sm mt-2">
              Run <code className="bg-slate-800 px-2 py-1 rounded">collect-market-history.ps1</code> to collect price data
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Commodity</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-semibold">Market Price</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-semibold">Retail Price</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-semibold">Margin</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-semibold">ROI</th>
                  <th className="text-center py-3 px-4 text-slate-300 font-semibold">Saturation</th>
                  <th className="text-center py-3 px-4 text-slate-300 font-semibold">Signal</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Last Update</th>
                </tr>
              </thead>
              <tbody>
                {latestPrices.map((item, idx) => {
                  const signal = getBuySignal(item.saturation);
                  const margin = calculateMargin(item.avg_retail_price, item.market_price);
                  const roi = calculateROI(item.avg_retail_price, item.market_price);
                  
                  return (
                    <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-200">{item.resource_name}</td>
                      <td className="py-3 px-4 text-right text-slate-300">{formatPrice(item.market_price)}</td>
                      <td className="py-3 px-4 text-right text-slate-300">{formatPrice(item.avg_retail_price)}</td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-semibold">
                        +{formatPrice(margin)}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-400">
                        {roi.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.saturation < 50 ? 'bg-emerald-500/20 text-emerald-400' :
                          item.saturation < 80 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {item.saturation.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${signal.bg} ${signal.color}`}>
                          {signal.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {new Date(item.timestamp).toLocaleString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Price Trends Charts */}
      {Object.keys(commodityTrends).length > 0 && (
        <div className="gradient-card p-6">
          <h3 className="text-xl font-bold text-slate-200 mb-4">Price Trends</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(commodityTrends).map(([commodity, data]) => {
              if (data.length < 2) return null; // Skip if not enough data points
              
              const chartData = data.map(d => ({
                date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                market: d.market_price,
                retail: d.avg_retail_price,
                saturation: d.saturation
              }));
              
              return (
                <div key={commodity} className="glass-panel p-4">
                  <h4 className="text-lg font-semibold text-slate-200 mb-3">{commodity}</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#64748b" 
                        style={{ fontSize: '10px' }}
                      />
                      <YAxis 
                        stroke="#64748b" 
                        style={{ fontSize: '10px' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: '#cbd5e1' }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '11px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="market" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Market Price"
                        dot={{ r: 3 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="retail" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Retail Price"
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  
                  {/* Latest saturation indicator */}
                  <div className="mt-3 text-center">
                    <span className="text-xs text-slate-400">Current Saturation: </span>
                    <span className={`text-xs font-bold ${
                      data[data.length - 1].saturation < 50 ? 'text-emerald-400' :
                      data[data.length - 1].saturation < 80 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {data[data.length - 1].saturation.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Market Intelligence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5">
          <div className="text-emerald-400 text-3xl font-bold mb-2">
            {latestPrices.filter(p => p.saturation < 50).length}
          </div>
          <div className="text-slate-400 text-sm">Undersupplied Markets</div>
          <div className="text-slate-500 text-xs mt-1">Saturation &lt; 50%</div>
        </div>
        
        <div className="glass-panel p-5">
          <div className="text-yellow-400 text-3xl font-bold mb-2">
            {latestPrices.filter(p => p.saturation >= 50 && p.saturation < 80).length}
          </div>
          <div className="text-slate-400 text-sm">Balanced Markets</div>
          <div className="text-slate-500 text-xs mt-1">Saturation 50-80%</div>
        </div>
        
        <div className="glass-panel p-5">
          <div className="text-red-400 text-3xl font-bold mb-2">
            {latestPrices.filter(p => p.saturation >= 100).length}
          </div>
          <div className="text-slate-400 text-sm">Oversaturated Markets</div>
          <div className="text-slate-500 text-xs mt-1">Saturation ≥ 100%</div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="gradient-card p-6 bg-blue-500/5 border border-blue-500/20">
        <h3 className="text-lg font-bold text-blue-400 mb-3">📊 How to Use Market Timing</h3>
        <div className="space-y-2 text-sm text-slate-300">
          <p><strong className="text-blue-400">Saturation Signals:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1 text-slate-400">
            <li><span className="text-emerald-400">&lt; 40%</span> = STRONG BUY - High demand, low supply</li>
            <li><span className="text-green-400">40-60%</span> = BUY - Good opportunity</li>
            <li><span className="text-yellow-400">60-80%</span> = HOLD - Balanced market</li>
            <li><span className="text-orange-400">80-100%</span> = CAUTION - Increasing competition</li>
            <li><span className="text-red-400">&gt; 100%</span> = AVOID - Oversaturated</li>
          </ul>
          
          <p className="mt-4"><strong className="text-blue-400">Strategy:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1 text-slate-400">
            <li>Combine low saturation + price dips = optimal entry points</li>
            <li>Track trends to predict economic cycle impacts</li>
            <li>Update daily via <code className="bg-slate-800 px-2 py-1 rounded text-xs">collect-market-history.ps1</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MarketTiming;
