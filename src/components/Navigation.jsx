import React from 'react';

const Navigation = ({ showTab }) => {
  return (
    <nav className="flex space-x-2 border-b border-slate-800 text-[10px] uppercase font-bold tracking-widest">
      <button onClick={() => showTab('exec')} className="nav-btn px-6 py-3 active transition-all">Executive Summary</button>
      <button onClick={() => showTab('intel')} className="nav-btn px-6 py-3 transition-all">Intelligence Desk</button>
      <button onClick={() => showTab('vault')} className="nav-btn px-6 py-3 transition-all">RAID Vault</button>
      <button onClick={() => showTab('bench')} className="nav-btn px-6 py-3 transition-all">Benchmarks</button>
      <button onClick={() => showTab('arch')} className="nav-btn px-6 py-3 transition-all">Archives</button>
    </nav>
  );
};

export default Navigation;
