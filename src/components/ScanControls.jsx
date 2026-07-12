// src/components/ScanControls.jsx
import React from 'react';

export default function ScanControls({ 
  scanMode, 
  setScanMode, 
  threshold, 
  setThreshold, 
  anonymizeMode, 
  setAnonymizeMode,
  isBackendOnline 
}) {
  return (
    <div className="scan-controls-panel" style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Scan Mode Selector */}
        <div>
          <label style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Engine Mode:</label>
          <select 
            value={scanMode} 
            onChange={(e) => setScanMode(e.target.value)}
            style={{ padding: '0.4rem', borderRadius: '4px' }}
          >
            <option value="FAST">⚡ Fast Scan (Local Regex/Checksum - Instant)</option>
            <option value="DEEP" disabled={!isBackendOnline}>
              🛡️ Deep Scan (Presidio NLP - {isBackendOnline ? 'Online' : 'Offline'})
            </option>
          </select>
        </div>

        {/* Anonymization Mode Selector */}
        <div>
          <label style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Sanitizer Mode:</label>
          <select 
            value={anonymizeMode} 
            onChange={(e) => setAnonymizeMode(e.target.value)}
            style={{ padding: '0.4rem', borderRadius: '4px' }}
          >
            <option value="replace">Replace with Tags ([EMAIL], [PII])</option>
            <option value="mask">Mask Characters (****1234)</option>
            <option value="redact">Remove Entirely</option>
          </select>
        </div>

        {/* NLP Confidence Threshold Slider (Only active in Deep Scan) */}
        {scanMode === 'DEEP' && (
          <div>
            <label style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>
              NLP Confidence: {Math.round(threshold * 100)}%
            </label>
            <input 
              type="range" 
              min="0.3" 
              max="0.95" 
              step="0.05" 
              value={threshold} 
              onChange={(e) => setThreshold(parseFloat(e.target.value))} 
            />
          </div>
        )}
      </div>
    </div>
  );
}