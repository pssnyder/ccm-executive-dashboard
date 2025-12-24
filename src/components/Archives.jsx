import React from 'react';

const Archives = () => {
  return (
    <div id="arch" className="tab-content space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a href="https://www.simcompanies.com/pages/bonds-guide/" target="_blank" rel="noopener noreferrer" className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all block">
          <h4 className="text-xs font-bold text-white uppercase mb-2">Bonds & Fixed Income</h4>
          <p className="text-[10px] text-slate-500">Unlocks at Level 10. Direct lending at 0.5% - 2.0% daily interest.</p>
        </a>
        <a href="https://www.simcompanies.com/pages/interface-tips/" target="_blank" rel="noopener noreferrer" className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all block">
          <h4 className="text-xs font-bold text-white uppercase mb-2">Interface Throttling</h4>
          <p className="text-[10px] text-slate-500">Managing retail velocity to optimize real-world attention span.</p>
        </a>
        <a href="https://www.simcompanies.com/pages/guide-for-beginners/" target="_blank" rel="noopener noreferrer" className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all block">
          <h4 className="text-xs font-bold text-white uppercase mb-2">Economic Cycles</h4>
          <p className="text-[10px] text-slate-500">Understanding Recession (Production) vs Boom (Retail) mechanics.</p>
        </a>
      </div>
    </div>
  );
};

export default Archives;
