import React from "react";
import { motion } from "framer-motion";

/**
 * SkillPill
 * - Small presentational component used to render a skill as a pill/badge.
 * - Uses framer-motion for a subtle hover/tap interaction to provide tactile feedback.
 * - Props:
 *   - children: the skill label (e.g. "React").
 */
type Props = {
  children: React.ReactNode;
};

export default function SkillPill({ children }: Props) {
  return (
    <motion.button
      className="badge skill-badge"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}
