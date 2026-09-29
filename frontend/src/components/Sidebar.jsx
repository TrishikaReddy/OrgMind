import {
  FaPlus,
  FaComments,
  FaCog,
  FaTrash,
  FaTimes,
} from "react-icons/fa";

function Sidebar({
  chats = [],
  activeChatId,
  onNewChat,
  onSelectChat,
  onClearChat,
  onClose,
}) {
  return (
    <aside className="app-sidebar">

      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          🧠
        </div>

        <div>
          <div className="brand-name">OrgMind</div>
          <div className="brand-subtitle">
            ORGANIZATIONAL AI
          </div>
        </div>

        {/* Mobile close button */}
        <button
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <FaTimes />
        </button>
      </div>

      {/* New Chat */}
      <button
        className="new-chat-button"
        onClick={onNewChat}
      >
        <FaPlus />
        <span>New conversation</span>
      </button>

      {/* Recent Chats */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">
          RECENT CHATS
        </div>

        <div className="chat-list">

          {chats.length === 0 ? (
            <div className="empty-chats">
              <FaComments />

              <span>
                Your conversations will appear here.
              </span>
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                className={`chat-history-item ${
                  chat.id === activeChatId
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  onSelectChat(chat.id);
                  onClose?.();
                }}
              >
                <FaComments />

                <span>
                  {chat.title || "New conversation"}
                </span>
              </button>
            ))
          )}

        </div>
      </div>

      {/* Bottom section */}
      <div className="sidebar-bottom">

        <button
          className="sidebar-action"
          onClick={() => {
            // Settings will be implemented later
            alert("Settings coming soon.");
          }}
        >
          <FaCog />
          <span>Settings</span>
        </button>

        <button
          className="sidebar-action danger"
          onClick={onClearChat}
          disabled={chats.length === 0}
        >
          <FaTrash />
          <span>Clear conversation</span>
        </button>

        <div className="sidebar-footer">
          React • FastAPI • Groq
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;