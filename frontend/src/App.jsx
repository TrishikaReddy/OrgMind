import { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ChatBox from "./components/ChatBox";
import ChatInput from "./components/ChatInput";

function App() {
  // -----------------------------
  // CHAT STATE
  // -----------------------------

  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem("orgmind-chats");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to load chats:", error);
      return [];
    }
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    return localStorage.getItem("orgmind-active-chat") || null;
  });

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const bottomRef = useRef(null);

  // -----------------------------
  // ACTIVE CHAT
  // -----------------------------

  const activeChat =
    chats.find((chat) => chat.id === activeChatId) || null;

  const messages = activeChat?.messages || [];

  // -----------------------------
  // SAVE CHAT HISTORY
  // -----------------------------

  useEffect(() => {
    localStorage.setItem(
      "orgmind-chats",
      JSON.stringify(chats)
    );
  }, [chats]);

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem(
        "orgmind-active-chat",
        activeChatId
      );
    } else {
      localStorage.removeItem("orgmind-active-chat");
    }
  }, [activeChatId]);

  // -----------------------------
  // AUTO SCROLL
  // -----------------------------

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // -----------------------------
  // TIME
  // -----------------------------

  const getTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // -----------------------------
  // CHAT TITLE
  // -----------------------------

  const getChatTitle = (text) => {
    const cleanText = text.trim();

    if (cleanText.length <= 30) {
      return cleanText;
    }

    return cleanText.substring(0, 30) + "...";
  };

  // -----------------------------
  // CREATE NEW CHAT
  // -----------------------------

  const newChat = () => {
    const newConversation = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [],
    };

    setChats((previousChats) => [
      newConversation,
      ...previousChats,
    ]);

    setActiveChatId(newConversation.id);
    setQuestion("");
    setSidebarOpen(false);

    toast.success("New chat created");
  };

  // -----------------------------
  // SELECT CHAT
  // -----------------------------

  const selectChat = (chatId) => {
    setActiveChatId(chatId);
    setQuestion("");
    setSidebarOpen(false);
  };

  // -----------------------------
  // CLEAR CURRENT CHAT
  // -----------------------------

  const clearChat = () => {
    if (!activeChatId) {
      toast("No chat selected");
      return;
    }

    setChats((previousChats) =>
      previousChats.map((chat) => {
        if (chat.id !== activeChatId) {
          return chat;
        }

        return {
          ...chat,
          title: "New Chat",
          messages: [],
        };
      })
    );

    setQuestion("");

    toast.success("Chat cleared");
  };

  // -----------------------------
  // COPY MESSAGE
  // -----------------------------

  const copyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied!");
    } catch (error) {
      console.error(error);
      toast.error("Could not copy");
    }
  };

  // -----------------------------
  // ADD MESSAGE
  // -----------------------------

  const addMessage = (chatId, message) => {
    setChats((previousChats) =>
      previousChats.map((chat) => {
        if (chat.id !== chatId) {
          return chat;
        }

        return {
          ...chat,
          messages: [
            ...chat.messages,
            message,
          ],
        };
      })
    );
  };

  // -----------------------------
  // ASK AI
  // -----------------------------

  const askAI = async (prompt = null) => {
    const text = (
      prompt !== null
        ? prompt
        : question
    ).trim();

    if (!text || loading) {
      return;
    }

    let chatId = activeChatId;

    // Create a chat automatically
    // if none exists.
    if (!chatId) {
      chatId = crypto.randomUUID();

      const newConversation = {
        id: chatId,
        title: getChatTitle(text),
        messages: [],
      };

      setChats((previousChats) => [
        newConversation,
        ...previousChats,
      ]);

      setActiveChatId(chatId);
    }

    // -----------------------------
    // USER MESSAGE
    // -----------------------------

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      time: getTime(),
    };

    setChats((previousChats) =>
      previousChats.map((chat) => {
        if (chat.id !== chatId) {
          return chat;
        }

        return {
          ...chat,

          title:
            chat.messages.length === 0
              ? getChatTitle(text)
              : chat.title,

          messages: [
            ...chat.messages,
            userMessage,
          ],
        };
      })
    );

    setQuestion("");
    setLoading(true);

    // -----------------------------
    // FASTAPI REQUEST
    // -----------------------------

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/ask",
        {
          question: text,
        }
      );

      const answer =
        response?.data?.answer ||
        "I received an empty response from the backend.";

      // -----------------------------
      // AI MESSAGE
      // -----------------------------

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer,
        time: getTime(),
      };

      addMessage(
        chatId,
        assistantMessage
      );
    } catch (error) {
      console.error(
        "OrgMind backend error:",
        error
      );

      const errorMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "⚠️ I couldn't connect to the OrgMind backend.\n\nPlease make sure the FastAPI server is running on `http://127.0.0.1:8000`.",
        time: getTime(),
      };

      addMessage(
        chatId,
        errorMessage
      );

      toast.error(
        "Backend connection failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // RENDER
  // -----------------------------

  return (
    <div className="app-shell">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`sidebar-container ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={newChat}
          onSelectChat={selectChat}
          onClearChat={clearChat}
          onClose={() =>
            setSidebarOpen(false)
          }
        />
      </aside>

      {/* MAIN */}
      <main className="main-content">

        {/* NAVBAR */}
        <Navbar
          onOpenSidebar={() =>
            setSidebarOpen(true)
          }
        />

        {/* CHAT AREA */}
        <section className="chat-area">

          {messages.length === 0 && !loading ? (
            <div className="welcome-screen">

              <div className="welcome-logo">
                🧠
              </div>

              <h2>
                Welcome to{" "}
                <span>OrgMind</span>
              </h2>

              <p className="welcome-description">
                Your AI organizational memory
                assistant. Ask questions about
                projects, decisions, documents,
                processes, and organizational
                knowledge.
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
                  Summarize our important
                  projects and their current
                  status.
                </button>

              </div>

            </div>
          ) : (
            <ChatBox
              messages={messages}
              loading={loading}
              onCopy={copyMessage}
              bottomRef={bottomRef}
            />
          )}

        </section>

        {/* INPUT */}
        <ChatInput
          question={question}
          setQuestion={setQuestion}
          onSend={() => askAI()}
          loading={loading}
        />

      </main>
    </div>
  );
}

export default App;