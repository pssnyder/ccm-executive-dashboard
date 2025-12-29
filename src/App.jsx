import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import ExecutiveSummary from './components/ExecutiveSummary';
import IntelligenceDesk from './components/IntelligenceDesk';
import RaidVault from './components/RaidVault';
import Financials from './components/Financials';
import TradeAnalysis from './components/TradeAnalysis';
import Archives from './components/Archives';
import Footer from './components/Footer';
import Workspace from './components/Workspace';
import MarketTicker from './components/MarketTicker';
import PublicLanding from './components/PublicLanding';
import Login from './components/Login';
import { fetchAppData } from './services/dataService';

function AppContent() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('exec');
  const [appData, setAppData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [marketTickerKey, setMarketTickerKey] = useState(0); // Force ticker refresh
  const [showPublicView, setShowPublicView] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppData()
        .then(data => {
          setAppData(data);
          setLastUpdated(data.last_updated);
        })
        .catch(error => console.error("Failed to fetch app data:", error));
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchAppData(true); // Force refresh from Google Sheets
      setAppData(data);
      setLastUpdated(data.last_updated);
      console.log('[App] Data refreshed successfully');
    } catch (error) {
      console.error('[App] Failed to refresh data:', error);
      alert('Failed to refresh data from Google Sheets. Using cached data.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarketRefresh = () => {
    // Clear market cache and force re-render
    localStorage.removeItem('market_data_cache');
    localStorage.removeItem('market_data_timestamp');
    setMarketTickerKey(prev => prev + 1);
    console.log('[App] Market data refresh triggered');
  };

  const showTab = (tabId) => {
    setActiveTab(tabId);
  };

  // Show loading state
  if (isLoading) {
    return <div className="text-white text-center p-12">Loading...</div>;
  }

  // Show public landing page
  if (!isAuthenticated && showPublicView) {
    return (
      <div>
        <PublicLanding />
        <button
          onClick={() => setShowPublicView(false)}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          Executive Login
        </button>
      </div>
    );
  }

  // Show login page
  if (!isAuthenticated) {
    return <Login />;
  }

  // Protected dashboard
  if (!appData) {
    return <div className="text-white text-center p-12">Loading CCM Terminal...</div>;
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="scanline"></div>
      <div className="max-w-7xl mx-auto space-y-6">
        <MarketTicker 
          commodityData={appData?.commodity_analysis || []}
          commodityFilter={[]}
        />
        
        {/* Refresh Buttons */}
        <div className="flex justify-end items-center gap-4">
          <span className="text-green-400 text-sm font-mono">
            {lastUpdated && `Data: ${new Date(lastUpdated).toLocaleString()}`}
          </span>
          <button
            onClick={handleMarketRefresh}
            className="px-4 py-2 bg-purple-900 text-purple-400 border border-purple-400 rounded hover:bg-purple-800 font-mono text-sm"
          >
            ⟳ Market Prices
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-green-900 text-green-400 border border-green-400 rounded hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
          >
            {isRefreshing ? '⟳ Refreshing...' : '⟳ Sheet Data'}
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-900 text-red-400 border border-red-400 rounded hover:bg-red-800 font-mono text-sm"
          >
            Logout
          </button>
        </div>
        
        <Header appData={appData} />
        <Navigation activeTab={activeTab} showTab={showTab} />
        
        <div style={{ display: activeTab === 'exec' ? 'block' : 'none' }}>
          <ExecutiveSummary appData={appData} />
          <Workspace appData={appData} />
        </div>
        <div style={{ display: activeTab === 'intel' ? 'block' : 'none' }}>
          <IntelligenceDesk appData={appData} />
        </div>
        <div style={{ display: activeTab === 'vault' ? 'block' : 'none' }}>
          <RaidVault appData={appData} />
        </div>
        <div style={{ display: activeTab === 'bench' ? 'block' : 'none' }}>
          <Financials appData={appData} />
        </div>
        <div style={{ display: activeTab === 'trade' ? 'block' : 'none' }}>
          <TradeAnalysis appData={appData} />
        </div>
        <div style={{ display: activeTab === 'arch' ? 'block' : 'none' }}>
          <Archives />
        </div>

        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
