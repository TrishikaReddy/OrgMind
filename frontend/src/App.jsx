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

  return `${clean.substring(0, 32)}...`;
}

function createChat() {
  return {
    id: createId(),
    title: "New Chat",
    messages: [],
  };
}

function App() {
  // =========================================================
  // STATE
  // =========================================================

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
      console.error("Could not load chats:", error);
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

  const [activeView, setActiveView] = useState("chat");
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

  // =========================================================
  // PERSISTENCE
  // =========================================================

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

  // =========================================================
  // TOAST
  // =========================================================

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // =========================================================
  // CHAT
  // =========================================================

  const newChat = () => {
    const chat = createChat();

    setChats((previous) => [chat, ...previous]);
    setActiveChatId(chat.id);
    setActiveView("chat");

    setQuestion("");
    setConflict(null);
    setUploadStatus("");
    setSidebarOpen(false);
  };

  const selectChat = (chatId) => {
    setActiveChatId(chatId);
    setActiveView("chat");

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

    showToast("Conversation deleted");
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

    showToast("Conversation cleared");
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

  // =========================================================
  // UPLOAD
  // =========================================================

  const handleUpload = async (file) => {
    if (!file) return;

    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".txt",
    ];

    const extension =
      "." + file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setUploadStatus(
        "Unsupported file. Use PDF, DOC, DOCX or TXT."
      );

      showToast("Unsupported file type", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus("File is larger than 10MB.");
      showToast("Maximum file size is 10MB", "error");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    try {
      setLoading(true);
      setUploadStatus(`Uploading ${file.name}...`);

      console.log("=================================");
      console.log("ORG MIND FILE UPLOAD");
      console.log("File:", file.name);
      console.log("Size:", file.size);
      console.log(
        "URL:",
        `${BACKEND_URL}/upload`
      );
      console.log("=================================");

      const response = await axios.post(
        `${BACKEND_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(
        "Upload response:",
        response.data
      );

      const filename =
        response.data?.filename ||
        response.data?.file_name ||
        response.data?.name ||
        file.name;

      setUploadedFiles((previous) => {
        const filtered = previous.filter(
          (name) => name !== filename
        );

        return [...filtered, filename];
      });

      setUploadStatus(
        `${filename} indexed successfully`
      );

      showToast(
        `${filename} uploaded successfully`
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(
        "================================="
      );

      console.error(
        "ORG MIND UPLOAD ERROR"
      );

      console.error(error);

      console.error(
        "Response:",
        error.response?.data
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "================================="
      );

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to upload document.";

      setUploadStatus(
        `Upload failed: ${message}`
      );

      showToast(
        "Document upload failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    console.log(
      "Selected file:",
      file.name
    );

    handleUpload(file);
  };

  const openFilePicker = () => {
    if (loading) {
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // =========================================================
  // CONFLICT
  // =========================================================

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

    if (!activeChatId) return;

    addMessage(activeChatId, {
      id: createId(),
      role: "assistant",
      content:
        "The previous organizational information remains the active memory.",
      time: getTime(),
    });

    showToast("Previous information kept");
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
          `Organizational memory updated.\n\n` +
          `The new information is now recorded as the current decision:\n\n` +
          newInformation,
        time: getTime(),
      });

      showToast(
        "New organizational decision saved"
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
          "I couldn't update organizational memory. Please try again.",
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

  // =========================================================
  // ASK AI
  // =========================================================

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

    addMessage(chatId, {
      id: createId(),
      role: "user",
      content: text,
      time: getTime(),
    });

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
          "I couldn't connect to the OrgMind backend. Please make sure the FastAPI server is running.",
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

  const copyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Message copied");
    } catch {
      showToast(
        "Could not copy message",
        "error"
      );
    }
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const changeView = (view) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  // =========================================================
  // CHAT
  // =========================================================

  const renderChat = () => (
    <section className="chat-page">

      <div className="upload-card">

        <div
          className="upload-drop-zone"
          onClick={openFilePicker}
        >
          <div className="upload-cloud">
            ☁
          </div>

          <h3>
            Drag & Drop your files here
          </h3>

          <p>
            or click to browse
          </p>

          <div className="file-types">
            <span>📕 PDF</span>
            <span>📘 DOCX</span>
            <span>📄 TXT</span>
          </div>

          <small>
            Supports PDF, DOCX, TXT • Max file size: 10MB
          </small>
        </div>

      </div>

      {uploadStatus && (
        <div
          className={`upload-status ${
            uploadStatus
              .toLowerCase()
              .includes("failed") ||
            uploadStatus
              .toLowerCase()
              .includes("unsupported")
              ? "upload-error"
              : ""
          }`}
        >
          ✓ {uploadStatus}
        </div>
      )}

      <div className="chat-content">

        {messages.length === 0 &&
        !loading &&
        !conflict ? (

          <div className="welcome-screen">

            <div className="welcome-icon">
              🧠
            </div>

            <h2>
              Your organization's memory,
              <br />
              always with you.
            </h2>

            <p>
              Ask questions, upload documents,
              and let OrgMind remember
              organizational knowledge.
            </p>

            <div className="quick-prompts">

              <button
                onClick={() =>
                  askAI(
                    "What are the latest decisions made by our organization?"
                  )
                }
              >
                What are the latest decisions
                made by our organization?
              </button>

              <button
                onClick={() =>
                  askAI(
                    "Summarize our important projects and their current status."
                  )
                }
              >
                Summarize our important projects
                and their current status.
              </button>

            </div>

          </div>

        ) : (

          <div className="messages-container">

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

                    {message.role === "assistant" && (
                      <button
                        className="copy-message"
                        onClick={() =>
                          copyMessage(
                            message.content
                          )
                        }
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
                        ? message.source.join(", ")
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

                <p>
                  OrgMind found information that
                  may conflict with existing
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
                <span>🤖</span>
                OrgMind is thinking
                <span className="thinking-dots">
                  ...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

        )}

      </div>

      <div className="chat-input-section">

        <div className="chat-input-wrapper">

          <button
            className="input-icon-button"
            onClick={openFilePicker}
            disabled={loading}
            title="Upload document"
          >
            📎
          </button>

          <textarea
            ref={textareaRef}
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about documents, team, or organization..."
            rows={1}
            disabled={loading}
          />

          <button
            className="send-button"
            onClick={() => askAI()}
            disabled={
              loading ||
              !question.trim()
            }
          >
            ➤
          </button>

        </div>

        <div className="input-hint">
          📎 PDF, DOCX, TXT
          <span>•</span>
          Enter to send
          <span>•</span>
          Shift + Enter for a new line
        </div>

      </div>

    </section>
  );

  // =========================================================
  // DOCUMENTS
  // =========================================================

  const renderDocuments = () => (
    <section className="content-page">

      <div className="page-heading">

        <div>

          <span className="eyebrow">
            KNOWLEDGE CENTER
          </span>

          <h2>
            Documents
          </h2>

          <p>
            Upload and manage your organization's
            knowledge.
          </p>

        </div>

        <button
          className="primary-button"
          onClick={openFilePicker}
          disabled={loading}
        >
          + Upload Document
        </button>

      </div>

      {uploadStatus && (
        <div
          className={`upload-status ${
            uploadStatus
              .toLowerCase()
              .includes("failed") ||
            uploadStatus
              .toLowerCase()
              .includes("unsupported")
              ? "upload-error"
              : ""
          }`}
        >
          ✓ {uploadStatus}
        </div>
      )}

      <div className="document-grid">

        {uploadedFiles.length === 0 ? (

          <div className="empty-documents">

            <div className="empty-icon">
              📄
            </div>

            <h3>
              No documents uploaded yet
            </h3>

            <p>
              Upload your first organizational
              document to build your knowledge base.
            </p>

            <button
              className="primary-button"
              onClick={openFilePicker}
              disabled={loading}
            >
              Upload Document
            </button>

          </div>

        ) : (

          uploadedFiles.map((file) => (

            <div
              className="document-card"
              key={file}
            >

              <div className="document-icon">
                {file
                  .toLowerCase()
                  .endsWith(".pdf")
                  ? "📕"
                  : file
                      .toLowerCase()
                      .endsWith(".docx")
                  ? "📘"
                  : "📄"}
              </div>

              <div className="document-info">

                <strong>
                  {file}
                </strong>

                <span>
                  Indexed successfully
                </span>

              </div>

              <div className="indexed-badge">
                ✓ Indexed
              </div>

            </div>

          ))

        )}

      </div>

    </section>
  );

  // =========================================================
  // KNOWLEDGE BASE
  // =========================================================

  const renderKnowledge = () => (
    <section className="content-page">

      <div className="page-heading">

        <div>

          <span className="eyebrow">
            ORGANIZATIONAL MEMORY
          </span>

          <h2>
            Knowledge Base
          </h2>

          <p>
            Important information remembered by OrgMind.
          </p>

        </div>

      </div>

      <div className="knowledge-grid">

        <div className="knowledge-card">

          <div className="knowledge-icon">
            🧠
          </div>

          <h3>
            Conversation Memory
          </h3>

          <p>
            OrgMind remembers information from
            your organizational conversations.
          </p>

          <div className="knowledge-stat">
            {chats.length}
            <span>
              conversations
            </span>
          </div>

        </div>

        <div className="knowledge-card">

          <div className="knowledge-icon">
            📚
          </div>

          <h3>
            Document Knowledge
          </h3>

          <p>
            Indexed documents are available
            to the AI for contextual answers.
          </p>

          <div className="knowledge-stat">
            {uploadedFiles.length}
            <span>
              documents
            </span>
          </div>

        </div>

        <div className="knowledge-card">

          <div className="knowledge-icon">
            🔄
          </div>

          <h3>
            Decision Management
          </h3>

          <p>
            Conflicting organizational information
            can be reviewed before updating memory.
          </p>

          <div className="memory-status">
            ● Memory system active
          </div>

        </div>

      </div>

    </section>
  );

  // =========================================================
  // SETTINGS
  // =========================================================

  const renderSettings = () => (
    <section className="content-page">

      <div className="page-heading">

        <div>

          <span className="eyebrow">
            CONFIGURATION
          </span>

          <h2>
            Settings
          </h2>

          <p>
            OrgMind system configuration.
          </p>

        </div>

      </div>

      <div className="settings-list">

        <div className="settings-card">

          <div>
            <strong>
              AI Provider
            </strong>

            <p>
              Large language model provider
            </p>
          </div>

          <span className="setting-value">
            Groq
          </span>

        </div>

        <div className="settings-card">

          <div>
            <strong>
              Backend
            </strong>

            <p>
              Application API
            </p>
          </div>

          <span className="setting-value">
            FastAPI
          </span>

        </div>

        <div className="settings-card">

          <div>
            <strong>
              Memory Engine
            </strong>

            <p>
              Organizational memory system
            </p>
          </div>

          <span className="setting-value">
            Hindsight
          </span>

        </div>

        <div className="settings-card">

          <div>
            <strong>
              System Status
            </strong>

            <p>
              Current backend connection
            </p>
          </div>

          <span className="system-online">
            ● Connected
          </span>

        </div>

      </div>

    </section>
  );

  // =========================================================
  // MAIN RENDER
  // =========================================================

  return (
    <div className="app-shell">

      {/* =====================================================
          GLOBAL FILE INPUT
          IMPORTANT: THIS IS OUTSIDE renderChat()
          ===================================================== */}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside
        className={`app-sidebar ${
          sidebarOpen
            ? "sidebar-open"
            : ""
        }`}
      >

        <div className="sidebar-brand">

          <div className="brand-logo">
            🧠
          </div>

          <div>

            <div className="brand-name">
              OrgMind
            </div>

            <div className="brand-subtitle">
              AI ORGANIZATIONAL MEMORY
            </div>

          </div>

          <button
            className="mobile-close-button"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            ×
          </button>

        </div>

        <button
          className="new-chat-button"
          onClick={newChat}
        >
          <span>＋</span>
          New conversation
        </button>

        <nav className="sidebar-nav">

          <button
            className={
              activeView === "chat"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              changeView("chat")
            }
          >
            <span>💬</span>
            Chat
          </button>

          <button
            className={
              activeView === "documents"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              changeView("documents")
            }
          >
            <span>📄</span>
            Documents
          </button>

          <button
            className={
              activeView === "knowledge"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              changeView("knowledge")
            }
          >
            <span>🗄</span>
            Knowledge Base
          </button>

          <button
            className={
              activeView === "settings"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              changeView("settings")
            }
          >
            <span>⚙</span>
            Settings
          </button>

        </nav>

        <div className="sidebar-divider" />

        <div className="sidebar-documents">

          <div className="sidebar-section-title">

            <span>
              UPLOADED DOCUMENTS
            </span>

            <span className="count-badge">
              {uploadedFiles.length}
            </span>

          </div>

          {uploadedFiles.length === 0 ? (

            <div className="sidebar-empty">
              No documents yet
            </div>

          ) : (

            uploadedFiles
              .slice(-6)
              .reverse()
              .map((file) => (

                <div
                  className="sidebar-document"
                  key={file}
                >

                  <span className="sidebar-file-icon">
                    {file
                      .toLowerCase()
                      .endsWith(".pdf")
                      ? "📕"
                      : "📄"}
                  </span>

                  <div className="sidebar-file-info">

                    <span>
                      {file}
                    </span>

                    <small>
                      Indexed
                    </small>

                  </div>

                </div>

              ))

          )}

        </div>

        <div className="sidebar-bottom">

          <div className="sidebar-tip">

            <div>
              ✨
            </div>

            <strong>
              Smarter context.
              <br />
              Better decisions.
            </strong>

            <p>
              OrgMind helps your team
              remember what matters.
            </p>

          </div>

          <button
            className="clear-button"
            onClick={clearChat}
            disabled={
              !activeChatId ||
              messages.length === 0
            }
          >
            🗑 Clear conversation
          </button>

          <div className="sidebar-footer">
            React • FastAPI • Groq • Hindsight
          </div>

        </div>

      </aside>

      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="main-content">

        <header className="app-header">

          <div className="header-left">

            <button
              className="mobile-menu-button"
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              ☰
            </button>

            <div className="header-brand-mobile">
              OrgMind
            </div>

            <div className="header-title">

              <h1>
                {activeView === "chat"
                  ? "OrgMind Assistant"
                  : activeView === "documents"
                  ? "Documents"
                  : activeView === "knowledge"
                  ? "Knowledge Base"
                  : "Settings"}
              </h1>

              <div className="online-status">
                <span className="online-dot" />
                Online
              </div>

            </div>

          </div>

          <div className="header-right">

            <button className="header-icon">
              ⌕
            </button>

            <button className="header-icon notification">
              🔔
              <span />
            </button>

            <div className="user-profile">

              <div className="user-avatar">
                S
              </div>

              <div className="user-info">

                <strong>
                  OrgMind User
                </strong>

                <small>
                  Product Team
                </small>

              </div>

              <span>
                ⌄
              </span>

            </div>

          </div>

        </header>

        <div className="page-layout">

          <div className="page-main">

            {activeView === "chat" &&
              renderChat()}

            {activeView === "documents" &&
              renderDocuments()}

            {activeView === "knowledge" &&
              renderKnowledge()}

            {activeView === "settings" &&
              renderSettings()}

          </div>

          {/* RIGHT DASHBOARD */}

          <aside className="right-panel">

            <div className="org-card">

              <div className="org-card-icon">
                🧠
              </div>

              <div>

                <h3>
                  OrgMind
                </h3>

                <p>
                  Your organization remembers.
                </p>

              </div>

            </div>

            <div className="dashboard-title">
              Dashboard
            </div>

            <div className="stat-grid">

              <div className="stat-card">

                <div className="stat-icon">
                  📄
                </div>

                <strong>
                  {uploadedFiles.length}
                </strong>

                <span>
                  Uploaded Documents
                </span>

              </div>

              <div className="stat-card">

                <div className="stat-icon">
                  💬
                </div>

                <strong>
                  {chats.length}
                </strong>

                <span>
                  Conversation Memory
                </span>

              </div>

            </div>

            <div className="activity-card">

              <div className="activity-heading">

                <span>
                  ◷
                </span>

                Recent Activity

              </div>

              {uploadedFiles.length === 0 ? (

                <div className="activity-empty">
                  No recent activity
                </div>

              ) : (

                uploadedFiles
                  .slice(-5)
                  .reverse()
                  .map((file) => (

                    <div
                      className="activity-item"
                      key={file}
                    >

                      <div className="activity-check">
                        ✓
                      </div>

                      <div>

                        <strong>
                          Indexed Successfully
                        </strong>

                        <span>
                          {file}
                        </span>

                      </div>

                    </div>

                  ))

              )}

            </div>

            <div className="smart-card">

              <div className="smart-icon">
                ✨
              </div>

              <h3>
                Smarter Context.
                <br />
                Better Decisions.
              </h3>

              <p>
                OrgMind helps your team find
                answers, remember what matters,
                and move faster.
              </p>

              <div className="smart-actions">

                <button
                  onClick={() =>
                    changeView("chat")
                  }
                >
                  ⌕ Search
                </button>

                <button
                  onClick={() =>
                    changeView("knowledge")
                  }
                >
                  🧠 Remember
                </button>

                <button
                  onClick={() =>
                    changeView("documents")
                  }
                >
                  ⚡ Get Things Done
                </button>

              </div>

            </div>

          </aside>

        </div>

      </main>

      {/* TOAST */}

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

          <span>
            {toast.type === "error"
              ? "❌"
              : toast.type === "warning"
              ? "⚠️"
              : "✓"}
          </span>

          {toast.message}

        </div>
      )}

    </div>
  );
}

export default App;