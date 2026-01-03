import React from 'react';

const ExecutiveSummary = ({ appData }) => {
  const companyOverview = appData?.company_overview;
  const mediumTermStrategy = appData?.operations?.medium_term_strategy;
  const currentBuildings = appData?.current_buildings_owned || [];

  // Calculate open slots: (max_buildings) - (current buildings owned)
  const maxBuildings = parseInt(companyOverview?.max_buildings?.split(' + ')[0] || '0', 10);
  const bonusBuildings = parseInt(companyOverview?.max_buildings?.split(' + ')[1] || '0', 10);
  const totalSlots = maxBuildings + bonusBuildings;
  const ownedBuildingsCount = currentBuildings.length;
  const openSlots = totalSlots - ownedBuildingsCount;


  return (
    <div id="exec" className="tab-content active space-y-6">
      <div className="space-y-6">
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
    </div>
  );
};

export default ExecutiveSummary;
