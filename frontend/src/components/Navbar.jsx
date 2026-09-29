import { FaBars } from "react-icons/fa";

function Navbar({ onOpenSidebar }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="mobile-menu-button"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <FaBars />
        </button>

        <div>
          <h1>OrgMind Assistant</h1>

          <div className="online-status">
            <span className="online-dot" />
            Online
          </div>
        </div>
      </div>

      <div className="header-badge">
        <span>Groq</span>
      </div>
    </header>
  );
}

export default Navbar;
