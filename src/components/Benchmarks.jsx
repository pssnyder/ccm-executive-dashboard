import React from 'react';

const Benchmarks = ({ appData }) => {
  const cash = appData?.balance_sheet?.cash || 0;
  const goals = appData?.long_term_goals || {};

  const getStatusColor = (status) => {
    switch (status) {
      case 'Primary Target':
        return 'border-indigo-500/30';
      case 'Stretch Goal':
        return 'border-slate-800 opacity-60';
      default:
        return 'border-slate-800';
    }
  };

  return (
    <div id="bench" className="tab-content space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.values(goals).map((goal, index) => {
          const progress = (cash / goal.total_cost) * 100;
          return (
            <div key={index} className={`glass-panel p-6 rounded-2xl border ${getStatusColor(goal.status)}`}>
              <span className="text-[9px] uppercase text-indigo-400 font-bold block mb-2 tracking-widest">Target: {goal.label}</span>
              <span className="text-2xl font-bold text-white">${goal.total_cost.toLocaleString()}</span>
              <div className="mt-4 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${Math.min(progress, 100).toFixed(2)}%` }}></div>
              </div>
              <div className="mt-2 text-[9px] text-slate-500 uppercase flex justify-between">
                <span>CapEx Status: Buffered</span>
                <span className="text-red-400">Inflation: ${goal.cost_inflation.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-4 italic">
                {goal.benefit || `Output: ${goal.output.rate.toLocaleString()} ${goal.output.unit}`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Benchmarks;
