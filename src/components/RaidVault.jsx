import React from 'react';

const RaidVault = () => {
  return (
    <div id="vault" className="tab-content space-y-6">
      <div className="glass-panel p-8 rounded-3xl border-indigo-900/40">
        <h2 className="text-xs uppercase font-bold text-indigo-400 mb-8 tracking-widest">RAID Vault: Materials Archive</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
            <span className="text-[9px] uppercase text-slate-500 font-bold block mb-2">RC</span>
            <span className="text-2xl text-white font-bold">52</span>
            <span className="text-[9px] text-indigo-400 block mt-1">68% SECURED</span>
          </div>
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
            <span className="text-[9px] uppercase text-slate-500 font-bold block mb-2">BRICKS</span>
            <span className="text-2xl text-white font-bold">715</span>
            <span className="text-[9px] text-indigo-400 block mt-1">68% SECURED</span>
          </div>
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
            <span className="text-[9px] uppercase text-slate-500 font-bold block mb-2">CU</span>
            <span className="text-2xl text-white font-bold">3</span>
            <span className="text-[9px] text-slate-500 block mt-1">15% SECURED</span>
          </div>
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
            <span className="text-[9px] uppercase text-slate-500 font-bold block mb-2">SEEDS</span>
            <span className="text-2xl text-white font-bold">4.8k</span>
            <span className="text-[9px] text-slate-500 block mt-1">SOW READY</span>
          </div>
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
            <span className="text-[9px] uppercase text-slate-500 font-bold block mb-2">POWER</span>
            <span className="text-2xl text-white font-bold">5k</span>
            <span className="text-[9px] text-slate-500 block mt-1">RESERVE</span>
          </div>
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
            <span className="text-[9px] uppercase text-slate-500 font-bold block mb-2">TRANS.</span>
            <span className="text-2xl text-blue-400 font-bold">4.5k</span>
            <span className="text-[9px] text-slate-500 block mt-1">FUEL</span>
          </div>
        </div>
        <div className="mt-8 p-6 bg-indigo-950/10 border border-indigo-900/30 rounded-2xl">
          <p className="text-[11px] text-slate-400 leading-relaxed italic">
            "Pre-allocation of structural materials (RC/Bricks) hedges against market price spikes. We are current capital-gated only by Construction Units (CU) and liquidation timelines."
          </p>
        </div>
      </div>
    </div>
  );
};

export default RaidVault;
