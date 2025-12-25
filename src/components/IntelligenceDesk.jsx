import React from 'react';

const IntelligenceDesk = ({ appData }) => {
  const transactions = appData?.transaction_summary || {};
  const dailyCashFlow = transactions.daily_cash_flow || [];
  const revenueBreakdown = transactions.revenue_breakdown || {};
  const expenseBreakdown = transactions.expense_breakdown || {};
  const recentTransactions = transactions.recent_transactions || [];
  const balanceSheet = appData?.balance_sheet || {};

  // Calculate totals
  const totalRevenue = Object.values(revenueBreakdown).reduce((sum, val) => sum + val, 0);
  const totalExpenses = Object.values(expenseBreakdown).reduce((sum, val) => sum + val, 0);
  const netCashFlow = totalRevenue - totalExpenses;

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
  };

  // Format date/time
  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div id="intel" className="tab-content space-y-6">
      {/* Cash Flow Summary */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-green-500/20">
          <h3 className="text-xs uppercase font-bold text-slate-500 mb-2 tracking-widest">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-400">{formatCurrency(totalRevenue)}</p>
          <div className="mt-4 space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Retail Sales</span>
              <span className="text-white">{formatCurrency(revenueBreakdown.retail_sales || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Market Sales</span>
              <span className="text-white">{formatCurrency(revenueBreakdown.market_sales || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Achievements</span>
              <span className="text-white">{formatCurrency(revenueBreakdown.achievements || 0)}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-red-500/20">
          <h3 className="text-xs uppercase font-bold text-slate-500 mb-2 tracking-widest">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
          <div className="mt-4 space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Market Purchases</span>
              <span className="text-white">{formatCurrency(expenseBreakdown.market_purchases || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Production Costs</span>
              <span className="text-white">{formatCurrency(expenseBreakdown.production_costs || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Market Fees</span>
              <span className="text-white">{formatCurrency(expenseBreakdown.market_fees || 0)}</span>
            </div>
          </div>
        </div>

        <div className={`glass-panel p-6 rounded-2xl ${netCashFlow >= 0 ? 'border-indigo-500/30' : 'border-orange-500/30'}`}>
          <h3 className="text-xs uppercase font-bold text-slate-500 mb-2 tracking-widest">Net Cash Flow</h3>
          <p className={`text-3xl font-bold ${netCashFlow >= 0 ? 'text-indigo-400' : 'text-orange-400'}`}>
            {formatCurrency(netCashFlow)}
          </p>
          <div className="mt-4 space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Current Cash</span>
              <span className="text-white">{formatCurrency(balanceSheet.cash || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>A/R</span>
              <span className="text-white">{formatCurrency(balanceSheet.accounts_receivable || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cash + A/R</span>
              <span className="text-white">{formatCurrency((balanceSheet.cash || 0) + (balanceSheet.accounts_receivable || 0))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Cash Flow Trend - Placeholder for future chart */}
      <div className="glass-panel p-8 rounded-3xl border-indigo-900/40">
        <h2 className="text-xs uppercase font-bold text-indigo-400 mb-6 tracking-widest">Daily Cash Flow Trend</h2>
        {dailyCashFlow.length > 0 ? (
          <div className="space-y-3">
            {dailyCashFlow.map((day, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-slate-900/60 rounded-lg">
                <span className="text-sm text-slate-400">{day.date}</span>
                <div className="flex gap-6 text-sm">
                  <span className="text-green-400">+{formatCurrency(day.sales)}</span>
                  <span className="text-red-400">{formatCurrency(day.expenses)}</span>
                  <span className={`font-bold ${day.net >= 0 ? 'text-indigo-400' : 'text-orange-400'}`}>
                    {formatCurrency(day.net)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm italic">No historical cash flow data available. Begin daily snapshot collection to track trends.</p>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="glass-panel p-8 rounded-3xl border-slate-800">
        <h2 className="text-xs uppercase font-bold text-slate-500 mb-6 tracking-widest">Recent Transaction Activity</h2>
        {recentTransactions.length > 0 ? (
          <div className="space-y-2">
            {recentTransactions.map((txn, index) => {
              const categoryColors = {
                sales: 'text-green-400',
                market: 'text-blue-400',
                production: 'text-orange-400',
                fees: 'text-red-400',
                construction: 'text-purple-400',
                game: 'text-yellow-400'
              };
              return (
                <div key={index} className="flex justify-between items-center p-3 bg-slate-900/40 rounded-lg hover:bg-slate-900/60 transition">
                  <div className="flex-1">
                    <span className={`text-xs uppercase font-bold ${categoryColors[txn.category] || 'text-slate-400'}`}>
                      {txn.category}
                    </span>
                    <p className="text-sm text-slate-300 mt-1">{txn.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-lg font-bold ${txn.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount)}
                    </p>
                    <p className="text-xs text-slate-500">{formatDateTime(txn.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500 text-sm italic">No transaction data available.</p>
        )}
      </div>
    </div>
  );
};

export default IntelligenceDesk;
