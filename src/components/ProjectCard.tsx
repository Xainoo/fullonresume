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
  onOpen?: () => void;
  image?: string;
  actionLabel?: string;
  actionHref?: string;
};
export default function ProjectCard({
  title,
  description,
  to,
  onOpen,
  image,
  actionLabel,
  actionHref,
}: Props) {
  const clickable = !!(to || onOpen);

  function handleClick() {
    if (onOpen) return onOpen();
    // otherwise, if `to` is provided, Link will handle navigation via the title
  }

  return (
    <motion.div
      className={`card h-100 hover-card ${
        clickable ? "project-card-clickable" : ""
      }`}
      whileHover={{ y: -6 }}
      onClick={handleClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (clickable && (e.key === "Enter" || e.key === " ")) handleClick();
      }}
    >
      {image && (
        <div style={{ height: 140, overflow: "hidden" }}>
          <img
            src={image}
            alt=""
            style={{ width: "100%", objectFit: "cover" }}
          />
        </div>
      )}
      <div className="card-body">
        <h5 className="card-title">
          {to ? (
            <Link
              to={to}
              aria-label={`Open ${title}`}
              className="card-title-link"
            >
              {title}
            </Link>
          ) : (
            <span className="card-title-link">{title}</span>
          )}
        </h5>
        <p className="card-text text-muted">{description}</p>
        {actionHref && (
          <div className="mt-3">
            {actionHref.startsWith("/") ? (
              <Link
                to={actionHref}
                className="btn btn-sm btn-outline-primary"
                onClick={(e) => e.stopPropagation()}
                aria-label={actionLabel ?? "View"}
              >
                {actionLabel ?? "View"}
              </Link>
            ) : (
              <a
                href={actionHref}
                className="btn btn-sm btn-outline-primary"
                onClick={(e) => e.stopPropagation()}
              >
                {actionLabel ?? "View"}
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
