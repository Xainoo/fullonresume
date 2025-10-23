import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * ProjectCard
 * - Simple card used to preview a project with title, short description and link.
 * - Uses framer-motion to apply a subtle lift on hover to indicate interactivity.
 * - Props:
 *   - title: project title shown prominently.
 *   - description: short blurb about the project.
 *   - to: optional route/URL the card links to (defaults to /projects).
 */
type Props = {
  title: string;
  description: string;
  to?: string;
};

export default function ProjectCard({
  title,
  description,
  to = "/projects",
}: Props) {
  return (
    <motion.div
      className="card h-100 hover-card"
      // Hover lift provides a clear affordance that the card is clickable.
      whileHover={{ y: -6 }}
    >
      <div className="card-body">
        {/* Make the title a keyboard-focusable link for better discoverability */}
        <h5 className="card-title">
          <Link
            to={to}
            aria-label={`Open ${title}`}
            className="card-title-link"
          >
            {title}
          </Link>
        </h5>
        <p className="card-text text-muted">{description}</p>
        <Link to={to} className="stretched-link" aria-hidden="true">
          {/* visual 'View' is available via the title link; stretched-link preserves area */}
        </Link>
      </div>
    </motion.div>
  );
}
