export default function Header({ isActive, onToggle }) {
  return (
    <header className="header">
      <div className="brand">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--accent-brand)'}}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
        <h1>PromptShield</h1>
        <span className="version-badge">MVP</span>
      </div>
      
      <label className="switch" title="Toggle Protection">
        <input type="checkbox" checked={isActive} onChange={onToggle} />
        <span className="slider"></span>
      </label>
    </header>
  );
}