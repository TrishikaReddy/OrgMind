import { motion } from "framer-motion";

function WelcomeScreen({ onPromptClick }) {
  const prompts = [
    "What are the latest decisions made by our organization?",
    "Summarize our important projects and their current status.",
  ];

  return (
    <motion.section
      className="welcome-screen"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Logo */}
      <motion.div
        className="welcome-logo"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          delay: 0.1,
        }}
      >
        🧠
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.15,
        }}
      >
        Welcome to{" "}
        <span>OrgMind</span>
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.2,
        }}
      >
        Your AI organizational memory assistant. Ask about
        decisions, projects, people, processes, knowledge,
        and everything your organization has learned.
      </motion.p>

      {/* Quick prompts */}
      <motion.div
        className="quick-prompts"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.3,
        }}
      >
        {prompts.map((prompt, index) => (
          <motion.button
            key={index}
            type="button"
            onClick={() => onPromptClick(prompt)}
            whileHover={{
              y: -3,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <span className="prompt-arrow">›</span>

            <span className="prompt-text">
              {prompt}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </motion.section>
  );
}

export default WelcomeScreen;