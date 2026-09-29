import { useEffect, useRef, useState } from "react";
import axios from "axios";

const BACKEND_URL = "http://127.0.0.1:8000";

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getChatTitle(text) {
  const clean = text.trim();

  if (!clean) return "New Chat";

  if (clean.length <= 32) return clean;

  return clean.substring(0, 32) + "...";
}

function createChat() {
  return {
    id: createId(),
    title: "New Chat",
    messages: [],
  };
}

function App() {
  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem("orgmind-chats");

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.error("Could not load saved chats:", error);
    }

    return [];
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    try {
      return localStorage.getItem("orgmind-active-chat") || null;
    } catch {
      return null;
    }
  });

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [conflict, setConflict] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const activeChat =
    chats.find((chat) => chat.id === activeChatId) || null;

  const messages = activeChat?.messages || [];

  useEffect(() => {
    try {
      localStorage.setItem("orgmind-chats", JSON.stringify(chats));
    } catch (error) {
      console.error("Could not save chats:", error);
    }
  }, [chats]);

  useEffect(() => {
    try {
      if (activeChatId) {
        localStorage.setItem("orgmind-active-chat", activeChatId);
      } else {
        localStorage.removeItem("orgmind-active-chat");
      }
    } catch (error) {
      console.error("Could not save active chat:", error);
    }
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading, conflict]);

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const newChat = () => {
    const chat = createChat();

    setChats((previous) => [chat, ...previous]);
    setActiveChatId(chat.id);
    setQuestion("");
    setConflict(null);
    setUploadStatus("");
    setSidebarOpen(false);
  };

  const selectChat = (chatId) => {
    setActiveChatId(chatId);
    setQuestion("");
    setConflict(null);
    setUploadStatus("");
    setSidebarOpen(false);
  };

  const deleteChat = (chatId, event) => {
    event?.stopPropagation();

    const remaining = chats.filter(
      (chat) => chat.id !== chatId
    );

    setChats(remaining);

    if (activeChatId === chatId) {
      if (remaining.length > 0) {
        setActiveChatId(remaining[0].id);
      } else {
        setActiveChatId(null);
      }

      setQuestion("");
      setConflict(null);
    }

    showToast("Conversation deleted", "success");
  };

  const clearChat = () => {
    if (!activeChatId) {
      showToast("No conversation selected", "error");
      return;
    }

    setChats((previous) =>
      previous.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              title: "New Chat",
              messages: [],
            }
          : chat
      )
    );

    setQuestion("");
    setConflict(null);

    showToast("Conversation cleared", "success");
  };

  const addMessage = (chatId, message) => {
    setChats((previous) =>
      previous.map((chat) => {
        if (chat.id !== chatId) {
          return chat;
        }

        return {
          ...chat,
          messages: [...chat.messages, message],
        };
      })
    );
  };

  const updateChatTitle = (chatId, title) => {
    setChats((previous) =>
      previous.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title,
            }
          : chat
      )
    );
  };

  const handleUpload = async (file) => {
    if (!file) return;

    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".txt",
    ];

    const extension =
      "." +
      file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setUploadStatus(
        "❌ Unsupported file. Use PDF, DOC, DOCX or TXT."
      );

      showToast("Unsupported file type", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadStatus(`Uploading ${file.name}...`);

      const response = await axios.post(
        `${BACKEND_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const filename =
        response.data?.filename || file.name;

      setUploadedFiles((previous) => [
        ...previous.filter(
          (name) => name !== filename
        ),
        filename,
      ]);

      setUploadStatus(
        `✅ ${filename} indexed successfully`
      );

      showToast(
        `${filename} uploaded successfully`,
        "success"
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Document upload error:", error);

      const message =
        error.response?.data?.detail ||
        "❌ Failed to upload document.";

      setUploadStatus(message);

      showToast(
        "Document upload failed",
        "error"
      );
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleUpload(file);
    }
  };

  const checkConflict = async (text) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/memory/check-conflict`,
        {
          content: text,
        }
      );

      if (
        response?.data &&
        response.data.conflict === true
      ) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.error(
        "Conflict detection error:",
        error
      );

      return null;
    }
  };

  const handleKeepPrevious = () => {
    setConflict(null);

    addMessage(activeChatId, {
      id: createId(),
      role: "assistant",
      content:
        "ℹ️ The previous organizational information remains the active memory.",
      time: getTime(),
    });

    showToast(
      "Previous information kept",
      "success"
    );
  };

  const handleAcceptNew = async () => {
    if (
      !conflict?.new_information ||
      !activeChatId
    ) {
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${BACKEND_URL}/memory/remember`,
        {
          content: conflict.new_information,
        }
      );

      if (
        response.data &&
        response.data.success === false
      ) {
        throw new Error("Memory update failed");
      }

      const newInformation =
        conflict.new_information;

      setConflict(null);

      addMessage(activeChatId, {
        id: createId(),
        role: "assistant",
        content:
          `✅ Organizational memory updated.\n\n` +
          `The new information is now recorded as the current decision:\n\n` +
          newInformation,
        time: getTime(),
      });

      showToast(
        "New organizational decision saved",
        "success"
      );
    } catch (error) {
      console.error(
        "Memory update error:",
        error
      );

      addMessage(activeChatId, {
        id: createId(),
        role: "assistant",
        content:
          "❌ I couldn't update organizational memory. Please try again.",
        time: getTime(),
      });

      showToast(
        "Could not update memory",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const askAI = async (customQuestion = null) => {
    const text = (
      customQuestion !== null
        ? customQuestion
        : question
    ).trim();

    if (!text || loading) {
      return;
    }

    setConflict(null);
    setQuestion("");

    let chatId = activeChatId;

    if (!chatId) {
      const chat = {
        id: createId(),
        title: getChatTitle(text),
        messages: [],
      };

      chatId = chat.id;

      setChats((previous) => [
        chat,
        ...previous,
      ]);

      setActiveChatId(chat.id);
    } else {
      const existingChat = chats.find(
        (chat) => chat.id === chatId
      );

      if (
        existingChat &&
        existingChat.messages.length === 0
      ) {
        updateChatTitle(
          chatId,
          getChatTitle(text)
        );
      }
    }

    const userMessage = {
      id: createId(),
      role: "user",
      content: text,
      time: getTime(),
    };

    addMessage(chatId, userMessage);

    setLoading(true);

    try {
      const detectedConflict =
        await checkConflict(text);

      if (
        detectedConflict &&
        detectedConflict.conflict === true
      ) {
        setConflict(detectedConflict);
        setLoading(false);

        showToast(
          "Potential organizational conflict detected",
          "warning"
        );

        return;
      }
    } catch (error) {
      console.error(
        "Conflict check failed:",
        error
      );
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/ask`,
        {
          question: text,
        }
      );

      const answer =
        response?.data?.answer ||
        "I received an empty response from the backend.";

      addMessage(chatId, {
        id: createId(),
        role: "assistant",
        content: answer,
        time: getTime(),
        source:
          response?.data?.source ||
          response?.data?.sources ||
          null,
      });
    } catch (error) {
      console.error(
        "OrgMind backend error:",
        error
      );

      addMessage(chatId, {
        id: createId(),
        role: "assistant",
        content:
          "⚠️ I couldn't connect to the OrgMind backend.\n\nPlease make sure the FastAPI server is running at http://127.0.0.1:8000.",
        time: getTime(),
      });

      showToast(
        "Backend connection failed",
        "error"
      );
    } finally {
      setLoading(false);

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      askAI();
    }
  };

  const handlePromptClick = (prompt) => {
    askAI(prompt);
  };

  const copyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);

      showToast(
        "Message copied",
        "success"
      );
    } catch (error) {
      console.error(error);

      showToast(
        "Could not copy message",
        "error"
      );
    }
  };

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <aside
        className={`app-sidebar ${
          sidebarOpen
            ? "sidebar-open"
            : ""
        }`}
      >
        <div className="sidebar-top">
          <div className="brand-row">
            <div className="brand-logo">
              🧠
            </div>

            <div>
              <div className="brand-name">
                OrgMind
              </div>

              <div className="brand-subtitle">
                ORGANIZATIONAL AI
              </div>
            </div>

            <button
              className="mobile-close-button"
              onClick={() =>
                setSidebarOpen(false)
              }
              aria-label="Close sidebar"
            >
              ×
            </button>
          </div>

          <button
            className="new-chat-button"
            onClick={newChat}
          >
            <span>＋</span>
            <span>New conversation</span>
          </button>
        </div>

        <div className="sidebar-middle">
          <div className="sidebar-section-title">
            RECENT CHATS
          </div>

          <div className="chat-history">
            {chats.length === 0 ? (
              <div className="empty-history">
                <span>💬</span>

                <span>
                  Your conversations
                  will appear here.
                </span>
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  className={`history-item ${
                    chat.id === activeChatId
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    selectChat(chat.id)
                  }
                >
                  <span className="history-icon">
                    💬
                  </span>

                  <span className="history-title">
                    {chat.title}
                  </span>

                  <span
                    className="history-delete"
                    onClick={(event) =>
                      deleteChat(
                        chat.id,
                        event
                      )
                    }
                    role="button"
                    tabIndex={0}
                    aria-label="Delete conversation"
                  >
                    ×
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="sidebar-bottom">
          <button
            className="sidebar-action"
            type="button"
            onClick={() =>
              showToast(
                "Settings coming soon",
                "success"
              )
            }
          >
            <span>⚙</span>
            <span>Settings</span>
          </button>

          <button
            className="sidebar-action danger"
            type="button"
            onClick={clearChat}
            disabled={
              !activeChatId ||
              messages.length === 0
            }
          >
            <span>🗑</span>
            <span>
              Clear conversation
            </span>
          </button>

          <div className="sidebar-footer">
            React • FastAPI • Groq • Hindsight
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="app-header">
          <div className="header-left">
            <button
              className="mobile-menu-button"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open sidebar"
            >
              ☰
            </button>

            <div>
              <h1>
                OrgMind Assistant
              </h1>

              <div className="online-status">
                <span className="online-dot" />
                Online
              </div>
            </div>
          </div>

          <div className="header-badge">
            Groq
          </div>
        </header>

        <section className="chat-area">
          {messages.length === 0 &&
            !loading &&
            !conflict && (
              <div className="welcome-screen">
                <div className="welcome-logo">
                  🧠
                </div>

                <h2>
                  Your organization's memory,
                  <br />
                  always with you.
                </h2>

                <p className="welcome-description">
                  Ask questions, upload documents,
                  and let OrgMind remember
                  organizational knowledge.
                </p>

                <div className="quick-prompts">
                  <button
                    onClick={() =>
                      handlePromptClick(
                        "What are the latest decisions made by our organization?"
                      )
                    }
                  >
                    What are the latest decisions
                    made by our organization?
                  </button>

                  <button
                    onClick={() =>
                      handlePromptClick(
                        "Summarize our important projects and their current status."
                      )
                    }
                  >
                    Summarize our important
                    projects and their current
                    status.
                  </button>
                </div>
              </div>
            )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-row ${
                message.role === "user"
                  ? "user-row"
                  : "assistant-row"
              }`}
            >
              <div
                className={`message ${
                  message.role === "user"
                    ? "user-message"
                    : "assistant-message"
                }`}
              >
                <div className="message-header">
                  <strong>
                    {message.role === "user"
                      ? "You"
                      : "OrgMind"}
                  </strong>

                  <span>
                    {message.time}
                  </span>

                  {message.role ===
                    "assistant" && (
                    <button
                      className="copy-message"
                      onClick={() =>
                        copyMessage(
                          message.content
                        )
                      }
                      title="Copy"
                    >
                      ⧉
                    </button>
                  )}
                </div>

                <div className="message-content">
                  {message.content}
                </div>

                {message.source && (
                  <div className="message-source">
                    📄 Source:{" "}
                    {Array.isArray(
                      message.source
                    )
                      ? message.source.join(
                          ", "
                        )
                      : message.source}
                  </div>
                )}
              </div>
            </div>
          ))}

          {conflict && (
            <div className="conflict-card">
              <div className="conflict-header">
                ⚠️ Potential Conflict Detected
              </div>

              <p className="conflict-description">
                OrgMind found information that
                may conflict with an existing
                organizational memory.
              </p>

              <div className="conflict-section">
                <h4>
                  Previous information
                </h4>

                <div className="conflict-old">
                  {conflict.previous_information ||
                    conflict.old_information ||
                    conflict.previous ||
                    "Previous organizational information"}
                </div>
              </div>

              <div className="conflict-section">
                <h4>
                  New information
                </h4>

                <div className="conflict-new">
                  {conflict.new_information ||
                    conflict.new ||
                    "New organizational information"}
                </div>
              </div>

              {conflict.explanation && (
                <div className="conflict-explanation">
                  <strong>
                    Why this matters:
                  </strong>

                  <p>
                    {conflict.explanation}
                  </p>
                </div>
              )}

              <div className="conflict-actions">
                <button
                  className="keep-button"
                  onClick={
                    handleKeepPrevious
                  }
                  disabled={loading}
                >
                  Keep Previous
                </button>

                <button
                  className="accept-button"
                  onClick={
                    handleAcceptNew
                  }
                  disabled={loading}
                >
                  Accept New Decision
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="thinking-message">
              <span className="thinking-icon">
                🤖
              </span>

              <span>
                OrgMind is thinking
              </span>

              <span className="thinking-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </section>

        <div className="input-area">
          {uploadStatus && (
            <div
              className={`upload-status ${
                uploadStatus.startsWith("❌")
                  ? "upload-error"
                  : uploadStatus.startsWith("✅")
                  ? "upload-success"
                  : ""
              }`}
            >
              {uploadStatus}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <div className="chat-input-wrapper">
            <button
              type="button"
              className="upload-button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={loading}
              title="Upload document"
            >
              📎
            </button>

            <textarea
              ref={textareaRef}
              className="chat-input"
              value={question}
              onChange={(event) =>
                setQuestion(
                  event.target.value
                )
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask OrgMind anything..."
              rows={1}
              disabled={loading}
            />

            <button
              type="button"
              className="send-button"
              onClick={() => askAI()}
              disabled={
                loading ||
                !question.trim()
              }
            >
              {loading ? "..." : "➤"}
            </button>
          </div>

          <div className="input-hint">
            📎 PDF, DOCX, TXT&nbsp;&nbsp; • &nbsp;&nbsp;
            Enter to send&nbsp;&nbsp; • &nbsp;&nbsp;
            Shift + Enter for a new line
          </div>
        </div>
      </main>

      {toast && (
        <div
          className={`app-toast ${
            toast.type === "error"
              ? "toast-error"
              : toast.type === "warning"
              ? "toast-warning"
              : "toast-success"
          }`}
        >
          {toast.type === "error"
            ? "❌"
            : toast.type === "warning"
            ? "⚠️"
            : "✅"}

          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;