import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import ExecutiveSummary from './components/ExecutiveSummary';
import IntelligenceDesk from './components/IntelligenceDesk';
import RaidVault from './components/RaidVault';
import Benchmarks from './components/Benchmarks';
import Archives from './components/Archives';
import Footer from './components/Footer';
import Workspace from './components/Workspace';
import MarketTicker from './components/MarketTicker';

function App() {
  const [activeTab, setActiveTab] = useState('exec');
  const [appData, setAppData] = useState(null);

  useEffect(() => {
    fetch('/analytical_layer/core_reporting.json')
      .then(response => response.json())
      .then(data => setAppData(data))
      .catch(error => console.error("Failed to fetch app data:", error));
  }, []);

  const showTab = (tabId) => {
    setActiveTab(tabId);
  };

  if (!appData) {
    return <div className="text-white text-center p-12">Loading CCM Terminal...</div>;
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="scanline"></div>
      <div className="max-w-7xl mx-auto space-y-6">
        <MarketTicker />
        <Header appData={appData} />
        <Navigation showTab={showTab} />
        
        <div style={{ display: activeTab === 'exec' ? 'block' : 'none' }}>
          <ExecutiveSummary appData={appData} />
          <Workspace appData={appData} />
        </div>
        <div style={{ display: activeTab === 'intel' ? 'block' : 'none' }}>
          <IntelligenceDesk />
        </div>
        <div style={{ display: activeTab === 'vault' ? 'block' : 'none' }}>
          <RaidVault />
        </div>
        <div style={{ display: activeTab === 'bench' ? 'block' : 'none' }}>
          <Benchmarks appData={appData} />
        </div>
        <div style={{ display: activeTab === 'arch' ? 'block' : 'none' }}>
          <Archives />
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default App;
