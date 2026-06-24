import { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [isActive, setIsActive] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  // 1. Load the initial state from Chrome Storage when the popup opens
  useEffect(() => {
    // Check if we are running inside a real Chrome Extension environment
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['promptShieldActive'], (result) => {
        // If it's undefined (first install), default to true
        const activeState = result.promptShieldActive !== undefined ? result.promptShieldActive : true;
        setIsActive(activeState);
        setIsInitializing(false);
      });
    } else {
      // Fallback for local web browser testing
      setIsInitializing(false);
    }
  }, []);

  // 2. Handle the toggle switch and save to Chrome Storage
  const handleToggle = (e) => {
    const newState = e.target.checked;
    setIsActive(newState);
    
    // Save to chrome storage so the background script knows
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ promptShieldActive: newState });
    }
  };

  // Don't render UI until we know the saved state to prevent flickering
  if (isInitializing) return null;

  return (
    <div className="dashboard">
      
      {/* Top Navigation / Header */}
      <header className="header">
        <div className="brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--accent-brand)'}}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <h1>PromptShield</h1>
          <span className="version-badge">MVP</span>
        </div>
        
        <label className="switch" title="Toggle Protection">
          <input type="checkbox" checked={isActive} onChange={handleToggle} />
          <span className="slider"></span>
        </label>
      </header>

      {/* Hero Engine Status */}
      {/* Hero Engine Status */}
      <div className="status-card">
        <div className={`shield-icon ${isActive ? 'active' : 'inactive'}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isActive ? (
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            ) : (
              <circle cx="12" cy="12" r="10"></circle>
            )}
            {isActive && <polyline points="22 4 12 14.01 9 11.01"></polyline>}
            {!isActive && <line x1="15" y1="9" x2="9" y2="15"></line>}
            {!isActive && <line x1="9" y1="9" x2="15" y2="15"></line>}
          </svg>
        </div>
        <div className="status-info">
          <h2>{isActive ? 'System Armed' : 'System Disabled'}</h2>
          <p>{isActive ? 'Local NLP Engine is running' : 'Vulnerable to data leaks'}</p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-label">Prompts Scanned</span>
          <span className="stat-value" style={{color: isActive ? '#f8fafc' : '#52525b'}}>24</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Threats Prevented</span>
          <span className="stat-value" style={{color: isActive ? 'var(--accent-red)' : '#52525b'}}>3</span>
        </div>
      </div>

      {/* Real-time Event Log */}
      <div className="log-section">
        <div className="log-header">Recent Activity</div>
        <div className="log-list" style={{opacity: isActive ? 1 : 0.5}}>
          <div className="log-item">
            <div className="log-icon-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div className="log-text">
              <span className="log-title">API Key Blocked</span>
              <span className="log-time">OpenAI key detected • Just now</span>
            </div>
          </div>

          <div className="log-item">
            <div className="log-icon-wrapper" style={{background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <div className="log-text">
              <span className="log-title">Email Auto-Redacted</span>
              <span className="log-time">contact@company.com • 2h ago</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}