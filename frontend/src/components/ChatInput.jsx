import { useEffect, useRef, useState } from "react";
import {
  FaPaperPlane,
  FaPaperclip,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";

function ChatInput({
  question,
  setQuestion,
  onSend,
  loading = false,
}) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (!loading && !uploading && question.trim()) {
        onSend();
      }
    }
  };

  const handleUploadClick = () => {
    if (!uploading && !loading) {
      fileInputRef.current?.click();
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];

    e.target.value = "";

    if (!file) return;

    const fileName = file.name.toLowerCase();

    const allowed =
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".docx") ||
      fileName.endsWith(".txt");

    if (!allowed) {
      setUploadSuccess(false);
      setUploadStatus(
        "Only PDF, DOCX and TXT files are supported."
      );
      return;
    }

    try {
      setUploading(true);
      setUploadSuccess(false);
      setUploadStatus(`Uploading ${file.name}...`);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://127.0.0.1:8000/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.detail || "Upload failed."
        );
      }

      setUploadSuccess(true);

      setUploadStatus(
        `${data.filename || file.name} indexed successfully`
      );

      setTimeout(() => {
        setUploadStatus("");
      }, 5000);
    } catch (error) {
      console.error("Upload error:", error);

      setUploadSuccess(false);

      setUploadStatus(
        error.message ||
          "Upload failed. Please check the backend."
      );
    } finally {
      setUploading(false);
    }
  };

  const canSend =
    !loading &&
    !uploading &&
    question.trim().length > 0;

  return (
    <div className="chat-input-wrapper">

      {uploadStatus && (
        <motion.div
          className={`upload-status ${
            uploadSuccess
              ? "upload-success"
              : "upload-error"
          }`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {uploadSuccess ? (
            <FaCheckCircle />
          ) : (
            <FaExclamationCircle />
          )}

          <span>{uploadStatus}</span>
        </motion.div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleUpload}
        style={{ display: "none" }}
      />

      <div className="composer">

        <motion.button
          type="button"
          className="upload-button"
          onClick={handleUploadClick}
          disabled={uploading || loading}
          title="Upload document"
          aria-label="Upload document"
          whileHover={
            !uploading && !loading
              ? { scale: 1.04 }
              : {}
          }
          whileTap={
            !uploading && !loading
              ? { scale: 0.95 }
              : {}
          }
        >
          {uploading ? (
            <span className="upload-spinner" />
          ) : (
            <FaPaperclip />
          )}
        </motion.button>

        <textarea
          ref={textareaRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            uploading
              ? "Indexing document..."
              : "Ask OrgMind anything..."
          }
          rows={1}
          disabled={loading || uploading}
          aria-label="Message OrgMind"
        />

        <motion.button
          type="button"
          className="send-button"
          onClick={onSend}
          disabled={!canSend}
          whileHover={
            canSend ? { scale: 1.03 } : {}
          }
          whileTap={
            canSend ? { scale: 0.96 } : {}
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
        <span>📎 PDF, DOCX, TXT</span>
        <span>•</span>
        <span>Enter to send</span>
        <span>•</span>
        <span>Shift + Enter for a new line</span>
      </div>

    </div>
  );
}

export default ChatInput;