import { motion } from "framer-motion";
import { FaRobot } from "react-icons/fa";
import MessageBubble from "./MessageBubble";

function ChatBox({
  messages = [],
  loading = false,
  onCopy,
  bottomRef,
}) {
  return (
    <div className="messages-container">
      {messages.map((message, index) => (
        <MessageBubble
          key={
            message.id ||
            `${message.role}-${message.time}-${index}`
          }
          message={message}
          onCopy={onCopy}
        />
      ))}

      {loading && (
        <motion.div
          className="message-row assistant-row"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="message-avatar assistant-avatar">
            <FaRobot />
          </div>

          <div className="message-content">
            <div className="message-meta">
              <strong>OrgMind</strong>
            </div>

            <div className="typing-bubble">
              <span className="typing-label">
                Thinking
              </span>

              <span className="typing-dots">
                <i />
                <i />
                <i />
              </span>
            </div>
          </div>
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

export default ChatBox;