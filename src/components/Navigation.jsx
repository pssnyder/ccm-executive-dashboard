import React from 'react';

const Navigation = ({ activeTab, showTab }) => {
  const getButtonClass = (tabId) => {
    return `nav-btn px-6 py-3 transition-all ${activeTab === tabId ? 'active' : ''}`;
  };

  return (
    <nav className="flex space-x-2 border-b border-slate-800 text-[10px] uppercase font-bold tracking-widest">
      <button onClick={() => showTab('exec')} className={getButtonClass('exec')}>Executive Summary</button>
      <button onClick={() => showTab('intel')} className={getButtonClass('intel')}>Intelligence Desk</button>
      <button onClick={() => showTab('vault')} className={getButtonClass('vault')}>Warehouse</button>
      <button onClick={() => showTab('bench')} className={getButtonClass('bench')}>Financials</button>
      <button onClick={() => showTab('trade')} className={getButtonClass('trade')}>Trade Analysis</button>
      <button onClick={() => showTab('arch')} className={getButtonClass('arch')}>Archives</button>
    </nav>
  );
};

export default Navigation;
