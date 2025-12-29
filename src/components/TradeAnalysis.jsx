import React from 'react';

const TradeAnalysis = ({ appData }) => {
  const commodityAnalysis = appData?.commodity_analysis || [];
  const activeOperations = appData?.operations?.short_term || [];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  // Get retail opportunities (positive revenue items)
  const retailOpportunities = commodityAnalysis
    .filter(c => c.revenue_per_unit > 0)
    .sort((a, b) => b.revenue_per_unit - a.revenue_per_unit)
    .slice(0, 20);

  // Get current active products
  const activeProducts = activeOperations.map(op => op.product).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl border-slate-800">
        <h2 className="text-xs uppercase font-bold text-slate-500 mb-2 tracking-widest">Trade Analysis</h2>
        <p className="text-sm text-slate-400">Market opportunities and retail arbitrage analysis</p>
      </div>

      {/* Current Operations */}
      <div className="glass-panel p-8 rounded-3xl border-slate-800">
        <h3 className="text-xs uppercase font-bold text-blue-400 mb-4 tracking-widest">Active Retail Operations</h3>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {activeOperations.filter(op => op.type === 'RETAIL').map((op, idx) => (
            <div key={idx} className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-4 rounded-xl border border-blue-700/30">
              <div className="text-xs text-blue-400 uppercase mb-1">{op.building}</div>
              <div className="text-lg font-bold text-white">{op.product}</div>
              <div className="text-xs text-slate-400 mt-1">Qty: {op.quantity?.toLocaleString()}</div>
            </div>
          ))}
          {activeOperations.filter(op => op.type === 'RETAIL').length === 0 && (
            <div className="text-slate-500 italic col-span-full">No active retail operations</div>
          )}
        </div>
      </div>

      {/* Top Retail Opportunities */}
      <div className="glass-panel p-8 rounded-3xl border-slate-800">
        <h3 className="text-xs uppercase font-bold text-green-400 mb-4 tracking-widest">Top Retail Opportunities</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-xs uppercase text-slate-400">Product</th>
                <th className="text-right py-3 px-4 text-xs uppercase text-slate-400">Buy Price</th>
                <th className="text-right py-3 px-4 text-xs uppercase text-slate-400">Sell Price</th>
                <th className="text-right py-3 px-4 text-xs uppercase text-slate-400">Margin</th>
                <th className="text-right py-3 px-4 text-xs uppercase text-slate-400">ROI %</th>
                <th className="text-center py-3 px-4 text-xs uppercase text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {retailOpportunities.map((item, idx) => {
                const buyPrice = item.market_price || 0;
                const sellPrice = item.average_retail_price || 0;
                const margin = item.revenue_per_unit || 0;
                const roi = buyPrice > 0 ? ((margin / buyPrice) * 100) : 0;
                const isActive = activeProducts.includes(item.commodity);

                return (
                  <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-medium text-white">
                      {item.commodity}
                      {isActive && <span className="ml-2 text-xs text-green-400">● ACTIVE</span>}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">{formatCurrency(buyPrice)}</td>
                    <td className="py-3 px-4 text-right text-blue-400">{formatCurrency(sellPrice)}</td>
                    <td className="py-3 px-4 text-right text-green-400">{formatCurrency(margin)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={roi > 50 ? 'text-green-400' : roi > 20 ? 'text-yellow-400' : 'text-slate-400'}>
                        {roi.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.priority?.toLowerCase() === 'high' ? 'bg-green-900/50 text-green-400' :
                        item.priority?.toLowerCase() === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                        'bg-slate-800/50 text-slate-400'
                      }`}>
                        {item.priority || 'N/A'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market Analysis Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-slate-800">
          <div className="text-xs text-purple-400 uppercase mb-2">Total Products</div>
          <div className="text-3xl font-bold text-white">{commodityAnalysis.length}</div>
          <div className="text-xs text-slate-400 mt-1">In retail research</div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-slate-800">
          <div className="text-xs text-green-400 uppercase mb-2">Profitable Items</div>
          <div className="text-3xl font-bold text-white">
            {commodityAnalysis.filter(c => c.revenue_per_unit > 0).length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Positive margin opportunities</div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-slate-800">
          <div className="text-xs text-blue-400 uppercase mb-2">Active Stores</div>
          <div className="text-3xl font-bold text-white">
            {activeOperations.filter(op => op.type === 'RETAIL').length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Currently operating</div>
        </div>
      </div>
    </div>
  );
};

export default TradeAnalysis;
