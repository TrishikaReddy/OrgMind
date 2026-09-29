import { useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { motion } from "framer-motion";

function ChatInput({
  question,
  setQuestion,
  onSend,
  loading = false,
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      180
    )}px`;
  }, [question]);

  const handleKeyDown = (e) => {
    // Enter = send
    // Shift + Enter = new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (!loading && question.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="chat-input-wrapper">
      <div className="composer">

        <textarea
          ref={textareaRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask OrgMind anything..."
          rows={1}
          disabled={loading}
          aria-label="Message OrgMind"
        />

        <motion.button
          type="button"
          className="send-button"
          onClick={onSend}
          disabled={loading || !question.trim()}
          whileHover={
            !loading && question.trim()
              ? { scale: 1.03 }
              : {}
          }
          whileTap={
            !loading && question.trim()
              ? { scale: 0.96 }
              : {}
          }
          aria-label="Send message"
        >
          {loading ? (
            <span className="send-spinner" />
          ) : (
            <FaPaperPlane />
          )}

          <span>
            {loading ? "Thinking" : "Send"}
          </span>
        </motion.button>

      </div>

      <div className="composer-hint">
        <span>Enter to send</span>
        <span>•</span>
        <span>Shift + Enter for a new line</span>
      </div>
    </div>
  );
}

export default ChatInput;