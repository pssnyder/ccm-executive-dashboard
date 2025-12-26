import React from 'react';

const Header = ({ appData }) => {
  const cash = appData?.balance_sheet?.cash || 0;
  const companyValue = appData?.company_overview?.company_value || 0;

  return (
    <header className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center space-x-6">
        <div className="w-16 h-16">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M50 10 L90 85 L10 85 Z" fill="none" stroke="var(--neon-blue)" strokeWidth="2" />
            <circle cx="50" cy="58" r="8" fill="var(--neon-blue)" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tighter italic">CASSANDRA CAPITAL</h1>
          <p className="text-[10px] text-indigo-400 tracking-[0.4em] uppercase">Quantifying the inevitable.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
        <div className="text-center px-4 border-r border-slate-800">
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Cash on Hand</span>
          <span className="text-xl text-white font-bold">${cash.toLocaleString()}</span>
        </div>
        <div className="text-center px-4 border-r border-slate-800">
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Book Value</span>
          <span className="text-xl text-indigo-400 font-bold">${companyValue.toLocaleString()}</span>
        </div>
        <div className="text-center px-4 border-r border-slate-800">
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Phase</span>
          <span className="text-xl text-blue-400 font-bold uppercase">Normal</span>
        </div>
        <div className="text-center px-4">
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Business Status</span>
          <span className="text-xs text-green-400 font-bold flex items-center justify-center gap-2">
            <span className="status-pulse"></span> OPERATIONAL
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
