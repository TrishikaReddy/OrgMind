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
    }
  };

  return (
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
    </div>
  );
}

export default App;