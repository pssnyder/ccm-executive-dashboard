import React from 'react';

const ExecutiveSummary = ({ appData }) => {
  const companyOverview = appData?.company_overview;
  const mediumTermStrategy = appData?.operations?.medium_term_strategy;

  // Calculate open slots: (max_buildings) - (current buildings)
  // Assuming current buildings = 3 (Farm, Grocery, Office)
  const maxBuildings = parseInt(companyOverview?.max_buildings?.split(' + ')[0] || '0', 10);
  const bonusBuildings = parseInt(companyOverview?.max_buildings?.split(' + ')[1] || '0', 10);
  const totalSlots = maxBuildings + bonusBuildings;
  const openSlots = totalSlots - 3;


  return (
    <div id="exec" className="tab-content active space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
            <h2 className="text-xs uppercase font-bold text-indigo-400 mb-4 tracking-widest">Firm Philosophy</h2>
            <p className="text-lg italic text-slate-200 leading-relaxed">
              "Cassandra Capital Management seeks long-term capital appreciation for its clients through deep fundamental research to find undervalued or misunderstood global investment opportunities."
            </p>
            <div className="mt-6 flex gap-4">
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded text-[9px] text-indigo-400 uppercase font-bold">Long-Term Growth</span>
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded text-[9px] text-indigo-400 uppercase font-bold">Special Situations</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-orange-500/20">
            <h3 className="text-[10px] uppercase text-orange-500 font-bold mb-4 tracking-widest">Medium-Term Strategy</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {mediumTermStrategy}
            </p>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl border-slate-800">
          <h2 className="text-xs uppercase font-bold text-slate-500 mb-6 tracking-widest">Strategic Stance</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Current stance is <strong>Aggressive Growth</strong>. We are utilizing zero-material farming and retail arbitrage to fund <strong>Institutional Deployment</strong>.
            We avoid factory wages and raw material logistics in favor of asset liquidity.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <span className="text-[9px] uppercase text-slate-500 font-bold block mb-1">HQ / Intelligence Node</span>
              <span className="text-xs text-indigo-400 uppercase font-bold italic">Active Offline Processing</span>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <span className="text-[9px] uppercase text-slate-500 font-bold block mb-1">Deployment Capacity</span>
              <span className="text-sm text-white font-bold">{openSlots} OPEN SLOTS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummary;
