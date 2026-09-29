<<<<<<< HEAD
import { useState } from "react";
import axios from "axios";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const askAI = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/ask", {
        question: question,
      });

      setAnswer(res.data.answer);
    } catch (err) {
      console.error(err);
      setAnswer("Error connecting to backend.");
=======
import {
  useEffect,
  useRef,
  useState,
} from "react";

import axios from "axios";
import toast from "react-hot-toast";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ChatBox from "./components/ChatBox";
import ChatInput from "./components/ChatInput";
import WelcomeScreen from "./components/WelcomeScreen";

function App() {
  const [chats, setChats] = useState(() => {
    try {
      const saved =
        localStorage.getItem("orgmind-chats");

      return saved
        ? JSON.parse(saved)
        : [];
    } catch {
      return [];
    }
  });

  const [activeChatId, setActiveChatId] =
    useState(() => {
      return (
        localStorage.getItem(
          "orgmind-active-chat"
        ) || null
      );
    });

  const [question, setQuestion] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const bottomRef = useRef(null);

  const activeChat =
    chats.find(
      (chat) =>
        chat.id === activeChatId
    ) || null;

  const messages =
    activeChat?.messages || [];

  /* ---------------- SAVE CHATS ---------------- */

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
      localStorage.removeItem(
        "orgmind-active-chat"
      );
    }
  }, [activeChatId]);

  /* ---------------- AUTO SCROLL ---------------- */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* ---------------- TIME ---------------- */

  const currentTime = () =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  /* ---------------- TITLE ---------------- */

  const createChatTitle = (text) => {
    const clean = text.trim();

    return clean.length <= 32
      ? clean
      : `${clean.slice(0, 32)}...`;
  };

  /* ---------------- NEW CHAT ---------------- */

  const newChat = () => {
    const chat = {
      id: crypto.randomUUID(),
      title: "New conversation",
      messages: [],
    };

    setChats((prev) => [
      chat,
      ...prev,
    ]);

    setActiveChatId(chat.id);
    setQuestion("");
    setSidebarOpen(false);
  };

  /* ---------------- SELECT CHAT ---------------- */

  const selectChat = (chatId) => {
    setActiveChatId(chatId);
    setQuestion("");
    setSidebarOpen(false);
  };

  /* ---------------- CLEAR CHAT ---------------- */

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
              title:
                "New conversation",
              messages: [],
            }
          : chat
      )
    );

    setQuestion("");

    toast.success(
      "Conversation cleared"
    );
  };

  /* ---------------- COPY ---------------- */

  const copyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(
        text
      );

      toast.success("Copied!");
    } catch {
      toast.error(
        "Unable to copy message"
      );
    }
  };

  /* ---------------- ADD MESSAGE ---------------- */

  const addMessageToChat = (
    chatId,
    message
  ) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                message,
              ],
            }
          : chat
      )
    );
  };

  /* ---------------- ASK AI ---------------- */

  const askAI = async (
    customQuestion = null
  ) => {
    const text = (
      customQuestion !== null
        ? customQuestion
        : question
    ).trim();

    if (!text || loading) {
      return;
    }

    let chatId =
      activeChatId;

    /*
      Automatically create a chat
      if the user starts typing without
      clicking New Chat.
    */
    if (!chatId) {
      chatId =
        crypto.randomUUID();

      const newConversation = {
        id: chatId,
        title:
          createChatTitle(text),
        messages: [],
      };

      setChats((prev) => [
        newConversation,
        ...prev,
      ]);

      setActiveChatId(chatId);
    }

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
                chat.messages.length ===
                0
                  ? createChatTitle(
                      text
                    )
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

    try {
      const response =
        await axios.post(
          "http://127.0.0.1:8000/ask",
          {
            question: text,
          }
        );

      const answer =
        response?.data?.answer ||
        "The backend returned an empty response.";

      const aiMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer,
        time: currentTime(),
      };

      addMessageToChat(
        chatId,
        aiMessage
      );
    } catch (error) {
      console.error(
        "OrgMind API error:",
        error
      );

      addMessageToChat(
        chatId,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "⚠️ I couldn't connect to the OrgMind backend. Please make sure your FastAPI server is running at `http://127.0.0.1:8000`.",
          time: currentTime(),
        }
      );

      toast.error(
        "Unable to connect to backend"
      );
    } finally {
      setLoading(false);
>>>>>>> a75db40 (Completed professional frontend UI)
    }
  };

  return (
<<<<<<< HEAD
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1>🧠 OrgMind</h1>
      <h2>AI Organizational Memory Agent</h2>

      <h3>AI Chat</h3>

      <textarea
        rows="8"
        placeholder="Ask OrgMind anything..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{
          width: "100%",
          maxWidth: "800px",
          backgroundColor: "#1e293b",
          color: "white",
          border: "1px solid #475569",
          borderRadius: "8px",
          padding: "12px",
          fontSize: "16px",
        }}
      />

      <br />
      <br />

      <button
        onClick={askAI}
        style={{
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "12px 24px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Ask AI
      </button>

      <h3 style={{ marginTop: "30px" }}>Response</h3>

      <div
        style={{
          background: "#1e293b",
          padding: "15px",
          borderRadius: "8px",
          minHeight: "80px",
          maxWidth: "800px",
          whiteSpace: "pre-wrap",
        }}
      >
        {answer}
      </div>
=======
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar-container ${
          sidebarOpen
            ? "open"
            : ""
        }`}
      >
        <Sidebar
          chats={chats}
          activeChatId={
            activeChatId
          }
          onNewChat={newChat}
          onSelectChat={
            selectChat
          }
          onClearChat={
            clearCurrentChat
          }
          onClose={() =>
            setSidebarOpen(false)
          }
        />
      </div>

      {/* Main */}
      <main className="main-content">
        <Navbar
          onOpenSidebar={() =>
            setSidebarOpen(true)
          }
        />

        <section className="chat-area">
          {messages.length === 0 &&
          !loading ? (
            <WelcomeScreen
              onPromptClick={
                askAI
              }
            />
          ) : (
            <ChatBox
              messages={
                messages
              }
              loading={
                loading
              }
              onCopy={
                copyMessage
              }
              bottomRef={
                bottomRef
              }
            />
          )}
        </section>

        <ChatInput
          question={question}
          setQuestion={
            setQuestion
          }
          onSend={() =>
            askAI()
          }
          loading={loading}
        />
      </main>
>>>>>>> a75db40 (Completed professional frontend UI)
    </div>
  );
}

export default App;