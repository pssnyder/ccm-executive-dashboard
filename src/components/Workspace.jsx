import React from 'react';

const Workspace = ({ appData }) => {
  const operations = appData?.operations?.short_term || [];

  const getCardStyle = (type) => {
    switch (type) {
      case 'FARM':
        return 'bg-orange-900/20 border-orange-500/30';
      case 'RETAIL':
        return 'bg-green-900/20 border-green-500/30';
      default:
        return 'bg-slate-900/50 border-slate-800';
    }
  };

  return (
    <div className="glass-panel p-8 rounded-3xl border-slate-800 mt-6">
      <h2 className="text-xs uppercase font-bold text-slate-500 mb-6 tracking-widest">Active Operations Strategy</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {operations.map((op, index) => (
          <div key={index} className={`p-4 rounded-xl border ${getCardStyle(op.type)}`}>
            <div className="mb-2">
              <span className="text-xs text-slate-400 uppercase">{op.name || op.building}</span>
              <span className="text-sm font-bold text-white block mt-1">{op.product}</span>
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-xs text-slate-400">
                <span className="text-slate-500">Level:</span> <span className="text-white">{op.level || 1}</span>
              </div>
              <div className="text-xs">
                <span className={`px-2 py-0.5 rounded ${
                  op.type === 'RETAIL' ? 'bg-green-900/50 text-green-400' : 
                  op.type === 'FARM' ? 'bg-orange-900/50 text-orange-400' : 
                  'bg-slate-800 text-slate-400'
                }`}>
                  {op.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workspace;
