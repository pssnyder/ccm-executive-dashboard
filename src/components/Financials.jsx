import React from 'react';

const Financials = ({ appData }) => {
  const balanceSheet = appData?.balance_sheet || {};
  const balanceHistory = appData?.balance_sheet_history || [];
  const incomeHistory = appData?.income_statement_history || [];
  const cashflowHistory = appData?.cashflow_history || [];
  const companyOverview = appData?.company_overview || {};
  const financialRatios = appData?.financial_ratios || {};
  const transactions = appData?.transaction_summary?.recent_transactions || [];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value || 0);
  };

  const formatPercent = (value) => {
    // Values are stored as decimals (1.0546 = 105.46%)
    return `${((value || 0) * 100).toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="glass-panel p-8 rounded-3xl border-slate-800">
        <h2 className="text-xs uppercase font-bold text-slate-500 mb-6 tracking-widest">Financial Overview</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 p-6 rounded-xl border border-green-700/30">
            <div className="text-xs text-green-400 uppercase mb-2">Company Value</div>
            <div className="text-3xl font-bold text-white">{formatCurrency(companyOverview.company_value)}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-6 rounded-xl border border-blue-700/30">
            <div className="text-xs text-blue-400 uppercase mb-2">Cash</div>
            <div className="text-3xl font-bold text-white">{formatCurrency(balanceSheet.cash)}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-6 rounded-xl border border-purple-700/30">
            <div className="text-xs text-purple-400 uppercase mb-2">Assets Value</div>
            <div className="text-3xl font-bold text-white">{formatCurrency(companyOverview.buildings_value)}</div>
          </div>
          <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 p-6 rounded-xl border border-cyan-700/30">
            <div className="text-xs text-cyan-400 uppercase mb-2">Retained Earnings</div>
            <div className="text-3xl font-bold text-white">{formatCurrency(balanceSheet.retained_earnings)}</div>
          </div>
        </div>
      </div>

      {/* Balance Sheet */}
      <div className="glass-panel p-8 rounded-3xl border-slate-800">
        <h2 className="text-xs uppercase font-bold text-slate-500 mb-6 tracking-widest">Balance Sheet (Current)</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Assets */}
          <div>
            <h3 className="text-green-400 font-bold mb-4 text-sm">ASSETS</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Cash</span>
                <span className="text-white font-mono">{formatCurrency(balanceSheet.cash)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Accounts Receivable</span>
                <span className="text-white font-mono">{formatCurrency(balanceSheet.accounts_receivable)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Inventory (Materials)</span>
                <span className="text-white font-mono">{formatCurrency(balanceSheet.inventory_materials)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Inventory (Finished Goods)</span>
                <span className="text-white font-mono">{formatCurrency(balanceSheet.inventory_finished_goods)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Buildings</span>
                <span className="text-white font-mono">{formatCurrency(balanceSheet.buildings)}</span>
              </div>
              <div className="border-t border-slate-700 mt-2 pt-2 flex justify-between font-bold">
                <span className="text-green-400">Total Assets</span>
                <span className="text-green-400 font-mono">
                  {formatCurrency(
                    (balanceSheet.cash || 0) +
                    (balanceSheet.accounts_receivable || 0) +
                    (balanceSheet.inventory_materials || 0) +
                    (balanceSheet.inventory_finished_goods || 0) +
                    (balanceSheet.buildings || 0)
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Liabilities & Equity */}
          <div>
            <h3 className="text-red-400 font-bold mb-4 text-sm">LIABILITIES & EQUITY</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Contributed Capital</span>
                <span className="text-white font-mono">{formatCurrency(balanceSheet.contributed_capital)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Retained Earnings</span>
                <span className="text-white font-mono">{formatCurrency(balanceSheet.retained_earnings)}</span>
              </div>
              <div className="border-t border-slate-700 mt-2 pt-2 flex justify-between font-bold">
                <span className="text-cyan-400">Total Equity</span>
                <span className="text-cyan-400 font-mono">
                  {formatCurrency(
                    (balanceSheet.contributed_capital || 0) +
                    (balanceSheet.retained_earnings || 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Ratios */}
      <div className="glass-panel p-8 rounded-3xl border-slate-800">
        <h2 className="text-xs uppercase font-bold text-slate-500 mb-6 tracking-widest">Financial Ratios</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-blue-400 text-sm font-bold mb-4">Profitability</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Gross Margin</span>
                <span className="text-white font-mono">{formatPercent(financialRatios.gross_margin)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Operating Margin</span>
                <span className="text-white font-mono">{formatPercent(financialRatios.operating_margin)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Net Margin</span>
                <span className="text-white font-mono">{formatPercent(financialRatios.net_margin)}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-green-400 text-sm font-bold mb-4">Efficiency</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">ROE</span>
                <span className="text-white font-mono">{formatPercent(financialRatios.roe)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ROA</span>
                <span className="text-white font-mono">{formatPercent(financialRatios.roa)}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-purple-400 text-sm font-bold mb-4">Efficiency & Turnover</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Inventory Turnover</span>
                <span className="text-white font-mono">{(financialRatios.inventory_turnover || 0).toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assets Turnover</span>
                <span className="text-white font-mono">{(financialRatios.assets_turnover || 0).toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Debt to Building</span>
                <span className="text-white font-mono">{formatPercent(financialRatios.debt_to_building)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-panel p-8 rounded-3xl border-slate-800">
        <h2 className="text-xs uppercase font-bold text-slate-500 mb-6 tracking-widest">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 text-slate-400 font-normal">Date</th>
                <th className="text-left py-3 text-slate-400 font-normal">Category</th>
                <th className="text-right py-3 text-slate-400 font-normal">Amount</th>
                <th className="text-left py-3 text-slate-400 font-normal">Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((tx, index) => (
                <tr key={index} className="border-b border-slate-800">
                  <td className="py-3 text-slate-300 font-mono text-xs">
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      tx.category === 'Revenue' ? 'bg-green-900/30 text-green-400' :
                      tx.category === 'Expense' ? 'bg-red-900/30 text-red-400' :
                      'bg-blue-900/30 text-blue-400'
                    }`}>
                      {tx.category}
                    </span>
                  </td>
                  <td className={`py-3 text-right font-mono ${
                    (tx.amount || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="py-3 text-slate-400 text-xs">{tx.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Financials;
