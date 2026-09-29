import { motion } from "framer-motion";

function ConflictCard({
  conflict,
  onAccept,
  onKeepOld,
}) {
  if (!conflict?.conflict) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="conflict-card"
    >
      <div className="conflict-header">
        <div className="conflict-icon">⚠️</div>

        <div>
          <h3>Potential Conflict Detected</h3>
          <p>
            OrgMind found conflicting organizational information.
          </p>
        </div>
      </div>

      <div className="conflict-section">
        <span>Previous information</span>

        <div className="old-memory">
          {conflict.old_information}
        </div>
      </div>

      <div className="conflict-arrow">
        ↓
      </div>

      <div className="conflict-section">
        <span>New information</span>

        <div className="new-memory">
          {conflict.new_information}
        </div>
      </div>

      <div className="conflict-reason">
        <strong>Why was this flagged?</strong>
        <p>{conflict.reason}</p>
      </div>

      <div className="conflict-actions">
        <button
          className="keep-button"
          onClick={onKeepOld}
        >
          Keep Previous
        </button>

        <button
          className="accept-button"
          onClick={onAccept}
        >
          Accept New Decision
        </button>
      </div>
    </motion.div>
  );
}

export default ConflictCard;