import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { FaCopy, FaRobot, FaUserCircle } from "react-icons/fa";

function MessageBubble({ message, onCopy }) {
  const isUser = message.role === "user";

  return (
    <motion.article
      className={`message-row ${isUser ? "user-row" : "assistant-row"}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div
        className={`message-avatar ${
          isUser ? "user-avatar" : "assistant-avatar"
        }`}
      >
        {isUser ? <FaUserCircle /> : <FaRobot />}
      </div>

      <div className="message-content">
        <div className="message-meta">
          <strong>{isUser ? "You" : "OrgMind"}</strong>
          <span>{message.time}</span>

          {!isUser && (
            <button
              className="copy-button"
              onClick={() => onCopy(message.content)}
              title="Copy response"
              aria-label="Copy response"
            >
              <FaCopy />
            </button>
          )}
        </div>

        <div
          className={`message-bubble ${
            isUser ? "user-bubble" : "assistant-bubble"
          }`}
        >
          <ReactMarkdown
            components={{
              a: ({ node, ...props }) => (
                <a {...props} target="_blank" rel="noreferrer" />
              ),
              img: ({ node, ...props }) => (
                <img
                  {...props}
                  alt={props.alt || "OrgMind image"}
                  loading="lazy"
                />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </motion.article>
  );
}

export default MessageBubble;
