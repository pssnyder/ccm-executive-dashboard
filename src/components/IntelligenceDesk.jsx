import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const IntelligenceDesk = ({ appData }) => {
  const economicPhases = appData?.economic_phases || [];
  const governmentOrders = appData?.government_orders || [];
  const randomEvents = appData?.random_events || [];
  const realmData = appData?.realm_data || [];
  
  // Helper to parse ISO date strings without timezone conversion
  const parseISODate = (dateString) => {
    if (!dateString) return null;
    // Parse YYYY-MM-DD as local date to avoid timezone shifts
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  
  // Get current/latest economic phase (first item since CSV is newest-first)
  const currentPhase = economicPhases[0] || {};
  
  // Filter government contracts to last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentContracts = governmentOrders.filter(order => {
    if (!order.creation_date) return false;
    const orderDate = parseISODate(order.creation_date);
    return orderDate && orderDate >= thirtyDaysAgo;
  });
  
  return (
    <div className="space-y-6">
      {/* Current Economic Status */}
      <div className="glass-panel p-8 rounded-3xl border-slate-800">
        <h2 className="text-xs uppercase font-bold text-slate-500 mb-6 tracking-widest">Economic Status</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-6 rounded-xl border border-blue-700/30">
            <div className="text-xs text-blue-400 uppercase mb-2">Current Phase</div>
            <div className="text-2xl font-bold text-white">{currentPhase.phase || 'Unknown'}</div>
            <div className="text-xs text-slate-400 mt-2">
              {currentPhase.start_date && `Started: ${parseISODate(currentPhase.start_date)?.toLocaleDateString() || currentPhase.start_date}`}
            </div>
          </div>
          <div className={`bg-gradient-to-br p-6 rounded-xl border ${
            currentPhase.phase_code === 1 ? 'from-green-900/30 to-green-800/20 border-green-700/30' :
            currentPhase.phase_code === -1 ? 'from-red-900/30 to-red-800/20 border-red-700/30' :
            'from-yellow-900/30 to-yellow-800/20 border-yellow-700/30'
          }`}>
            <div className={`text-xs uppercase mb-2 ${
              currentPhase.phase_code === 1 ? 'text-green-400' :
              currentPhase.phase_code === -1 ? 'text-red-400' :
              'text-yellow-400'
            }`}>Phase Code</div>
            <div className="text-2xl font-bold text-white">
              {currentPhase.phase_code === 1 ? '+1 BOOM' :
               currentPhase.phase_code === -1 ? '-1 RECESSION' :
               '0 NORMAL'}
            </div>
            <div className="text-xs text-slate-400 mt-2">
              {currentPhase.phase_code === 1 ? 'Expansion Period' :
               currentPhase.phase_code === -1 ? 'Contraction Period' :
               'Stable Period'}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-6 rounded-xl border border-purple-700/30">
            <div className="text-xs text-purple-400 uppercase mb-2">Phase Duration</div>
            <div className="text-2xl font-bold text-white">{currentPhase.duration_days || 0} days</div>
            <div className="text-xs text-slate-400 mt-2">
              {currentPhase.duration_weeks ? `${currentPhase.duration_weeks.toFixed(1)} weeks` : ''}
            </div>
          </div>
          <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 p-6 rounded-xl border border-cyan-700/30">
            <div className="text-xs text-cyan-400 uppercase mb-2">Historical Phases</div>
            <div className="text-2xl font-bold text-white">{economicPhases.length}</div>
            <div className="text-xs text-slate-400 mt-2">Cycles Tracked</div>
          </div>
        </div>
      </div>

      {/* Economic Phase Cycle Visualization */}
      <div className="glass-panel p-8 rounded-3xl border-slate-800">
        <h2 className="text-xs uppercase font-bold text-slate-500 mb-6 tracking-widest">Economic Cycle Trend</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={economicPhases.slice(0, 30).reverse().map((phase, index) => ({
                index: index,
                phaseCode: parseInt(phase.phase_code) || 0,
                phase: phase.phase,
                duration: `${phase.duration_days}d`,
                date: phase.start_date || ''
              }))}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis 
                dataKey="index" 
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 12 }}
                label={{ value: 'Cycle History', position: 'insideBottom', offset: -5, fill: '#64748b' }}
              />
              <YAxis 
                domain={[-1.5, 1.5]}
                ticks={[-1, 0, 1]}
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => value === 1 ? 'Boom' : value === -1 ? 'Recession' : 'Normal'}
              />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" opacity={0.5} />
              <ReferenceLine y={1} stroke="#22c55e" strokeDasharray="2 2" opacity={0.3} />
              <ReferenceLine y={-1} stroke="#ef4444" strokeDasharray="2 2" opacity={0.3} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '8px'
                }}
                labelStyle={{ color: '#94a3b8', fontSize: 12 }}
                itemStyle={{ color: '#06b6d4', fontSize: 12 }}
                formatter={(value, name, props) => {
                  const { payload } = props;
                  return [
                    <div key="tooltip" className="space-y-1">
                      <div className="font-bold text-white">{payload.phase}</div>
                      <div className="text-xs text-slate-400">Duration: {payload.duration}</div>
                      <div className="text-xs text-slate-500">{payload.date}</div>
                      <div className="text-xs text-cyan-400">Phase Code: {value}</div>
                    </div>,
                    ''
                  ];
                }}
              />
              <Line 
                type="monotone" 
                dataKey="phaseCode" 
                stroke="#06b6d4" 
                strokeWidth={3}
                dot={{ fill: '#06b6d4', r: 4 }}
                activeDot={{ r: 6, fill: '#0ea5e9' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {economicPhases.length === 0 && (
          <div className="text-center text-slate-500 text-sm">
            No economic phase data available
          </div>
        )}
        <div className="flex justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-xs text-slate-400">Boom (+1)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-xs text-slate-400">Normal (0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-xs text-slate-400">Recession (-1)</span>
          </div>
        </div>
      </div>

      {/* Government Orders */}
      <div className="glass-panel p-8 rounded-3xl border-slate-800">
        <h2 className="text-xs uppercase font-bold text-slate-500 mb-6 tracking-widest">Recent Government Contracts (Last 30 Days)</h2>
        <div className="space-y-3">
          {recentContracts.slice(0, 10).map((order, index) => (
            <div key={index} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-white font-bold">{order.project_name}</div>
                  <div className="text-xs text-slate-400 mt-1">Order ID: {order.order_id}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-cyan-400 font-mono">{order.days_to_fulfill} days</div>
                  <div className="text-[10px] text-slate-500">to fulfill</div>
                </div>
              </div>
              <div className="text-xs text-slate-300 mt-2">
                <span className="text-slate-500">Resources: </span>{order.resources_required}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Created: {order.creation_date || 'N/A'}
              </div>
            </div>
          ))}
          {recentContracts.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No recent government contracts in the last 30 days
            </div>
          )}
        </div>
      </div>

      {/* Random Events */}
      <div className="glass-panel p-8 rounded-3xl border-slate-800">
        <h2 className="text-xs uppercase font-bold text-slate-500 mb-6 tracking-widest">Recent Random Events</h2>
        <div className="space-y-3">
          {randomEvents.slice(0, 10).map((event, index) => (
            <div key={index} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <div className="flex justify-between items-start mb-2">
                <div className="text-white font-bold">{event.event_name}</div>
                <div className="text-xs text-slate-400 font-mono">
                  {event.date || 'N/A'}
                </div>
              </div>
              <div className="text-sm text-slate-300 mb-2">
                {event.building && <span className="text-cyan-400">{event.building}</span>}
                {event.until_date && <span className="text-slate-500 ml-2">→ {event.until_date}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Impact:</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  parseFloat(event.impact) > 0 ? 'bg-green-900/30 text-green-400' :
                  parseFloat(event.impact) < 0 ? 'bg-red-900/30 text-red-400' :
                  'bg-yellow-900/30 text-yellow-400'
                }`}>
                  {typeof event.impact === 'number' || !isNaN(parseFloat(event.impact)) 
                    ? `${parseFloat(event.impact) > 0 ? '+' : ''}${(parseFloat(event.impact) * 100).toFixed(0)}%`
                    : event.impact}
                </span>
              </div>
            </div>
          ))}
          {randomEvents.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No random events recorded
            </div>
          )}
        </div>
      </div>

      {/* Market Intelligence Note */}
      <div className="glass-panel p-8 rounded-3xl border-slate-800 bg-gradient-to-br from-amber-900/10 to-amber-800/5">
        <h2 className="text-xs uppercase font-bold text-amber-500 mb-4 tracking-widest">⚠️ Intelligence Notes</h2>
        <div className="text-sm text-slate-300 space-y-2">
          <p>• Monitor government contracts for strategic expansion opportunities</p>
          <p>• Economic phases affect market prices - adjust production during Boom periods</p>
          <p>• Track historical phase durations to predict market timing</p>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceDesk;
