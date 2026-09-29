import { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ChatBox from "./components/ChatBox";
import ChatInput from "./components/ChatInput";
import WelcomeScreen from "./components/WelcomeScreen";

function App() {
  // ================================
  // CHAT STATE
  // ================================

  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem("orgmind-chats");
      return saved ? JSON.parse(saved) : [];
    } catch {
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

  // ================================
  // ACTIVE CHAT
  // ================================

  const activeChat =
    chats.find((chat) => chat.id === activeChatId) || null;

  const messages = activeChat?.messages || [];

  // ================================
  // SAVE CHATS
  // ================================

  useEffect(() => {
    localStorage.setItem("orgmind-chats", JSON.stringify(chats));
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

  // ================================
  // AUTO SCROLL
  // ================================

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // ================================
  // TIME
  // ================================

  const currentTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ================================
  // CHAT TITLE
  // ================================

  const createChatTitle = (text) => {
    const clean = text.trim();

    if (clean.length <= 32) {
      return clean;
    }

    return `${clean.slice(0, 32)}...`;
  };

  // ================================
  // NEW CHAT
  // ================================

  const newChat = () => {
    const chat = {
      id: crypto.randomUUID(),
      title: "New conversation",
      messages: [],
    };

    setChats((prev) => [chat, ...prev]);

    setActiveChatId(chat.id);
    setQuestion("");
    setSidebarOpen(false);
  };

  // ================================
  // SELECT CHAT
  // ================================

  const selectChat = (chatId) => {
    setActiveChatId(chatId);
    setQuestion("");
    setSidebarOpen(false);
  };

  // ================================
  // CLEAR CURRENT CHAT
  // ================================

  const clearCurrentChat = () => {
    if (!activeChatId) {
      toast("No conversation selected.");
      return;
    }

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              title: "New conversation",
              messages: [],
            }
          : chat
      )
    );

    setQuestion("");

    toast.success("Conversation cleared");
  };

  // ================================
  // COPY MESSAGE
  // ================================

  const copyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied!");
    } catch {
      toast.error("Unable to copy message");
    }
  };

  // ================================
  // ADD MESSAGE
  // ================================

  const addMessageToChat = (chatId, message) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, message],
            }
          : chat
      )
    );
  };

  // ================================
  // ASK AI
  // ================================

  const askAI = async (customQuestion = null) => {
    const text = (
      customQuestion !== null
        ? customQuestion
        : question
    ).trim();

    if (!text || loading) {
      return;
    }

    let chatId = activeChatId;

    // Automatically create chat
    // when user asks first question
    if (!chatId) {
      chatId = crypto.randomUUID();

      const newConversation = {
        id: chatId,
        title: createChatTitle(text),
        messages: [],
      };

      setChats((prev) => [
        newConversation,
        ...prev,
      ]);

      setActiveChatId(chatId);
    }

    // ================================
    // USER MESSAGE
    // ================================

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      time: currentTime(),
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,

              title:
                chat.messages.length === 0
                  ? createChatTitle(text)
                  : chat.title,

              messages: [
                ...chat.messages,
                userMessage,
              ],
            }
          : chat
      )
    );

    setQuestion("");
    setLoading(true);

    // ================================
    // BACKEND REQUEST
    // ================================

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/ask",
        {
          question: text,
        }
      );

      const answer =
        response?.data?.answer ||
        "The backend returned an empty response.";

      // ================================
      // AI MESSAGE
      // ================================

      const aiMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer,
        time: currentTime(),
      };

      addMessageToChat(chatId, aiMessage);
    } catch (error) {
      console.error(
        "OrgMind API error:",
        error
      );

      const errorMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "⚠️ I couldn't connect to the OrgMind backend.\n\nPlease make sure your FastAPI server is running at `http://127.0.0.1:8000`.",
        time: currentTime(),
      };

      addMessageToChat(
        chatId,
        errorMessage
      );

      toast.error(
        "Unable to connect to backend"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // RENDER
  // ================================

  return (
    <div className="app-shell">

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`sidebar-container ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={newChat}
          onSelectChat={selectChat}
          onClearChat={clearCurrentChat}
          onClose={() =>
            setSidebarOpen(false)
          }
        />
      </div>

      {/* MAIN APPLICATION */}
      <main className="main-content">

        {/* NAVBAR */}
        <Navbar
          onOpenSidebar={() =>
            setSidebarOpen(true)
          }
        />

        {/* CHAT */}
        <section className="chat-area">

          {messages.length === 0 && !loading ? (
            <WelcomeScreen
              onPromptClick={askAI}
            />
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