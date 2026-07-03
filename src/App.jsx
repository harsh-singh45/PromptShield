import { useState, useEffect } from 'react';
import Header from './components/Header';
import StatusCard from './components/StatusCard';
import './App.css';

export default function App() {
  const [isActive, setIsActive] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['promptShieldActive'], (result) => {
        const activeState = result.promptShieldActive !== undefined ? result.promptShieldActive : true;
        setIsActive(activeState);
        setIsInitializing(false);
      });
    } else {
      setIsInitializing(false);
    }
  }, []);

  const handleToggle = (e) => {
    const newState = e.target.checked;
    setIsActive(newState);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ promptShieldActive: newState });
    }
  };

  if (isInitializing) return null;

  return (
    <div className="dashboard">
      <Header isActive={isActive} onToggle={handleToggle} />
      <StatusCard isActive={isActive} />
      
      {/* You can add modular StatsGrid and ActivityLog components here next! */}
      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-label">Status</span>
          <span className="stat-value" style={{color: isActive ? '#10b981' : '#ef4444'}}>
            {isActive ? 'Active' : 'Paused'}
          </span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Environment</span>
          <span className="stat-value" style={{fontSize: '14px', paddingTop: '4px'}}>Local V3</span>
        </div>
      </div>
    </div>
  );
}