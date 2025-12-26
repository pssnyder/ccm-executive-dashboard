import React from 'react';
import Header from './Header';

const PublicLanding = () => {
  // Minimal appData for Header display
  const publicAppData = {
    company_overview: {
      company_rating: '',
      cash: '',
      company_value: '',
      buildings_value: ''
    }
  };

  return (
    <div className="min-h-screen">
      <Header appData={publicAppData} />
      
      <div className="tab-content active space-y-6 p-6">
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
      </div>
    </div>
  );
};

export default PublicLanding;
