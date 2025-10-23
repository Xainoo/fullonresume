import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SkillPill from "../components/SkillPill";
import ProjectCard from "../components/ProjectCard";
import { useTranslation } from "../i18n";

// motion variants
// - container: used for staggered entrance animations of groups
// - item: used for the individual elements that will fade/slide in
const container = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

/**
 * Home page
 * - Organized into clear sections: Hero, Skills, Featured project, About.
 * - Uses framer-motion for lightweight entrance animations. Motion is
 *   intentionally subtle so it doesn't distract from the content.
 * - Semantic structure: headings follow a logical hierarchy for screen readers.
 */
export default function Home() {
  const { t } = useTranslation();
  return (
    // top-level motion section to coordinate staggered entrance animations
    <motion.section
      className="container py-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* HERO: intro, CTA buttons, and a compact profile card */}
      <div className="row align-items-center mb-5">
        <div className="col-md-7">
          <motion.h1 className="display-5 fw-bold mb-3" variants={item}>
            {t("home_title")}
          </motion.h1>
          <motion.p className="lead text-muted mb-4" variants={item}>
            {t("home_lead")}
          </motion.p>

          {/* Primary CTAs: use descriptive link text and aria where needed */}
          <motion.div className="d-flex gap-2" variants={item}>
            <Link to="/portfolio" className="btn btn-primary btn-lg">
              {t("cta_work")}
            </Link>
            <Link to="/projects" className="btn btn-outline-secondary btn-lg">
              {t("cta_projects")}
            </Link>
          </motion.div>
        </div>

        {/* Compact profile card: visual anchor in the hero */}
        <div className="col-md-5 text-center mt-4 mt-md-0">
          <motion.div
            className="hero-card p-4 rounded shadow-sm d-inline-block"
            variants={item}
            whileHover={{ scale: 1.02 }}
          >
            <div className="avatar mb-3">KP</div>
            <h3 className="h6 mb-1">Krzysztof Przystaś</h3>
            <p className="small text-muted mb-0">
              Frontend Engineer — React & TypeScript
            </p>
          </motion.div>
        </div>
      </div>

      {/* SKILLS: list of skill pills that provide interactivity via framer-motion */}
      <motion.div className="row mb-5" variants={container}>
        <div className="col-12">
          <motion.h2 className="h4 fw-bold mb-3" variants={item}>
            {t("skills")}
          </motion.h2>
          <motion.div className="d-flex flex-wrap gap-2" variants={container}>
            {[
              "React",
              "TypeScript",
              "HTML & CSS",
              "Bootstrap",
              "Performance",
              "Accessibility",
            ].map((s) => (
              <motion.div key={s} variants={item}>
                <SkillPill>{s}</SkillPill>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* FEATURED PROJECT and ABOUT sections */}
      <div className="row g-3">
        <div className="col-md-6">
          <motion.h2 className="h5 fw-bold mb-3" variants={item}>
            {t("featured_project")}
          </motion.h2>
          <ProjectCard
            title="Portfolio site"
            description="A responsive portfolio showcasing selected projects, written with React and TypeScript."
          />
        </div>

        <div className="col-md-6">
          <motion.h2 className="h5 fw-bold mb-3" variants={item}>
            {t("about")}
          </motion.h2>
          <div className="card h-100 hover-card">
            <div className="card-body">
              <p className="card-text text-muted">
                I'm passionate about building interfaces that are both beautiful
                and usable. I enjoy turning complex problems into simple,
                accessible experiences.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA: lightweight call-to-action */}
      <div className="text-center mt-5">
        <p className="text-muted small">
          {t("footer_cta")} <Link to="/portfolio">{t("cta_work")}</Link>.
        </p>
      </div>
    </motion.section>
  );
}
