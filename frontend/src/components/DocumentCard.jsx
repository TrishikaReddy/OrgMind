import { FaFileAlt } from "react-icons/fa";
import { motion } from "framer-motion";

function DocumentCard({ filename }) {
  return (
    <motion.div
      className="document-card"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="document-icon">
        <FaFileAlt />
      </div>

      <div className="document-info">
        <strong>{filename}</strong>
        <span>Indexed</span>
      </div>

      <div className="document-status" />
    </motion.div>
  );
}

export default DocumentCard;
