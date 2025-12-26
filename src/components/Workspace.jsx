import React, { useState, useEffect } from 'react';

const Countdown = ({ to }) => {
  // Parse the finish time as EST and get current EST time
  const getESTTime = () => {
    const now = new Date();
    // Convert current time to EST (UTC-5)
    const estOffset = -5 * 60; // EST is UTC-5
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const estNow = new Date(utc + (estOffset * 60000));
    return estNow;
  };

  const parseESTDate = (dateString) => {
    // Parse the date string assuming it's in EST
    const date = new Date(dateString);
    return date;
  };

  const [time, setTime] = useState(() => {
    const finishTime = parseESTDate(to);
    const currentTime = getESTTime();
    return finishTime - currentTime;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const finishTime = parseESTDate(to);
      const currentTime = getESTTime();
      setTime(finishTime - currentTime);
    }, 1000);
    return () => clearInterval(timer);
  }, [to]);

  if (time <= 0) {
    return <span className="text-green-400">Completed</span>;
  }

  const hours = Math.floor(time / (1000 * 60 * 60));
  const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((time % (1000 * 60)) / 1000);

  return (
    <span>
      {hours.toString().padStart(2, '0')}:
      {minutes.toString().padStart(2, '0')}:
      {seconds.toString().padStart(2, '0')}
    </span>
  );
};


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
      <h2 className="text-xs uppercase font-bold text-slate-500 mb-6 tracking-widest">Tactical Workspace: Active Production</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {operations.map((op, index) => (
          <div key={index} className={`p-4 rounded-xl border ${getCardStyle(op.type)}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-white">{op.building}</span>
              <span className="text-[9px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">{op.product}</span>
            </div>
            <div className="text-center my-4">
              <span className="text-3xl font-bold text-white">{(op.quantity || 0).toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 block uppercase">
                {op.type === 'FARM' ? `Value: $${(op.sourcing_value || 0).toLocaleString()}` : `Revenue: $${(op.projected_revenue || 0).toLocaleString()}`}
              </span>
            </div>
            <div className="text-center text-xs text-cyan-400 font-mono">
              <Countdown to={op.finish_time} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workspace;
