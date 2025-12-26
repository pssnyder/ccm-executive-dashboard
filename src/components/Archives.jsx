import React, { useState } from 'react';

const Archives = () => {
  const [activeDoc, setActiveDoc] = useState('architecture');

  const docs = {
    architecture: {
      title: 'System Architecture',
      content: `# CCM Executive Dashboard - System Architecture

## Current Architecture (Phase 3)

### Data Flow
1. **Google Sheets** (Primary Data Source)
   - Single batchGet API call fetches all 18 sheet tabs
   - Exponential backoff retry logic
   - Rate limit handling

2. **localStorage Cache**
   - Browser-based caching
   - Offline capability
   - Instant page loads

3. **Manual Refresh**
   - User-controlled data updates
   - Click "⟳ Refresh Data" button
   - Prevents API rate limiting

### Technology Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **API**: Google Sheets API v4
- **Hosting**: Firebase Hosting
- **Data**: Google Sheets + localStorage

### Components
- Executive Summary: Company overview + medium-term strategy
- Tactical Workspace: Active production with EST countdowns
- Intelligence Desk: Economic phases + government contracts
- Warehouse: Current inventory snapshot
- Financials: Balance sheet + income + cashflow + ratios
- Archives: Documentation and guides

### Future Plans
- Firebase/Firestore backend for real-time collaboration
- Chart.js for data visualizations
- Export to PDF functionality
- Mobile-responsive optimizations`
    },
    dataSchema: {
      title: 'Data Schema',
      content: `# Data Schema Documentation

## Google Sheets Structure (18 Tabs)

### Historical Datasets
1. Balance Sheet Historical: Multi-row time-series
2. Cashflow Statement Historical: Cash flow tracking
3. Income Statement Historical: P&L data
4. Economic Phases Historical: Game economy tracking
5. Government Orders Historical: Contract history
6. Random Events Historical: Game events log
7. Realm Data Historical: Server/realm statistics
8. Financial Ratios Historical: Calculated metrics
9. CCM Overview Historical: Company snapshots

### Current/Snapshot Datasets
10. Warehouse Current: Inventory levels
11. Buildings Current: Building distribution
12. Company Levels Current: Level progression
13. Buildings Owned Current: Your buildings list
14. Active Operations Current: Production queue
15. Strategic Goals Current: Long-term objectives
16. Strategy Notes Current: Planning notes
17. Transaction History: Recent transactions
18. Commodity Analysis: Market price tracking`
    },
    gameGuides: {
      title: 'Game Strategy Guides',
      content: `# Sim Companies Strategy Guide

## Building Priority (Early Game)
1. Farm (Level 1-5): Foundation for all production
2. Power Plant: Reduce energy costs
3. Bank: Loan capacity for expansion
4. Academy: Speed boost crucial for scaling
5. SaaS Center: Long-term passive income

## Economic Phases Strategy
- Boom: Maximize production, prices are high
- Normal: Balance production and inventory
- Recession: Reduce production, stockpile materials

## Government Contracts
- Accept contracts aligned with current production
- Calculate fulfillment time vs. production capacity
- Prioritize high-value contracts during Boom phases

## Financial Management
- Maintain 20-30% cash reserves
- Track ROE and margin trends
- Reinvest profits into high-ROI buildings`
    },
    deployment: {
      title: 'Deployment Guide',
      content: `# Deployment Instructions

## Local Development
npm install
npm run dev

## Environment Setup
Create .env file:
VITE_GOOGLE_SHEET_ID=your_sheet_id_here
VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here

## Firebase Deployment
npm run build
firebase deploy --only hosting --project rts-labs-f3981

## Troubleshooting
- Rate Limits: Use refresh button sparingly
- Cache Issues: Clear localStorage in DevTools
- API Errors: Verify sheet permissions and API key
- Data Not Updating: Click refresh after sheet edits`
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-8 rounded-3xl border-slate-800">
        <h2 className="text-xs uppercase font-bold text-slate-500 mb-6 tracking-widest">Documentation Archives</h2>
        
        {/* Document Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
          {Object.keys(docs).map(key => (
            <button
              key={key}
              onClick={() => setActiveDoc(key)}
              className={`px-4 py-2 rounded transition-all text-sm ${
                activeDoc === key
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {docs[key].title}
            </button>
          ))}
        </div>

        {/* Document Content */}
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 max-h-[600px] overflow-y-auto">
          <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
            {docs[activeDoc].content}
          </pre>
        </div>
      </div>

      {/* Game Guides - External Links */}
      <div className="glass-panel p-8 rounded-3xl border-slate-800">
        <h2 className="text-xs uppercase font-bold text-slate-500 mb-6 tracking-widest">External Resources</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <a
            href="https://www.simcompanies.com/pages/bonds-guide/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-indigo-500 transition-all"
          >
            <div className="text-indigo-400 font-bold mb-2">📊 Bonds & Fixed Income</div>
            <div className="text-xs text-slate-400">Unlocks at Level 10. Direct lending guide</div>
          </a>
          <a
            href="https://www.simcompanies.com/pages/interface-tips/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-purple-500 transition-all"
          >
            <div className="text-purple-400 font-bold mb-2">⚡ Interface Tips</div>
            <div className="text-xs text-slate-400">Optimize your workflow and attention</div>
          </a>
          <a
            href="https://www.simcompanies.com/pages/guide-for-beginners/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-green-500 transition-all"
          >
            <div className="text-green-400 font-bold mb-2">📚 Beginner's Guide</div>
            <div className="text-xs text-slate-400">Economic cycles and game mechanics</div>
          </a>
        </div>
      </div>

      {/* Quick Links */}
      <div className="glass-panel p-8 rounded-3xl border-slate-800">
        <h2 className="text-xs uppercase font-bold text-slate-500 mb-6 tracking-widest">Project Links</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <a
            href="https://github.com/pssnyder/ccm-executive-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-cyan-500 transition-all"
          >
            <div className="text-cyan-400 font-bold mb-2">📁 GitHub Repository</div>
            <div className="text-xs text-slate-400">Source code and version history</div>
          </a>
          <a
            href="https://console.firebase.google.com/project/rts-labs-f3981"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-orange-500 transition-all"
          >
            <div className="text-orange-400 font-bold mb-2">🔥 Firebase Console</div>
            <div className="text-xs text-slate-400">Hosting and deployment</div>
          </a>
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-blue-500 transition-all"
          >
            <div className="text-blue-400 font-bold mb-2">☁️ Google Cloud</div>
            <div className="text-xs text-slate-400">API credentials</div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Archives;
