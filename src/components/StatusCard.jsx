export default function StatusCard({ isActive }) {
  return (
    <div className="status-card">
      <div className={`shield-icon ${isActive ? 'active' : 'inactive'}`}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {isActive ? (
            <>
              {/* Official Feather "check-circle" path */}
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </>
          ) : (
            <>
              {/* Official Feather "x-circle" path */}
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </>
          )}
        </svg>
      </div>
      <div className="status-info">
        <h2>{isActive ? 'System Armed' : 'System Disabled'}</h2>
        <p>{isActive ? 'Local NLP Engine is running' : 'Vulnerable to data leaks'}</p>
      </div>
    </div>
  );
}