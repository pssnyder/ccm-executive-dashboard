import React from 'react';

const IntelligenceDesk = () => {
  return (
    <div id="intel" className="tab-content space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-panel p-8 rounded-3xl border-indigo-900/40">
          <h2 className="text-xs uppercase font-bold text-indigo-400 mb-6 tracking-widest">Macro Signal Feed</h2>
          <div className="space-y-6">
            <div className="p-6 bg-slate-900/60 rounded-2xl border border-indigo-950">
              <div className="flex justify-between mb-4">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">Gov Order Analysis (ID 506)</span>
                <span className="text-[9px] text-yellow-500 border border-yellow-500/30 px-2 rounded">HIGH VOLATILITY</span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-[9px] text-slate-500 block mb-1">Processors Q2+</span>
                  <span className="text-xl text-white font-bold">5,014,981</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block mb-1">On-board Computers</span>
                  <span className="text-xl text-white font-bold">1,253,497</span>
                </div>
              </div>
              <p className="mt-6 text-[11px] text-slate-400 italic">
                "The government is absorbing global compute liquidity. This creates a massive secondary market for Power and Silicon. RPI is positioning at the fundamental base of this stack."
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl border-slate-800">
          <h2 className="text-xs uppercase font-bold text-slate-500 mb-6 tracking-widest">Global Sector Saturation</h2>
          <div className="space-y-4 text-[11px]">
            <div>
              <div className="flex justify-between mb-1"><span>Power Plants</span><span className="text-white">10.50%</span></div>
              <div className="w-full h-1 bg-slate-800 rounded-full"><div className="h-full bg-indigo-500" style={{ width: '10.5%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between mb-1"><span>Farms</span><span className="text-white">7.93%</span></div>
              <div className="w-full h-1 bg-slate-800 rounded-full"><div className="h-full bg-orange-500" style={{ width: '7.9%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between mb-1"><span>Grocery Stores</span><span className="text-white">5.26%</span></div>
              <div className="w-full h-1 bg-slate-800 rounded-full"><div className="h-full bg-green-500" style={{ width: '5.26%' }}></div></div>
            </div>
            <div className="opacity-40">
              <div className="flex justify-between mb-1"><span>Banks</span><span className="text-white">0.31%</span></div>
              <div className="w-full h-1 bg-slate-800 rounded-full"><div className="h-full bg-slate-600" style={{ width: '0.31%' }}></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceDesk;
