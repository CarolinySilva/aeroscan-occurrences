function Header() {
    return (
      <header className="header">
        <div className="brand">
          <div className="brand-icon">A</div>
  
          <div>
            <h1>AeroScan</h1>
            <span>Security Operations</span>
          </div>
        </div>
  
        <div className="system-status">
          <span className="status-dot" />
          Sistema operacional
        </div>
      </header>
    )
  }
  
  export default Header